'use client';

import { useState, useEffect } from 'react';
import { Domain } from '@/data/domains';

interface DomainListProps {
    domains: Domain[];
}

export default function DomainList({ domains }: DomainListProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [challenge, setChallenge] = useState<{ domain: string; type: 'dns-01' | 'http-01'; key: string; value: string } | null>(null);
    const [dnsCheckResult, setDnsCheckResult] = useState<{ found: boolean; records: string[] } | null>(null);

    // Restore state on load
    useEffect(() => {
        fetch('/api/acme/status')
            .then(res => res.json())
            .then(data => {
                // Check if we have any active orders for our domains
                // For simplicity, we just pick the first one matching our list to show in the UI, 
                // or we could support multi-domain state. Currently UI supports 1 modal.
                // Let's look for a match.
                for (const d of domains) {
                    if (data[d.name]) {
                        const saved = data[d.name];
                        // Compatible with both old and new save formats
                        setChallenge({
                            domain: saved.domain,
                            type: saved.challenge.type || 'dns-01',
                            key: saved.challenge.key || saved.challenge.dnsRecord,
                            value: saved.challenge.value || saved.challenge.dnsValue
                        });
                        break; // Restore the first found
                    }
                }
            })
            .catch(err => console.error('Failed to load saved state', err));
    }, [domains]);

    const handleStart = async (domain: string, type: 'dns-01' | 'http-01') => {
        setLoading(domain);
        setChallenge(null);
        setDnsCheckResult(null);

        try {
            // 1. Start Order
            const res = await fetch('/api/acme/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, challengeType: type }),
            });

            if (!res.ok) throw new Error('Failed to start order');
            const data = await res.json();

            setChallenge({
                domain: domain,
                type: type, // Store the type!
                key: data.key,
                value: data.value
            });

        } catch (error) {
            console.error(error);
            alert('Failed to start ACME order');
        } finally {
            setLoading(null);
        }
    };

    const handleVerify = async () => {
        if (!challenge) return;
        setLoading('verifying'); // use a special loading state
        try {
            const res = await fetch('/api/acme/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: challenge.domain }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Verification failed');
            }

            // Trigger download
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${challenge.domain}-public-ssl.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            setChallenge(null); // Success! Reset UI
            alert('Certificate generated and downloaded successfully!');

        } catch (error: any) {
            console.error(error);
            alert(`Verification failed: ${error.message}`);
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
                // Construct URL
                body.url = `http://${challenge.domain}/.well-known/acme-challenge/${challenge.key}`;
            }

            const response = await fetch('/api/utils/resolve-dns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            setDnsCheckResult(data);

            if (challenge.type === 'dns-01') {
                if (data.found && data.records.includes(challenge.value)) {
                    alert("✅ DNS Verified! You can now click 'Verify & Download'.");
                } else if (data.found) {
                    alert(`⚠️ Found records, but not the correct one.\nFound: ${data.records.join(', ')}\nExpected: ${challenge.value}`);
                } else {
                    alert("❌ No TXT record found yet.");
                }
            } else {
                // HTTP Check
                if (data.found && data.content === challenge.value) {
                    alert("✅ File Verified! You can now click 'Verify & Download'.");
                } else if (data.found) {
                    alert("⚠️ File found, but content doesn't match.");
                } else {
                    alert("❌ File not found (404) or server unreachable.");
                }
            }
        } catch (error) {
            console.error(error);
            alert('Failed to check challenge');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="card">

            {challenge ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2 className="table-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                        Action Required ({challenge.type === 'dns-01' ? 'DNS' : 'HTTP'})
                    </h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--muted)' }}>
                        To prove you own <strong>{challenge.domain}</strong>, please {challenge.type === 'dns-01' ? 'add this TXT record to your DNS settings.' : 'upload this file to your web server.'}
                    </p>

                    <div className="verification-box">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                                {challenge.type === 'dns-01' ? 'Host / Name' : 'File Name (Path)'}
                            </label>
                            <div className="code-block">
                                {challenge.type === 'dns-01' ? challenge.key.replace(`.${challenge.domain}`, '') : `.well-known/acme-challenge/${challenge.key}`}
                            </div>
                            {challenge.type === 'dns-01' ? (
                                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem', display: 'block' }}>
                                    (If your provider appends domain, enter only above part)
                                </span>
                            ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem', display: 'block' }}>
                                    (Create this folder if missing: .well-known/acme-challenge)
                                </span>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                                {challenge.type === 'dns-01' ? 'Value / Text' : 'File Content'}
                            </label>
                            <div className="code-block" style={{ wordBreak: 'break-all' }}>
                                {challenge.value}
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Troubleshooting:</p>
                            <button
                                onClick={checkPropagation}
                                disabled={loading === 'checking'}
                                className="btn btn-outline"
                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                            >
                                {loading === 'checking' ? 'Checking...' : (challenge.type === 'dns-01' ? '🔍 Check DNS Propagation' : '🔍 Check File Availability')}
                            </button>
                            {dnsCheckResult && !dnsCheckResult.found && challenge.type === 'dns-01' && (
                                <p style={{ color: 'var(--danger-text)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                    Record not found.
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <button
                            className="btn btn-outline"
                            onClick={() => { setChallenge(null); setDnsCheckResult(null); }}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleVerify}
                            disabled={loading === 'verifying'}
                        >
                            {loading === 'verifying' ? 'Verifying...' : 'Verify & Download'}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="table-header">
                        <h2 className="table-title">Managed Domains</h2>
                        <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{domains.length} domains</div>
                    </div>

                    <table className="domain-table">
                        <tbody>
                            {domains.map((d) => (
                                <tr key={d.id} className="domain-row">
                                    <td style={{ fontWeight: 500 }}>{d.name}</td>
                                    <td style={{ width: '1%', whiteSpace: 'nowrap', paddingRight: '2rem' }}>
                                        <span className={`status-badge status-${d.status}`}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', width: '1%' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleStart(d.name, 'dns-01')}
                                                disabled={!!loading}
                                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                                            >
                                                {loading === d.name ? '...' : 'DNS Verify'}
                                            </button>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => handleStart(d.name, 'http-01')}
                                                disabled={!!loading}
                                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                                            >
                                                {loading === d.name ? '...' : 'HTTP Verify'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}
