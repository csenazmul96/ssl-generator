import { NextRequest, NextResponse } from 'next/server';
import { saveUser } from '@/lib/userStore';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        try {
            const user = await saveUser({
                name,
                email,
                password, // Note: Should hash password in production!
                provider: 'credentials'
            });
            return NextResponse.json(user);
        } catch (e: any) {
            return NextResponse.json({ error: e.message }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
