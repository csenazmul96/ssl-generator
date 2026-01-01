import dbConnect from './db';
import Domain from '@/models/Domain';
import AcmeOrder from '@/models/AcmeOrder';

export interface OrderState {
    domain: string;
    orderUrl: string;
    accountKey: string;
    accountUrl?: string;  // Store the account URL for reuse
    privateKey: string;
    challenge: {
        type: 'dns-01' | 'http-01';
        url: string;
        key: string;
        value: string;
    };
}

export async function saveOrder(domainName: string, state: OrderState, userId?: string) {
    await dbConnect();

    // 1. Find or Create Domain
    let domainVal = await Domain.findOne({ name: domainName });

    if (!domainVal && userId) {
        domainVal = await Domain.create({
            name: domainName,
            userId: userId,
            status: 'pending'
        });
    }

    if (!domainVal) {
        throw new Error(`Domain ${domainName} not found and no user provided to create it.`);
    }

    // 2. Clear previous orders
    await AcmeOrder.deleteMany({ domainId: domainVal._id });

    // 3. Create new order
    await AcmeOrder.create({
        domainId: domainVal._id,
        orderUrl: state.orderUrl,
        accountKey: state.accountKey,
        accountUrl: state.accountUrl || '',
        privateKey: state.privateKey,
        challengeType: state.challenge.type,
        challengeUrl: state.challenge.url,
        challengeKey: state.challenge.key,
        challengeVal: state.challenge.value
    });

    // Update domain status
    await Domain.findByIdAndUpdate(domainVal._id, { status: 'pending' });
}

export async function getOrder(domainName: string): Promise<OrderState | null> {
    await dbConnect();
    const domain = await Domain.findOne({ name: domainName });

    if (!domain) return null;

    const order = await AcmeOrder.findOne({ domainId: domain._id }).sort({ updatedAt: -1 });

    if (!order) return null;

    return {
        domain: domain.name,
        orderUrl: order.orderUrl,
        accountKey: order.accountKey,
        accountUrl: order.accountUrl,
        privateKey: order.privateKey,
        challenge: {
            type: order.challengeType as any,
            url: order.challengeUrl,
            key: order.challengeKey,
            value: order.challengeVal
        }
    };
}

export async function deleteOrder(domainName: string) {
    await dbConnect();
    const domain = await Domain.findOne({ name: domainName });
    if (domain) {
        await AcmeOrder.deleteMany({ domainId: domain._id });
    }
}
