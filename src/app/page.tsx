'use client';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Card, CardBody, Link as UILink, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@nextui-org/react";
import Link from "next/link";
import { FaLock, FaGlobe, FaShieldAlt, FaBolt, FaCheck } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";

export default function LandingPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Session-Aware Navbar */}
      <Navbar className="bg-background/60 backdrop-blur-md border-b border-divider" maxWidth="xl">
        <NavbarBrand>
          <Link href="/" className="font-bold text-inherit text-xl flex items-center gap-2">
            <span className="text-secondary text-2xl">🔒</span>
            SSL Manager
          </Link>
        </NavbarBrand>
        <NavbarContent justify="end">
          {status === 'authenticated' ? (
            <>
              <NavbarItem>
                <Button as={Link} href="/dashboard" variant="flat" color="primary">
                  Dashboard
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Avatar
                      isBordered
                      as="button"
                      className="transition-transform"
                      color="secondary"
                      name={session?.user?.name || 'User'}
                      size="sm"
                      src={session?.user?.image || undefined}
                    />
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions" variant="flat">
                    <DropdownItem key="profile" className="h-14 gap-2">
                      <p className="font-semibold">Signed in as</p>
                      <p className="font-semibold">{session?.user?.email}</p>
                    </DropdownItem>
                    <DropdownItem key="dashboard" as={Link} href="/dashboard">
                      Dashboard
                    </DropdownItem>
                    <DropdownItem key="profile-settings" as={Link} href="/dashboard/profile">
                      Profile Settings
                    </DropdownItem>
                    <DropdownItem key="logout" color="danger" onClick={() => signOut()}>
                      Log Out
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarItem>
            </>
          ) : (
            <>
              <NavbarItem className="hidden lg:flex">
                <Link href="/login" className="text-sm hover:text-primary transition-colors">Login</Link>
              </NavbarItem>
              <NavbarItem>
                <Button as={Link} color="primary" href="/register" variant="shadow">
                  Get Started
                </Button>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 mb-6">
            Secure Your Internet. <br />
            <span className="text-primary">Free & Automatic.</span>
          </h1>
          <p className="text-xl text-default-500 max-w-2xl mx-auto mb-8">
            Generate Let's Encrypt SSL certificates in seconds. Supports DNS and HTTP verification methods for complete flexibility.
          </p>
          <div className="flex justify-center gap-4">
            <Button as={Link} href="/register" color="primary" size="lg" className="font-semibold shadow-lg shadow-primary/40">
              Start Generating
            </Button>
            <Button as={Link} href="#docs" variant="bordered" size="lg">
              Read Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features / How it Works */}
      <section id="docs" className="py-20 bg-content1/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-4">
              <CardBody className="gap-4 text-center">
                <div className="mx-auto p-4 bg-primary/10 rounded-full text-primary">
                  <FaGlobe size={32} />
                </div>
                <h3 className="text-xl font-bold">1. Add Domain</h3>
                <p className="text-default-500">
                  Enter your domain name. We support any public domain you own.
                </p>
              </CardBody>
            </Card>
            <Card className="p-4">
              <CardBody className="gap-4 text-center">
                <div className="mx-auto p-4 bg-secondary/10 rounded-full text-secondary">
                  <FaShieldAlt size={32} />
                </div>
                <h3 className="text-xl font-bold">2. Verify Ownership</h3>
                <p className="text-default-500">
                  Choose between DNS-01 (TXT record) or HTTP-01 (File upload) verification methods.
                </p>
              </CardBody>
            </Card>
            <Card className="p-4">
              <CardBody className="gap-4 text-center">
                <div className="mx-auto p-4 bg-success/10 rounded-full text-success">
                  <FaBolt size={32} />
                </div>
                <h3 className="text-xl font-bold">3. Download Cert</h3>
                <p className="text-default-500">
                  Get your valid SSL certificate immediately. Install it on Nginx, Apache, or anywhere.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Documentation Detail */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Documentation</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><FaLock /> Verification Methods</h3>
              <p className="text-default-500 mb-4">
                <strong>DNS-01:</strong> Best for wildcard certificates or servers behind firewalls. You add a TXT record to your DNS settings. Can take time to propagate.
              </p>
              <p className="text-default-500">
                <strong>HTTP-01:</strong> Fastest method. You upload a specific file to your web server's <code>.well-known/acme-challenge/</code> folder. Verification is usually instant.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><FaCheck /> Installation</h3>
              <p className="text-default-500">
                Once downloaded, you will receive a ZIP file containing a <code>.crt</code> (Certificate) and <code>.key</code> (Private Key).
                Upload these to your server and configure your web server (Nginx/Apache) to point to them.
              </p>
              <div className="mt-4 p-4 bg-default-100 rounded-lg">
                <code className="text-sm">
                  server &#123;<br />
                  &nbsp;&nbsp;listen 443 ssl;<br />
                  &nbsp;&nbsp;ssl_certificate /path/to/cert.crt;<br />
                  &nbsp;&nbsp;ssl_certificate_key /path/to/key.key;<br />
                  &#125;
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-divider text-center text-default-500">
        <p>&copy; 2024 SSL Manager. Powered by Let's Encrypt.</p>
      </footer>
    </div>
  );
}
