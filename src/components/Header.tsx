'use client';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, Button } from "@nextui-org/react";
import { useSession, signOut } from "next-auth/react";
import Link from 'next/link';

export default function Header() {
    const { data: session } = useSession();

    return (
        <Navbar className="bg-background/80 border-b border-divider" maxWidth="full" isBordered>
            <NavbarBrand>
                <Link href="/" className="font-bold text-inherit text-xl flex items-center gap-2">
                    <span className="text-secondary text-2xl">🔒</span>
                    SSL Manager
                </Link>
            </NavbarBrand>

            <NavbarContent as="div" justify="end">
                {session ? (
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar
                                isBordered
                                as="button"
                                className="transition-transform"
                                color="secondary"
                                name={session.user?.name?.[0]?.toUpperCase()}
                                size="sm"
                                src={session.user?.image || undefined}
                            />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem key="profile" className="h-14 gap-2">
                                <p className="font-semibold">Signed in as</p>
                                <p className="font-semibold">{session.user?.email}</p>
                            </DropdownItem>
                            <DropdownItem key="dashboard" href="/dashboard">Dashboard</DropdownItem>
                            <DropdownItem key="settings" href="/dashboard/profile">Profile Settings</DropdownItem>
                            <DropdownItem key="logout" color="danger" onPress={() => signOut({ callbackUrl: '/' })}>
                                Log Out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                ) : (
                    <>
                        <NavbarItem className="hidden lg:flex">
                            <Link href="/login" className="text-sm">Login</Link>
                        </NavbarItem>
                        <NavbarItem>
                            <Button as={Link} color="primary" href="/register" variant="flat" size="sm">
                                Sign Up
                            </Button>
                        </NavbarItem>
                    </>
                )}
            </NavbarContent>
        </Navbar>
    );
}
