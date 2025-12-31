'use client';

import { Button } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaChartPie, FaGlobe, FaUserCog, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { name: "Dashboard", href: "/dashboard", icon: FaChartPie },
        { name: "Domains", href: "/dashboard/domains", icon: FaGlobe },
        { name: "Profile Settings", href: "/dashboard/profile", icon: FaUserCog },
    ];

    return (
        <motion.div
            animate={{ width: collapsed ? "80px" : "260px" }}
            className="h-full border-r border-divider bg-background/50 flex flex-col relative transition-all duration-300"
        >
            <div className="flex items-center justify-between p-4 border-b border-divider h-16">
                {!collapsed && <span className="font-bold text-lg">Menu</span>}
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setCollapsed(!collapsed)}
                    className={collapsed ? "mx-auto" : ""}
                >
                    {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
                </Button>
            </div>

            <div className="flex-1 py-4 flex flex-col gap-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-default-100 text-default-500 hover:text-foreground'}`}
                        >
                            <item.icon size={22} className="min-w-[22px]" />
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="whitespace-nowrap font-medium"
                                >
                                    {item.name}
                                </motion.span>
                            )}
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-divider">
                {/* Footer or version info */}
                {!collapsed && <p className="text-xs text-default-400 text-center">v1.0.0</p>}
            </div>
        </motion.div>
    );
}
