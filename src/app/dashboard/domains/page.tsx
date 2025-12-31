'use client';

import { useState, useEffect } from 'react';
import DomainList from "@/components/DomainList";
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { FaPlus, FaGlobe } from 'react-icons/fa';
// import { Domain } from '@prisma/client';

export default function DomainsPage() {
    const [domains, setDomains] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // Add Domain State
    const [newDomain, setNewDomain] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    const fetchDomains = async () => {
        try {
            const res = await fetch('/api/domains');
            if (res.ok) {
                const data = await res.json();
                setDomains(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    const handleAdd = async () => {
        if (!newDomain) return;
        setAdding(true);
        setError('');

        try {
            const res = await fetch('/api/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: newDomain }),
            });

            if (res.ok) {
                setNewDomain('');
                onOpenChange(); // Close modal
                fetchDomains(); // Refresh list
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to add domain');
            }
        } catch (e) {
            setError('Error connecting to server');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manage Domains</h1>
                <Button color="primary" onPress={onOpen} startContent={<FaPlus />}>
                    Add Domain
                </Button>
            </div>

            {/* Add Domain Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Add New Domain</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Domain Name"
                                    placeholder="example.com"
                                    value={newDomain}
                                    onValueChange={setNewDomain}
                                    startContent={<FaGlobe className="text-default-400" />}
                                    variant="bordered"
                                    errorMessage={error}
                                    isInvalid={!!error}
                                />
                                <p className="text-xs text-default-500">
                                    We verify ownership via DNS or HTTP file upload.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleAdd} isLoading={adding}>
                                    Add Domain
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {loading ? (
                <div className="flex justify-center p-10">
                    <span className="loading-spinner">Loading...</span>
                </div>
            ) : (
                <DomainList domains={domains} />
            )}
        </div>
    );
}
