import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import selfsigned from 'selfsigned';
import JSZip from 'jszip';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { domain } = body;

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        // Attributes for the certificate
        const attrs = [{ name: 'commonName', value: domain }];

        // Options: valid for 1 year
        // We explicitly add Subject Alternative Names (SANs) which are required by modern browsers
        const options = {
            days: 365,
            extensions: [{
                name: 'subjectAltName',
                altNames: [
                    { type: 2, value: domain },
                    { type: 2, value: `www.${domain}` }
                ]
            }]
        };

        // selfsigned.generate is synchronous (or returns object if callback omitted in older versions, 
        // but better to handle it safely).
        // In strict environments, we might need a wrapper, but usually it works directly.
        const pems = await (selfsigned as any).generate(attrs, options);

        const zip = new JSZip();
        zip.file(`${domain}.key`, pems.private);
        zip.file(`${domain}.crt`, pems.cert);
        // Including public key just in case
        zip.file(`${domain}.public.key`, pems.public);

        const content = await zip.generateAsync({ type: 'nodebuffer' });

        const headers = new Headers();
        headers.set('Content-Type', 'application/zip');
        headers.set('Content-Disposition', `attachment; filename="${domain}-ssl.zip"`);

        return new NextResponse(content as any, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Certificate generation error:', error);
        return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
    }
}
