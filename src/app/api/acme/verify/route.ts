import { NextRequest, NextResponse } from 'next/server';
import acme from 'acme-client';
import JSZip from 'jszip';
import { getOrder, deleteOrder } from '@/lib/orderStore';

const DIRECTORY_URL = acme.directory.letsencrypt.production;
// const DIRECTORY_URL = acme.directory.letsencrypt.staging;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { domain } = body;

        const state = await getOrder(domain);
        if (!state) {
            return NextResponse.json({ error: 'Order not found or expired' }, { status: 404 });
        }

        // Reconstruct Client
        const accountKey = typeof state.accountKey === 'string' ? JSON.parse(state.accountKey) : state.accountKey;
        const client = new acme.Client({
            directoryUrl: DIRECTORY_URL,
            accountKey: Buffer.from(accountKey), // Ensure it's a buffer if needed, usually acme-client handles obj
        });

        // Re-login to fetch account URL (required for subsequent calls)
        await client.createAccount({
            termsOfServiceAgreed: true,
            contact: [`mailto:admin@${domain}`],
        });

        // 1. Verify Challenge
        const challenge = { type: state.challenge.type, url: state.challenge.url };
        // We assume user has set the TXT record or uploaded the file.
        // The library will make the call to the ACME server to say "I'm ready".
        await client.completeChallenge(challenge as any);

        // 2. Poll for Status
        // acme-client has 'waitForValidStatus'
        await client.waitForValidStatus(challenge as any);

        // 2. Finalize Order (Generate Cert)
        // Create CSR
        // FIX: The error "URL not found" often comes from finalizing an order that isn't ready or using the wrong URL structure.
        // Let's debug specifically what state we are in.

        console.log('--- DEBUG: Finalizing Order ---');
        console.log('Challenge Type:', challenge.type);
        console.log('Order URL:', state.orderUrl);

        const [key, csr] = await acme.forge.createCsr({
            commonName: domain,
        }, state.privateKey);

        // Finalize
        // We need the full order object details (identifiers, etc). Fetch it first.
        console.log('Fetching full order from:', state.orderUrl);
        // Cast url to any because types might be strict, but client.getOrder accepts { url } or string depending on version
        const order = await client.getOrder({ url: state.orderUrl } as any);

        console.log('Sending finalize command for order.');
        try {
            const finalized = await client.finalizeOrder(order, csr);
            console.log('Finalized Order:', finalized);
            const cert = await client.getCertificate(finalized);

            // 3. Zip and Download
            const zip = new JSZip();
            zip.file(`${domain}.key`, state.privateKey);
            zip.file(`${domain}.crt`, cert);

            const content = await zip.generateAsync({ type: 'nodebuffer' });

            // Cleanup
            await deleteOrder(domain);

            // ... return response
            const headers = new Headers();
            headers.set('Content-Type', 'application/zip');
            headers.set('Content-Disposition', `attachment; filename="${domain}-public-ssl.zip"`);

            return new NextResponse(content as any, {
                status: 200,
                headers,
            });

        } catch (finalErr: any) {
            console.error('Finalize Failed:', finalErr);
            throw new Error(`Unable to finalize order: ${finalErr.message}`);
        }

    } catch (error: any) {
        console.error('ACME Verify Error:', error);
        return NextResponse.json({ error: error.message || 'Verification failed. Did you add the TXT record?' }, { status: 500 });
    }
}
