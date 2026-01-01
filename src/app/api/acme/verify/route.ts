import { NextRequest, NextResponse } from 'next/server';
import acme from 'acme-client';
import JSZip from 'jszip';
import { getOrder, deleteOrder } from '@/lib/orderStore';

// Using Staging for testing - no rate limits!
const DIRECTORY_URL = acme.directory.letsencrypt.staging;
// const DIRECTORY_URL = acme.directory.letsencrypt.production;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { domain } = body;

        const state = await getOrder(domain);
        if (!state) {
            return NextResponse.json({ error: 'Order not found or expired' }, { status: 404 });
        }

        // Reconstruct Client with the saved account key
        const accountKey = typeof state.accountKey === 'string' ? JSON.parse(state.accountKey) : state.accountKey;
        const client = new acme.Client({
            directoryUrl: DIRECTORY_URL,
            accountKey: accountKey,
        });

        // Restore the account URL from saved state (this is the KEY fix!)
        // Setting accountUrl directly prevents the client from creating a new account
        if (state.accountUrl) {
            console.log('Restoring account URL:', state.accountUrl);
            (client as any).accountUrl = state.accountUrl;
        } else {
            console.warn('No accountUrl found in saved state - this may cause issues');
        }

        console.log('--- DEBUG: Starting Verification ---');
        console.log('Challenge Type:', state.challenge.type);
        console.log('Challenge URL:', state.challenge.url);
        console.log('Order URL:', state.orderUrl);

        // 1. Complete Challenge (Tell Let's Encrypt we're ready)
        const challenge = {
            type: state.challenge.type,
            url: state.challenge.url
        };

        try {
            console.log('Completing challenge...');
            await client.completeChallenge(challenge as any);

            console.log('Waiting for challenge validation...');
            // 2. Wait for validation (this polls the ACME server)
            await client.waitForValidStatus(challenge as any);
            console.log('Challenge validated successfully!');
        } catch (challengeErr: any) {
            console.error('Challenge verification failed:', challengeErr);
            throw new Error(`Challenge verification failed: ${challengeErr.message || 'Unknown error'}`);
        }

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
