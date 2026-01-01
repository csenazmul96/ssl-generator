'use client';

import { useState, useEffect } from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    FilterFn,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ChevronDown,
    MoreHorizontal,
    ArrowUpDown,
    Plus,
    Search,
    Loader2,
    Copy,
    Filter
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// Define the Domain type matching our API
type Domain = {
    id: string;
    name: string;
    status: "active" | "pending" | "expired";
    ssl: boolean;
    createdAt: string;
    expiresAt: string;
};

// Custom Filter Functions
const dateRangeFilter: FilterFn<Domain> = (row, columnId, value) => {
    if (value === 'all') return true;

    const dateStr = row.getValue(columnId) as string;
    if (!dateStr) return false;

    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Difference in days

    if (value === 'last-week') return diffDays <= 7;
    if (value === 'last-month') return diffDays <= 30;

    return true;
};

// Define columns
const columns: ColumnDef<Domain>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Domain
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    variant={
                        status === "active"
                            ? "default"
                            : status === "pending"
                                ? "secondary"
                                : "destructive"
                    }
                >
                    {status}
                </Badge>
            );
        },
        filterFn: "equalsString"
    },
    {
        accessorKey: "ssl",
        header: "SSL",
        cell: ({ row }) => {
            // In our DB it might be implicit based on status, but let's assume we have a boolean or derive it
            const status = row.getValue("status");
            const ssl = status === 'active';
            return (
                <Badge variant={ssl ? "default" : "outline"}>
                    {ssl ? "Enabled" : "Disabled"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const dateStr = row.getValue("createdAt") as string;
            try {
                return dateStr ? new Date(dateStr).toLocaleDateString() : "-";
            } catch (e) { return dateStr; }
        },
        filterFn: dateRangeFilter
    },
    {
        accessorKey: "expiresAt",
        header: "Expires",
        cell: ({ row }) => {
            const dateStr = row.getValue("expiresAt") as string;
            try {
                return dateStr ? new Date(dateStr).toLocaleDateString() : "-";
            } catch (e) { return dateStr; }
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const domain = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(domain.name)}
                        >
                            Copy domain name
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Manage DNS</DropdownMenuItem>
                        <DropdownMenuItem>Renew SSL</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            Delete domain
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function Domains() {
    const [data, setData] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    // Filter States
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");

    // Add Domain State
    const [newDomain, setNewDomain] = useState('');
    const [adding, setAdding] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState('');

    // Verification State
    const [verifyOpen, setVerifyOpen] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyData, setVerifyData] = useState<any>(null);
    const [verifyError, setVerifyError] = useState('');
    const [currentVerifyDomain, setCurrentVerifyDomain] = useState('');

    const fetchDomains = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/domains');
            if (res.ok) {
                const domains = await res.json();
                setData(domains);
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

    // Effect to apply custom filters to the table state
    useEffect(() => {
        const filters = [];
        if (statusFilter && statusFilter !== 'all') {
            filters.push({ id: 'status', value: statusFilter });
        }
        if (dateFilter && dateFilter !== 'all') {
            filters.push({ id: 'createdAt', value: dateFilter });
        }
        setColumnFilters(filters);
    }, [statusFilter, dateFilter]);

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
                setModalOpen(false);
                fetchDomains(); // Refresh list
            } else {
                const resData = await res.json();
                setError(resData.error || 'Failed to add domain');
            }
        } catch (e) {
            setError('Error connecting to server');
        } finally {
            setAdding(false);
        }
    };

    const handleVerify = async (domain: string, type: 'dns-01' | 'http-01') => {
        setVerifyLoading(true);
        setVerifyError('');
        setVerifyData(null);
        setCurrentVerifyDomain(domain);
        setVerifyOpen(true);

        try {
            // Requires existing session from client side, use session if needed or just rely on cookie
            const res = await fetch('/api/acme/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, challengeType: type }),
            });

            if (res.ok) {
                const data = await res.json();
                setVerifyData(data);
            } else {
                const err = await res.json();
                setVerifyError(err.error || 'Failed to generate token');
            }
        } catch (e) {
            setVerifyError('Network error');
        } finally {
            setVerifyLoading(false);
        }
    };

    const table = useReactTable({
        data,
        columns: [
            ...columns.slice(0, -1), // All columns except actions, which we redefine here to access state
            {
                id: "actions",
                cell: ({ row }) => {
                    const domain = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => navigator.clipboard.writeText(domain.name)}
                                >
                                    Copy domain name
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleVerify(domain.name, 'dns-01')}>
                                    DNS Verify
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleVerify(domain.name, 'http-01')}>
                                    HTTP Verify
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                    Delete domain
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            }
        ],
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Domains</h1>
                    <p className="text-muted-foreground">
                        Manage your registered domains
                    </p>
                </div>

                <div className="flex gap-2">
                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Domain
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Domain</DialogTitle>
                                <DialogDescription>
                                    Enter the domain name you want to secure.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="domain" className="text-right">
                                        Domain
                                    </Label>
                                    <Input
                                        id="domain"
                                        placeholder="example.com"
                                        className="col-span-3"
                                        value={newDomain}
                                        onChange={(e) => setNewDomain(e.target.value)}
                                    />
                                </div>
                                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={handleAdd} disabled={adding}>
                                    {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Domain
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Verification Dialog */}
                    <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Verification Token</DialogTitle>
                                <DialogDescription>
                                    Add this record to verify ownership of <strong>{currentVerifyDomain}</strong>
                                </DialogDescription>
                            </DialogHeader>

                            {verifyLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : verifyError ? (
                                <div className="py-4 text-center text-destructive">
                                    {verifyError}
                                </div>
                            ) : verifyData ? (
                                <div className="space-y-4 py-4">
                                    {verifyData.challengeType === 'dns-01' ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label>TXT Record Name</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input readOnly value={verifyData.key} />
                                                    <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(verifyData.key)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>TXT Record Value</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input readOnly value={verifyData.value} />
                                                    <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(verifyData.value)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <Label>File Name (URL Path)</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input readOnly value={`/.well-known/acme-challenge/${verifyData.key}`} />
                                                    <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(`/.well-known/acme-challenge/${verifyData.key}`)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>File Content</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input readOnly value={verifyData.value} />
                                                    <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(verifyData.value)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : null}

                            <DialogFooter>
                                <Button onClick={() => setVerifyOpen(false)}>Close</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Filter domains..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="pl-10"
                    />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="last-week">Last Week</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                    </SelectContent>
                </Select>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((column, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} domain(s) total.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
