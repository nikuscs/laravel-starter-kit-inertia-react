import { Head } from '@inertiajs/react';
import AircraftForm from '@/components/aircraft-form';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index as aircraftIndex, create } from '@/routes/aircraft';
import type { AircraftStatus, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Aircraft', href: aircraftIndex() },
    { title: 'Add aircraft', href: create() },
];

export default function Create({
    statuses,
}: {
    statuses: AircraftStatus[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add aircraft" />

            <div className="flex flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <Heading
                            title="Add aircraft"
                            description="Add a new aircraft to your inventory"
                        />
                    </CardHeader>
                    <CardContent>
                        <AircraftForm statuses={statuses} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
