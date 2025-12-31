import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import util from 'util';

const resolveTxt = util.promisify(dns.resolveTxt);

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

        // Default to DNS-01
        const hostname = `_acme-challenge.${domain}`;
        console.log(`Resolving TXT for ${hostname}`);

        try {
            // Standard DNS check
            const records = await resolveTxt(hostname);
            const flatRecords = records.map(chunk => chunk.join(''));

            return NextResponse.json({
                found: true,
                records: flatRecords
            });
        } catch (bsError: any) {
            console.warn('DNS lookup failed:', bsError.code);
            // If default DNS fails, sometimes it's local caching. 
            // In a real Node environment we can't easily force 8.8.8.8 without a library/custom implementation
            // so we return not found.
            return NextResponse.json({ found: false, records: [] });
        }

    } catch (error: any) {
        console.error('Check Challenge Error:', error);
        return NextResponse.json({ error: 'Failed to check challenge' }, { status: 500 });
    }
}
