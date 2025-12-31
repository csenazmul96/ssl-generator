import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Domain from '@/models/Domain';
import AcmeOrder from '@/models/AcmeOrder';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({});
    }
    // @ts-ignore
    const userId = session.user.id;

    try {
        await dbConnect();

        const domains = await Domain.find({ userId });
        const domainIds = domains.map(d => d._id);
        const domainMap = new Map(domains.map(d => [d._id.toString(), d.name]));

        const orders = await AcmeOrder.find({ domainId: { $in: domainIds } });

        const result: Record<string, any> = {};
        for (const order of orders) {
            const dName = domainMap.get(order.domainId.toString());
            if (!dName) continue;

            result[dName] = {
                domain: dName,
                orderUrl: order.orderUrl,
                accountKey: order.accountKey,
                privateKey: order.privateKey,
                challenge: {
                    type: order.challengeType,
                    url: order.challengeUrl,
                    key: order.challengeKey,
                    value: order.challengeVal
                }
            };
        }

        return NextResponse.json(result);
    } catch (e) {
        console.error(e);
        return NextResponse.json({});
    }
}
