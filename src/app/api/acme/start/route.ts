import { NextRequest, NextResponse } from 'next/server';
import acme from 'acme-client';
import { saveOrder } from '@/lib/orderStore';

// Staging environment for testing
// const DIRECTORY_URL = acme.directory.letsencrypt.staging;
const DIRECTORY_URL = acme.directory.letsencrypt.production;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { domain, email, challengeType = 'dns-01' } = body; // supported: dns-01, http-01
        const contactEmail = email || `admin@${domain}`;

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        // 1. Initialize Client & Account (Key Generation)
        const privateKey = await acme.forge.createPrivateKey();
        const client = new acme.Client({
            directoryUrl: DIRECTORY_URL,
            accountKey: privateKey,
        });

        // Create Account
        await client.createAccount({
            termsOfServiceAgreed: true,
            contact: [`mailto:${contactEmail}`],
        });

        // 2. Create Order
        const order = await client.createOrder({
            identifiers: [{ type: 'dns', value: domain }],
        });

        // 3. Get Authorizations & Challenge
        const authorizations = await client.getAuthorizations(order);
        const authz = authorizations[0];

        // Find the requested challenge type
        const challenge = authz.challenges.find((c) => c.type === challengeType);

        if (!challenge) {
            throw new Error(`${challengeType} challenge not supported by provider for this domain`);
        }

        const keyAuthorization = await client.getChallengeKeyAuthorization(challenge);

        // Save state
        const domainPrivateKey = await acme.forge.createPrivateKey();

        // Prepare response data
        let key = '';
        let value = '';

        if (challengeType === 'dns-01') {
            key = `_acme-challenge.${domain}`;

            // For DNS-01, we need the SHA256 digest of keyAuthorization encoded in base64url
            const { createHash } = await import('crypto');
            const digest = createHash('sha256').update(keyAuthorization).digest('base64url');
            value = digest;

        } else {
            // http-01
            key = challenge.token;
            value = keyAuthorization;
        }

        saveOrder(domain, {
            domain,
            orderUrl: order.url,
            accountKey: JSON.stringify(privateKey),
            privateKey: domainPrivateKey.toString(),
            challenge: {
                type: challengeType as any,
                url: challenge.url,
                key, // DNS Host or File Name
                value, // DNS Value or File Content
            },
        });

        return NextResponse.json({
            status: 'pending_challenge',
            challengeType,
            key,
            value,
        });

    } catch (error: any) {
        console.error('ACME Start Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to start ACME order' },
            { status: 500 }
        );
    }
}
