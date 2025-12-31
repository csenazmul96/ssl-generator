import type { Metadata } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions'; // Ensure this path is correct
import { redirect } from 'next/navigation';
import DashboardClientLayout from './DashboardClientLayout';

export const metadata: Metadata = {
    title: 'Dashboard - SSL Manager',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <DashboardClientLayout>
            {children}
        </DashboardClientLayout>
    );
}
