import { Form } from '@inertiajs/react';
import AircraftController from '@/actions/App/Http/Controllers/AircraftController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';

export default function DeleteAircraft({
    aircraftId,
    aircraftName,
    open,
    onOpenChange,
}: {
    aircraftId: string;
    aircraftName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogTitle>Delete aircraft</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete{' '}
                    <strong>{aircraftName}</strong>? This action cannot be
                    undone.
                </DialogDescription>

                <Form
                    {...AircraftController.destroy.form({
                        aircraft: aircraftId,
                    })}
                >
                    {({ processing }) => (
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                disabled={processing}
                                asChild
                            >
                                <button type="submit">Delete</button>
                            </Button>
                        </DialogFooter>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
