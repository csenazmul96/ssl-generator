'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardBody, CardHeader, Input, Button, Avatar } from '@nextui-org/react';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [name, setName] = useState(session?.user?.name || '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password }),
            });

            if (res.ok) {
                setMsg({ type: 'success', text: 'Profile updated successfully!' });
                // Note: Session update requires reload or specific session update call
            } else {
                setMsg({ type: 'error', text: 'Failed to update profile' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Error Occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl">
            <h1 className="text-2xl font-bold">Profile Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardBody className="flex flex-col items-center gap-4 py-8">
                        <Avatar
                            src={session?.user?.image || undefined}
                            name={session?.user?.name?.[0]?.toUpperCase()}
                            className="w-24 h-24 text-large"
                            color="secondary"
                            isBordered
                        />
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{session?.user?.name}</h2>
                            <p className="text-default-500 text-sm">{session?.user?.email}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Edit Profile</h3>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                            <Input
                                label="Full Name"
                                placeholder="Your Name"
                                value={name}
                                onValueChange={setName}
                                variant="bordered"
                            />
                            <Input
                                label="New Password"
                                placeholder="Leave blank to keep current"
                                type="password"
                                value={password}
                                onValueChange={setPassword}
                                variant="bordered"
                                description="Only enter if you verify to change it"
                            />

                            {msg.text && (
                                <p className={`text-sm ${msg.type === 'success' ? 'text-success' : 'text-danger'}`}>
                                    {msg.text}
                                </p>
                            )}

                            <div className="flex justify-end mt-4">
                                <Button color="primary" type="submit" isLoading={loading}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
