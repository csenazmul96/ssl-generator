'use client';

import { useState } from 'react';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                <main className="flex-1 overflow-auto p-6 bg-content1/50 relative">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
