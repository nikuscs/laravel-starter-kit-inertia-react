import { Head } from '@inertiajs/react';
import AircraftForm from '@/components/aircraft-form';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index as aircraftIndex, edit } from '@/routes/aircraft';
import type { Aircraft, AircraftStatus, BreadcrumbItem } from '@/types';

export default function Edit({
    aircraft,
    statuses,
}: {
    aircraft: Aircraft;
    statuses: AircraftStatus[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Aircraft', href: aircraftIndex() },
        { title: aircraft.name, href: edit({ aircraft: aircraft.id }) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${aircraft.name}`} />

            <div className="flex flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <Heading
                            title={`Edit ${aircraft.name}`}
                            description="Update aircraft details"
                        />
                    </CardHeader>
                    <CardContent>
                        <AircraftForm aircraft={aircraft} statuses={statuses} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
