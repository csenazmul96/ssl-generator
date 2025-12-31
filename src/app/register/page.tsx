'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Input, Button, Divider, Link } from '@nextui-org/react';
import { FaGoogle, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

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
                setLoading(false);
            }
        } catch (err) {
            setError('Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[url('/grid.svg')] bg-cover relative">
            <div className="absolute inset-0 bg-background/90 z-0" />
            <div className="z-10 w-full max-w-md p-4">
                <Card className="w-full">
                    <CardHeader className="flex flex-col gap-1 items-center py-6">
                        <span className="text-4xl">🔒</span>
                        <h1 className="text-2xl font-bold">Create Account</h1>
                        <p className="text-small text-default-500">Get started with free SSL management</p>
                    </CardHeader>
                    <CardBody className="px-8 pb-8 gap-6">
                        <Button
                            variant="bordered"
                            startContent={<FaGoogle />}
                            className="w-full"
                            onPress={() => signIn('google', { callbackUrl: '/dashboard' })}
                        >
                            Sign up with Google
                        </Button>

                        <div className="flex items-center gap-2">
                            <Divider className="flex-1" />
                            <span className="text-xs text-default-400">OR</span>
                            <Divider className="flex-1" />
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                variant="bordered"
                                startContent={<FaUser className="text-default-400" />}
                                value={name}
                                onValueChange={setName}
                                isRequired
                            />
                            <Input
                                label="Email"
                                placeholder="Enter your email"
                                type="email"
                                variant="bordered"
                                startContent={<FaEnvelope className="text-default-400" />}
                                value={email}
                                onValueChange={setEmail}
                                isRequired
                            />
                            <Input
                                label="Password"
                                placeholder="Create a password"
                                type="password"
                                variant="bordered"
                                startContent={<FaLock className="text-default-400" />}
                                value={password}
                                onValueChange={setPassword}
                                isRequired
                            />

                            {error && <p className="text-danger text-sm text-center">{error}</p>}

                            <Button color="primary" type="submit" isLoading={loading} className="w-full font-semibold">
                                Sign Up
                            </Button>
                        </form>

                        <div className="text-center text-small">
                            Already have an account? <Link href="/login" size="sm">Log in</Link>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
