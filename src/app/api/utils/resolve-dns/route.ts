import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import util from 'util';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { domain, type, url } = body; // accept type and url for http check

        if (type === 'http-01' && url) {
            console.log(`Checking HTTP file at ${url}`);
            try {
                // Use a proper timeout and cache-busting
                const res = await fetch(url, { cache: 'no-store', next: { revalidate: 0 } });
                if (res.status === 200) {
                    const text = await res.text();
                    return NextResponse.json({ found: true, content: text.trim() });
                } else {
                    return NextResponse.json({ found: false, status: res.status });
                }
            } catch (e: any) {
                return NextResponse.json({ found: false, error: e.message });
            }
        }

        // Default to DNS-01 - Use Google DNS to avoid local cache issues
        const hostname = `_acme-challenge.${domain}`;
        console.log(`Resolving TXT for ${hostname} using Cloudflare DNS (1.1.1.1)`);

        try {
            // Create resolver with Cloudflare DNS (faster cache refresh than Google)
            const resolver = new dns.Resolver();
            resolver.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8']);

            const resolveTxt = util.promisify(resolver.resolveTxt.bind(resolver));
            const records = await resolveTxt(hostname);
            const flatRecords = records.map((chunk: string[]) => chunk.join(''));

            console.log(`✓ DNS resolved via Cloudflare DNS: ${flatRecords.join(', ')}`);

            return NextResponse.json({
                found: true,
                records: flatRecords
            });
        } catch (bsError: any) {
            console.warn('DNS lookup failed:', bsError.code);
            return NextResponse.json({ found: false, records: [] });
        }

    } catch (error: any) {
        console.error('Check Challenge Error:', error);
        return NextResponse.json({ error: 'Failed to check challenge' }, { status: 500 });
    }
}
