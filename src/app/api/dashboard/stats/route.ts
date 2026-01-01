import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import Domain from "@/models/Domain";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await dbConnect();

        // @ts-ignore - session.user.id is added in authOptions callback
        const userId = session.user.id as string;

        // Fetch all domains for the user
        const domains = await Domain.find({ userId }).sort({ updatedAt: -1 });

        const total = domains.length;
        const active = domains.filter((d: any) => d.status === 'active').length;
        const pending = domains.filter((d: any) => d.status === 'pending').length;

        // Calculate expiring (expires within 30 days)
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiring = domains.filter((d: any) =>
            d.expiresAt &&
            new Date(d.expiresAt) > now &&
            new Date(d.expiresAt) <= thirtyDaysFromNow
        ).length;

        // Calculate changes (vs 30 days ago)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const prevTotal = domains.filter((d: any) => new Date(d.createdAt) < thirtyDaysAgo).length;
        // Proxy for previous status counts based on creation time (assuming status stability for simplicity)
        const prevActive = domains.filter((d: any) => d.status === 'active' && new Date(d.createdAt) < thirtyDaysAgo).length;
        const prevPending = domains.filter((d: any) => d.status === 'pending' && new Date(d.createdAt) < thirtyDaysAgo).length;

        const calculateChange = (current: number, previous: number): string => {
            if (previous === 0) return current > 0 ? "+100%" : "0%";
            const percent = ((current - previous) / previous) * 100;
            return (percent > 0 ? "+" : "") + Math.round(percent) + "%";
        };

        const determineTrend = (changeStr: string, isBadIfHigh: boolean = false): string => {
            const num = parseInt(changeStr.replace('%', '').replace('+', ''));
            if (num === 0) return "neutral";
            if (num > 0) return isBadIfHigh ? "down" : "up"; // "down" means bad trend
            return isBadIfHigh ? "up" : "down";
        };

        const stats = {
            total: {
                value: total,
                change: calculateChange(total, prevTotal),
                trend: determineTrend(calculateChange(total, prevTotal))
            },
            active: {
                value: active,
                change: calculateChange(active, prevActive),
                trend: determineTrend(calculateChange(active, prevActive))
            },
            pending: {
                value: pending,
                change: calculateChange(pending, prevPending),
                trend: determineTrend(calculateChange(pending, prevPending), true)
            },
            expiring: {
                value: expiring,
                change: "0%",
                trend: "neutral"
            }
        };

        // Get recent activity (top 5 most recently updated)
        const recentActivity = domains.slice(0, 5).map((d: any) => ({
            id: d._id.toString(),
            action: d.status === 'pending' ? 'Domain added' : `Status update: ${d.status}`,
            domain: d.name,
            time: new Date(d.updatedAt).toLocaleDateString(),
            timestamp: d.updatedAt
        }));

        return NextResponse.json({
            stats,
            recentActivity
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
