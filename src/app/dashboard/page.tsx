'use client';

import { Card, CardBody } from "@nextui-org/react";
import { useEffect, useState } from "react";
// import { domains } from "@/data/domains";
import { FaGlobe, FaCheckCircle, FaExclamationTriangle, FaClock } from "react-icons/fa";

export default function DashboardPage() {
    const [stats, setStats] = useState([
        { title: "Total Domains", value: 0, icon: FaGlobe, color: "text-primary" },
        { title: "Active Certificates", value: 0, icon: FaCheckCircle, color: "text-success" },
        { title: "Pending Verification", value: 0, icon: FaClock, color: "text-warning" },
        { title: "Expiring / Expired", value: 0, icon: FaExclamationTriangle, color: "text-danger" },
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
                    { title: "Total Domains", value: total, icon: FaGlobe, color: "text-primary" },
                    { title: "Active Certificates", value: active, icon: FaCheckCircle, color: "text-success" },
                    { title: "Pending Verification", value: pending, icon: FaClock, color: "text-warning" },
                    { title: "Expiring / Expired", value: expired, icon: FaExclamationTriangle, color: "text-danger" },
                ]);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardBody className="flex flex-row items-center gap-4 p-6">
                            <div className={`p-3 rounded-full bg-default-100 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-default-500 text-sm">{stat.title}</p>
                                <h2 className="text-2xl font-bold">{stat.value}</h2>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Recent Activity or Quick Actions could go here */}
            <Card className="mt-6">
                <CardBody>
                    <h3 className="text-lg font-semibold mb-4">Quick Start Guide</h3>
                    <p className="text-default-500">
                        To generate a new certificate, go to the <strong>Domains</strong> page, find your domain (or add it to data/domains.ts), and click Verify.
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
