'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    LayoutDashboard,
    Globe,
    Users,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    ShieldCheck,
    Clock,
    AlertTriangle
} from "lucide-react";
import Link from 'next/link';

// Mock recent activity until we have a real backend for it
const recentActivity = [
    { id: 1, action: "Domain added", domain: "example.com", time: "2 hours ago" },
    { id: 2, action: "SSL renewed", domain: "test.org", time: "4 hours ago" },
    { id: 3, action: "DNS updated", domain: "demo.io", time: "6 hours ago" },
    { id: 4, action: "Domain verified", domain: "app.dev", time: "8 hours ago" },
];

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState([
        {
            title: "Total Domains",
            value: "0",
            change: "+0%",
            trend: "up",
            icon: Globe
        },
        {
            title: "Active Certs",
            value: "0",
            change: "+0%",
            trend: "up",
            icon: ShieldCheck
        },
        {
            title: "Pending",
            value: "0",
            change: "0%",
            trend: "neutral",
            icon: Clock
        },
        {
            title: "Expiring",
            value: "0",
            change: "0%",
            trend: "down",
            icon: AlertTriangle
        },
    ]);

    useEffect(() => {
        fetch('/api/domains')
            .then(res => res.json())
            .then(data => {
                const total = data.length || 0;
                // @ts-ignore
                const active = data.filter(d => d.status === 'active').length;
                // @ts-ignore
                const pending = data.filter(d => d.status === 'pending').length;
                // @ts-ignore
                const expired = data.filter(d => d.status === 'expired').length;

                setStats([
                    {
                        title: "Total Domains",
                        value: total.toString(),
                        change: "+12%", // Mock trend
                        trend: "up",
                        icon: Globe
                    },
                    {
                        title: "Active Certs",
                        value: active.toString(),
                        change: "+23%", // Mock trend
                        trend: "up",
                        icon: ShieldCheck
                    },
                    {
                        title: "Pending",
                        value: pending.toString(),
                        change: "-5%", // Mock trend
                        trend: "down",
                        icon: Clock
                    },
                    {
                        title: "Expiring",
                        value: expired.toString(),
                        change: "0%", // Mock trend
                        trend: "neutral",
                        icon: AlertTriangle
                    },
                ]);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {session?.user?.name || "User"}!
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                {stat.trend === "up" ? (
                                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                                ) : stat.trend === "down" ? (
                                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                                ) : (
                                    <Activity className="h-3 w-3 text-yellow-500" />
                                )}
                                <span
                                    className={
                                        stat.trend === "up" ? "text-green-500" :
                                            stat.trend === "down" ? "text-red-500" : "text-yellow-500"
                                    }
                                >
                                    {stat.change}
                                </span>
                                <span>from last month</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest actions in your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">{activity.action}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {activity.domain}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <Link href="/dashboard/domains" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors">
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Add New Domain</p>
                                    <p className="text-xs text-muted-foreground">
                                        Register a new domain
                                    </p>
                                </div>
                            </Link>
                            <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors opacity-50">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Manage Users</p>
                                    <p className="text-xs text-muted-foreground">
                                        (Coming Soon)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors opacity-50">
                                <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">View Reports</p>
                                    <p className="text-xs text-muted-foreground">
                                        (Coming Soon)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
