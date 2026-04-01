import { Form } from '@inertiajs/react';
import AircraftController from '@/actions/App/Http/Controllers/AircraftController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Aircraft, AircraftStatus } from '@/types';

interface AircraftFormProps {
    aircraft?: Aircraft;
    statuses: AircraftStatus[];
}

const statusLabels: Record<AircraftStatus, string> = {
    active: 'Active',
    maintenance: 'In Maintenance',
    storage: 'In Storage',
    retired: 'Retired',
};

export default function AircraftForm({
    aircraft,
    statuses,
}: AircraftFormProps) {
    const isEditing = !!aircraft;

    const formAction = isEditing
        ? AircraftController.update.form({ aircraft: aircraft.id })
        : AircraftController.store.form();

    return (
        <Form {...formAction} className="space-y-6">
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={aircraft?.name}
                                required
                                placeholder="e.g. AB-123"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="manufacturer">Manufacturer</Label>
                            <Input
                                id="manufacturer"
                                name="manufacturer"
                                defaultValue={aircraft?.manufacturer}
                                required
                                placeholder="e.g. Boeing"
                            />
                            <InputError message={errors.manufacturer} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="model">Model</Label>
                            <Input
                                id="model"
                                name="model"
                                defaultValue={aircraft?.model}
                                required
                                placeholder="e.g. 737-800"
                            />
                            <InputError message={errors.model} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                name="status"
                                defaultValue={aircraft?.status ?? 'active'}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem
                                            key={status}
                                            value={status}
                                        >
                                            {statusLabels[status]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                defaultValue={aircraft?.location ?? ''}
                                placeholder="e.g. Hangar 3, KJFK"
                            />
                            <InputError message={errors.location} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="purchased_at">Purchased</Label>
                            <Input
                                id="purchased_at"
                                name="purchased_at"
                                type="date"
                                defaultValue={
                                    aircraft?.purchased_at?.split('T')[0] ?? ''
                                }
                            />
                            <InputError message={errors.purchased_at} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_flight_at">Last flight</Label>
                            <Input
                                id="last_flight_at"
                                name="last_flight_at"
                                type="date"
                                defaultValue={
                                    aircraft?.last_flight_at?.split('T')[0] ??
                                    ''
                                }
                            />
                            <InputError message={errors.last_flight_at} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_maintenance_at">
                                Last maintenance
                            </Label>
                            <Input
                                id="last_maintenance_at"
                                name="last_maintenance_at"
                                type="date"
                                defaultValue={
                                    aircraft?.last_maintenance_at?.split(
                                        'T',
                                    )[0] ?? ''
                                }
                            />
                            <InputError message={errors.last_maintenance_at} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                            id="notes"
                            name="notes"
                            defaultValue={aircraft?.notes ?? ''}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                            placeholder="Any additional notes..."
                        />
                        <InputError message={errors.notes} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>
                            {isEditing ? 'Update aircraft' : 'Add aircraft'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
