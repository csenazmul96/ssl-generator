'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { Lock, Globe, ShieldCheck, Zap, Check, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LandingPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Lock className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">SSL Manager</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {status === 'authenticated' ? (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User"} />
                        <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="container px-4 relative z-10 text-center">
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 mb-6">
            Secure Your Internet. <br />
            <span className="text-primary">Free & Automatic.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Generate Let's Encrypt SSL certificates in seconds. Supports DNS and HTTP verification methods for complete flexibility.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="font-semibold shadow-lg">
              <Link href="/register">Start Generating</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#docs">Read Documentation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features / How it Works */}
      <section id="docs" className="py-20 bg-muted/50">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg border shadow-sm flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-bold">1. Add Domain</h3>
              <p className="text-muted-foreground">
                Enter your domain name. We support any public domain you own.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm flex flex-col items-center gap-4">
              <div className="p-4 bg-secondary/10 rounded-full text-secondary">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold">2. Verify Ownership</h3>
              <p className="text-muted-foreground">
                Choose between DNS-01 (TXT record) or HTTP-01 (File upload) verification methods.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm flex flex-col items-center gap-4">
              <div className="p-4 bg-green-500/10 rounded-full text-green-500">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold">3. Download Cert</h3>
              <p className="text-muted-foreground">
                Get your valid SSL certificate immediately. Install it on Nginx, Apache, or anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Detail */}
      <section className="py-20">
        <div className="container px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Documentation</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Lock className="h-5 w-5" /> Verification Methods</h3>
              <p className="text-muted-foreground mb-4">
                <strong>DNS-01:</strong> Best for wildcard certificates or servers behind firewalls. You add a TXT record to your DNS settings. Can take time to propagate.
              </p>
              <p className="text-muted-foreground">
                <strong>HTTP-01:</strong> Fastest method. You upload a specific file to your web server's <code>.well-known/acme-challenge/</code> folder. Verification is usually instant.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Check className="h-5 w-5" /> Installation</h3>
              <p className="text-muted-foreground">
                Once downloaded, you will receive a ZIP file containing a <code>.crt</code> (Certificate) and <code>.key</code> (Private Key).
                Upload these to your server and configure your web server (Nginx/Apache) to point to them.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg border">
                <code className="text-sm font-mono text-foreground">
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

      <footer className="py-8 border-t bg-muted/30 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} SSL Manager. Powered by Let's Encrypt.</p>
      </footer>
    </div>
  );
}
