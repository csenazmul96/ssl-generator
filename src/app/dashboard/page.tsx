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
    AlertTriangle,
    Loader2
} from "lucide-react";
import Link from 'next/link';

interface ActivityItem {
    id: string;
    action: string;
    domain: string;
    time: string;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [stats, setStats] = useState([
        {
            title: "Total Domains",
            value: "0",
            change: "+0%",
            trend: "neutral",
            icon: Globe
        },
        {
            title: "Active Certs",
            value: "0",
            change: "+0%",
            trend: "neutral",
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
            trend: "neutral",
            icon: AlertTriangle
        },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const data = await res.json();
                    console.log("DASHBOARD DATA:", data);

                    setStats([
                        {
                            title: "Total Domains",
                            value: data.stats.total.value.toString(),
                            change: data.stats.total.change,
                            trend: data.stats.total.trend,
                            icon: Globe
                        },
                        {
                            title: "Active Certs",
                            value: data.stats.active.value.toString(),
                            change: data.stats.active.change,
                            trend: data.stats.active.trend,
                            icon: ShieldCheck
                        },
                        {
                            title: "Pending",
                            value: data.stats.pending.value.toString(),
                            change: data.stats.pending.change,
                            trend: data.stats.pending.trend,
                            icon: Clock
                        },
                        {
                            title: "Expiring",
                            value: data.stats.expiring.value.toString(),
                            change: data.stats.expiring.change,
                            trend: data.stats.expiring.trend,
                            icon: AlertTriangle
                        },
                    ]);

                    setRecentActivity(data.recentActivity);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session) {
            fetchData();
        }
    }, [session]);

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
                            {isLoading ? (
                                <div className="h-8 w-8 animate-pulse bg-muted rounded"></div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        {stat.trend === "up" ? (
                                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                                        ) : stat.trend === "down" ? (
                                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                                        ) : (
                                            <Activity className="h-3 w-3 text-muted-foreground" />
                                        )}
                                        <span
                                            className={
                                                stat.trend === "up" ? "text-green-500" :
                                                    stat.trend === "down" ? "text-red-500" : "text-muted-foreground"
                                            }
                                        >
                                            {stat.change === "0%" ? "No change" : stat.change}
                                        </span>
                                        {stat.change !== "0%" && <span>from last month</span>}
                                    </p>
                                </>
                            )}
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
                        {isLoading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : recentActivity.length > 0 ? (
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
                        ) : (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                No recent activity
                            </div>
                        )}
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
