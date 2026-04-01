import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import DeleteAircraft from '@/components/delete-aircraft';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { index as aircraftIndex, edit } from '@/routes/aircraft';
import type { Aircraft, BreadcrumbItem } from '@/types';

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

function formatDate(dateString: string | null): string | null {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function Show({ aircraft }: { aircraft: Aircraft }) {
    const [deleteOpen, setDeleteOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Aircraft', href: aircraftIndex() },
        { title: aircraft.name, href: aircraftIndex() },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={aircraft.name} />

            <div className="flex flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-xl">
                                    {aircraft.name}
                                </CardTitle>
                                <Badge variant={statusVariant[aircraft.status]}>
                                    {statusLabel[aircraft.status]}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={edit({ aircraft: aircraft.id })}
                                    >
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDeleteOpen(true)}
                                >
                                    Delete
                                </Button>
                                <DeleteAircraft
                                    aircraftId={aircraft.id}
                                    aircraftName={aircraft.name}
                                    open={deleteOpen}
                                    onOpenChange={setDeleteOpen}
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Manufacturer
                                </p>
                                <p className="font-medium">
                                    {aircraft.manufacturer}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Model
                                </p>
                                <p className="font-medium">{aircraft.model}</p>
                            </div>
                            {aircraft.location && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Location
                                    </p>
                                    <p className="font-medium">
                                        {aircraft.location}
                                    </p>
                                </div>
                            )}
                        </div>

                        {(aircraft.purchased_at ||
                            aircraft.last_flight_at ||
                            aircraft.last_maintenance_at) && (
                            <>
                                <Separator />
                                <div className="grid gap-4 sm:grid-cols-3">
                                    {aircraft.purchased_at && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Purchased
                                            </p>
                                            <p className="font-medium">
                                                {formatDate(
                                                    aircraft.purchased_at,
                                                )}
                                            </p>
                                        </div>
                                    )}
                                    {aircraft.last_flight_at && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Last flight
                                            </p>
                                            <p className="font-medium">
                                                {formatDate(
                                                    aircraft.last_flight_at,
                                                )}
                                            </p>
                                        </div>
                                    )}
                                    {aircraft.last_maintenance_at && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Last maintenance
                                            </p>
                                            <p className="font-medium">
                                                {formatDate(
                                                    aircraft.last_maintenance_at,
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {aircraft.notes && (
                            <>
                                <Separator />
                                <div>
                                    <p className="mb-1 text-sm text-muted-foreground">
                                        Notes
                                    </p>
                                    <p className="text-sm">{aircraft.notes}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
