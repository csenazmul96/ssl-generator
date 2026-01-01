import type { Metadata } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
    title: 'Dashboard - SSL Manager',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 overflow-auto p-6 pb-16">
                    {children}
                </main>
                <Footer />
            </div>
        </SidebarProvider>
    );
}
