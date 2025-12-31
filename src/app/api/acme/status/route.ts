import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'acme-orders.json');

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!fs.existsSync(DATA_FILE)) {
        return NextResponse.json({});
    }
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const json = JSON.parse(data);
        return NextResponse.json(json);
    } catch (e) {
        return NextResponse.json({});
    }
}
