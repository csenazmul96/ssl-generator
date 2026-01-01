'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                // Auto login
                const loginRes = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                });
                if (loginRes?.error) {
                    router.push('/login');
                } else {
                    router.push('/dashboard');
                }
            } else {
                const data = await res.json();
                setError(data.error || 'Registration failed');
                setIsLoading(false);
            }
        } catch (err) {
            setError("Something went wrong");
            setIsLoading(false);
        }
    };

    return (
        <div className="grid min-h-screen w-screen lg:grid-cols-2">
            {/* Left side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="mx-auto w-full max-w-sm space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-lg">
                            S
                        </div>
                        <span className="text-xl font-semibold">SSL Generator</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
                        <p className="text-muted-foreground">
                            Enter your details to get started
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right side - Cover Image */}
            <div className="relative hidden lg:block">
                <div className="absolute inset-0">
                    <img
                        src="/login-cover.jpg"
                        alt="SSL security background"
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-background/30" />
                <div className="relative z-10 flex h-full flex-col items-center justify-center p-10">
                    <img
                        src="/ssl-tech-icon.png"
                        alt="SSL Certificate"
                        className="h-64 w-64 object-contain"
                    />
                    <div className="mt-8 text-center">
                        <h2 className="text-2xl font-bold text-foreground">Join the Secure Web</h2>
                        <p className="mt-2 text-muted-foreground max-w-md">
                            Start managing your SSL certificates with enterprise-grade security tools today.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
