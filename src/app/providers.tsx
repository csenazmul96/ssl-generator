'use client';

import { NextUIProvider } from '@nextui-org/react';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <SessionProvider>
            <NextUIProvider navigate={router.push}>
                <main className="dark text-foreground bg-background min-h-screen">
                    {children}
                </main>
            </NextUIProvider>
        </SessionProvider>
    );
}
