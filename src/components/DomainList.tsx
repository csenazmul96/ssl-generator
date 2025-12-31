'use client';

import { useState, useEffect } from 'react';
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Snippet, Tooltip
} from "@nextui-org/react";
import { FaCheck, FaCopy, FaDownload, FaSyncAlt } from 'react-icons/fa';

interface Domain {
    id: string;
    userId: string;
    name: string;
    status: string;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface DomainListProps {
    domains: Domain[];
}

export default function DomainList({ domains }: DomainListProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [challenge, setChallenge] = useState<{ domain: string; type: 'dns-01' | 'http-01'; key: string; value: string } | null>(null);
    const [dnsCheckResult, setDnsCheckResult] = useState<{ found: boolean; records: string[]; content?: string; status?: number } | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // Restore state on load
    useEffect(() => {
        fetch('/api/acme/status')
            .then(res => res.json())
            .then(data => {
                for (const d of domains) {
                    if (data[d.name]) {
                        const saved = data[d.name];
                        setChallenge({
                            domain: saved.domain,
                            type: saved.challenge.type || 'dns-01',
                            key: saved.challenge.key || saved.challenge.dnsRecord,
                            value: saved.challenge.value || saved.challenge.dnsValue
                        });
                        onOpen();
                        break;
                    }
                }
            })
            .catch(err => console.error('Failed to load saved state', err));
    }, [domains, onOpen]);

    const handleStart = async (domain: string, type: 'dns-01' | 'http-01') => {
        setLoading(domain);
        setChallenge(null);
        setDnsCheckResult(null);

        try {
            const res = await fetch('/api/acme/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, challengeType: type }),
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setChallenge({
                domain: domain,
                type: type,
                key: data.key,
                value: data.value
            });
            onOpen(); // Open the modal
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(null);
        }
    };

    const checkPropagation = async () => {
        if (!challenge) return;
        setLoading('checking');
        setDnsCheckResult(null);

        try {
            const body: any = { domain: challenge.domain, type: challenge.type };
            if (challenge.type === 'http-01') {
                body.url = `http://${challenge.domain}/.well-known/acme-challenge/${challenge.key}`;
            }

            const response = await fetch('/api/utils/resolve-dns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            setDnsCheckResult(data);

            // Simple notification logic (could be improved with toasts)
            // Ideally we just show status in the UI, which we do below
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(null);
        }
    };

    const handleVerify = async () => {
        if (!challenge) return;
        setLoading('verifying');

        try {
            const res = await fetch('/api/acme/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: challenge.domain }),
            });

            if (res.status === 200) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${challenge.domain}-public-ssl.zip`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setChallenge(null); // Success!
                onOpenChange(); // Close modal
                alert('Success! Certificate downloaded.');
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(null);
        }
    };

    const handleCancel = () => {
        setChallenge(null);
        setDnsCheckResult(null);
        onOpenChange(); // Close
        // Optionally call API to delete order from store
    };

    const statusMap = {
        active: "success",
        pending: "warning",
        expired: "danger",
    };

    return (
        <>
            <Table aria-label="Domains Table">
                <TableHeader>
                    <TableColumn>DOMAIN</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn align="end">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                    {domains.map((d) => (
                        <TableRow key={d.id}>
                            <TableCell className="font-medium">{d.name}</TableCell>
                            <TableCell>
                                <Chip color={statusMap[d.status] as any} size="sm" variant="flat">
                                    {d.status.toUpperCase()}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-2">
                                    <Tooltip content="DNS Verification (Requires propagation)">
                                        <Button
                                            size="sm"
                                            color="primary"
                                            variant="flat"
                                            isLoading={loading === d.name}
                                            onPress={() => handleStart(d.name, 'dns-01')}
                                        >
                                            DNS Verify
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="HTTP Verification (Instant)">
                                        <Button
                                            size="sm"
                                            color="secondary"
                                            variant="flat"
                                            isLoading={loading === d.name}
                                            onPress={() => handleStart(d.name, 'http-01')}
                                        >
                                            HTTP Verify
                                        </Button>
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                isDismissable={false}
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Verify Ownership via {challenge?.type === 'dns-01' ? 'DNS' : 'HTTP'}
                            </ModalHeader>
                            <ModalBody>
                                {challenge && (
                                    <div className="flex flex-col gap-4">
                                        <p className="text-sm text-default-500">
                                            {challenge.type === 'dns-01'
                                                ? "Create a TXT record in your DNS provider with the following details:"
                                                : "Create a file on your web server with the following name and content:"}
                                        </p>

                                        <div className="bg-content2 p-4 rounded-lg flex flex-col gap-4">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-xs font-bold text-default-400 uppercase">
                                                    {challenge.type === 'dns-01' ? 'Host / Name' : 'File Name (Path: .well-known/acme-challenge/)'}
                                                </span>
                                                <Snippet
                                                    symbol=""
                                                    className="w-full max-w-full"
                                                    codeString={challenge.key}
                                                    classNames={{
                                                        pre: "overflow-x-auto",
                                                    }}
                                                >
                                                    <span className="break-all">{challenge.key}</span>
                                                </Snippet>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <span className="text-xs font-bold text-default-400 uppercase">
                                                    {challenge.type === 'dns-01' ? 'Value' : 'File Content'}
                                                </span>
                                                <Snippet
                                                    symbol=""
                                                    className="w-full max-w-full"
                                                    codeString={challenge.value}
                                                    classNames={{
                                                        pre: "overflow-x-auto whitespace-pre-wrap break-all",
                                                    }}
                                                >
                                                    <span className="break-all text-xs">{challenge.value}</span>
                                                </Snippet>
                                            </div>
                                        </div>

                                        {/* Status Check Results */}
                                        {dnsCheckResult && (
                                            <div className={`p-3 rounded-lg text-sm border ${dnsCheckResult.found ? (
                                                (challenge.type === 'dns-01' && dnsCheckResult.records.includes(challenge.value)) ||
                                                    (challenge.type === 'http-01' && dnsCheckResult.content === challenge.value)
                                                    ? 'bg-success/10 border-success text-success' : 'bg-warning/10 border-warning text-warning'
                                            ) : 'bg-danger/10 border-danger text-danger'}`}>
                                                {dnsCheckResult.found ? (
                                                    (challenge.type === 'dns-01' && dnsCheckResult.records.includes(challenge.value)) ||
                                                        (challenge.type === 'http-01' && dnsCheckResult.content === challenge.value)
                                                        ? "✅ Verified! You can now download the certificate."
                                                        : `⚠️ Found resource, but content doesn't match. (Found: ${challenge.type === 'dns-01' ? dnsCheckResult.records[0] : 'incorrect content'})`
                                                ) : "❌ Resource not found yet."}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={handleCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    color="warning"
                                    variant="flat"
                                    onPress={checkPropagation}
                                    isLoading={loading === 'checking'}
                                    startContent={!loading && <FaSyncAlt />}
                                >
                                    Check {challenge?.type === 'dns-01' ? 'DNS' : 'File'}
                                </Button>
                                <Button
                                    color="success"
                                    onPress={handleVerify}
                                    isLoading={loading === 'verifying'}
                                    startContent={!loading && <FaDownload />}
                                >
                                    Verify & Download
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
