'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Input, Button, Divider, Link } from '@nextui-org/react';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError('Invalid email or password');
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[url('/grid.svg')] bg-cover relative">
            <div className="absolute inset-0 bg-background/90 z-0" />
            <div className="z-10 w-full max-w-md p-4">
                <Card className="w-full">
                    <CardHeader className="flex flex-col gap-1 items-center py-6">
                        <span className="text-4xl">🔒</span>
                        <h1 className="text-2xl font-bold">Welcome Back</h1>
                        <p className="text-small text-default-500">Log in to manage your SSL certificates</p>
                    </CardHeader>
                    <CardBody className="px-8 pb-8 gap-6">
                        <Button
                            variant="bordered"
                            startContent={<FaGoogle />}
                            className="w-full"
                            onPress={() => signIn('google', { callbackUrl: '/dashboard' })}
                        >
                            Continue with Google
                        </Button>

                        <div className="flex items-center gap-2">
                            <Divider className="flex-1" />
                            <span className="text-xs text-default-400">OR</span>
                            <Divider className="flex-1" />
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                                placeholder="Enter your password"
                                type="password"
                                variant="bordered"
                                startContent={<FaLock className="text-default-400" />}
                                value={password}
                                onValueChange={setPassword}
                                isRequired
                            />

                            {error && <p className="text-danger text-sm text-center">{error}</p>}

                            <div className="flex justify-between items-center text-small">
                                <Link href="#" size="sm" color="foreground" className="text-default-500">Remember me</Link>
                                <Link href="#" size="sm" color="primary">Forgot password?</Link>
                            </div>

                            <Button color="primary" type="submit" isLoading={loading} className="w-full font-semibold">
                                Log In
                            </Button>
                        </form>

                        <div className="text-center text-small">
                            Don't have an account? <Link href="/register" size="sm">Sign up</Link>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
