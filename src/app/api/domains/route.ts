import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Domain from '@/models/Domain';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // @ts-ignore
    const userId = session.user.id;

    try {
        await dbConnect();
        const domains = await Domain.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json(domains);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // @ts-ignore
    const userId = session.user.id;

    try {
        await dbConnect();
        const { domain } = await req.json();
        if (!domain) return NextResponse.json({ error: 'Domain name required' }, { status: 400 });

        // Manual check for uniqueness
        const existing = await Domain.findOne({ name: domain });
        if (existing) {
            return NextResponse.json({ error: 'Domain already exists' }, { status: 409 });
        }

        const newDomain = await Domain.create({
            name: domain,
            userId: userId,
            status: 'pending'
        });

        return NextResponse.json(newDomain);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to create domain' }, { status: 500 });
    }
}
