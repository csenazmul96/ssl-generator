import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'acme-orders.json');

export interface OrderState {
    domain: string;
    orderUrl: string;
    accountKey: string; // JSON stringified
    privateKey: string; // DOMAIN private key, JSON stringified or PEM
    challenge: {
        type: 'dns-01' | 'http-01';
        url: string;
        // For DNS: key=_acme-challenge.domain, value=digest
        // For HTTP: key=token (filename), value=keyAuthorization (file content)
        key: string;
        value: string;
    };
}

export function saveOrder(domain: string, state: OrderState) {
    let data: Record<string, OrderState> = {};
    if (fs.existsSync(DATA_FILE)) {
        try {
            data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        } catch (e) {
            console.warn('Failed to parse order file, starting fresh', e);
        }
    }
    data[domain] = state;
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Failed to write order file:', err);
        throw err;
    }
}

export function getOrder(domain: string): OrderState | null {
    if (!fs.existsSync(DATA_FILE)) return null;
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        return data[domain] || null;
    } catch (e) {
        return null;
    }
}

export function deleteOrder(domain: string) {
    if (!fs.existsSync(DATA_FILE)) return;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    delete data[domain];
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
