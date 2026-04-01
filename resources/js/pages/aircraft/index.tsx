import { Head, Link, router } from '@inertiajs/react';
import { EllipsisVertical, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DeleteAircraft from '@/components/delete-aircraft';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { index as aircraftIndex, create, show, edit } from '@/routes/aircraft';
import type { Aircraft, BreadcrumbItem, PaginatedAircraft } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Aircraft', href: aircraftIndex() },
];

const statusVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    active: 'default',
    maintenance: 'outline',
    storage: 'secondary',
    retired: 'destructive',
};

const statusLabel: Record<string, string> = {
    active: 'Active',
    maintenance: 'In Maintenance',
    storage: 'In Storage',
    retired: 'Retired',
};

function AircraftActions({ aircraft }: { aircraft: Aircraft }) {
    const [deleteOpen, setDeleteOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                        <EllipsisVertical className="size-4" />
                        <span className="sr-only">Actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onSelect={() =>
                            router.visit(show({ aircraft: aircraft.id }))
                        }
                    >
                        <Eye className="size-4" />
                        View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() =>
                            router.visit(edit({ aircraft: aircraft.id }))
                        }
                    >
                        <Pencil className="size-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeleteOpen(true)}
                    >
                        <Trash2 className="size-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteAircraft
                aircraftId={aircraft.id}
                aircraftName={aircraft.name}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </>
    );
}

export default function Index({ aircraft }: { aircraft: PaginatedAircraft }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Aircraft" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Aircraft
                    </h1>
                    <Button asChild size="sm">
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add aircraft
                        </Link>
                    </Button>
                </div>

                {aircraft.data.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                        No aircraft yet. Add your first one to get started.
                    </p>
                ) : (
                    <div className="grid gap-1">
                        {aircraft.data.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg border border-sidebar-border/70 px-3 py-2 dark:border-sidebar-border"
                            >
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {item.name}
                                            </span>
                                            <Badge
                                                variant={
                                                    statusVariant[item.status]
                                                }
                                                className="text-xs"
                                            >
                                                {statusLabel[item.status]}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {item.manufacturer} {item.model}
                                            {item.location && (
                                                <> &middot; {item.location}</>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <AircraftActions aircraft={item} />
                            </div>
                        ))}
                    </div>
                )}

                {aircraft.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {aircraft.prev_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={aircraft.prev_page_url}>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="text-sm text-muted-foreground">
                            Page {aircraft.current_page} of{' '}
                            {aircraft.last_page}
                        </span>
                        {aircraft.next_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={aircraft.next_page_url}>Next</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
