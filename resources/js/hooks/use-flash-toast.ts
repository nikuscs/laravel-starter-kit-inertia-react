import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useFlashToast(): void {
    useEffect(() => {
        return router.on('flash', (event) => {
            const { success, error } = event.detail.flash as {
                success?: string;
                error?: string;
            };

            if (success) {
                toast.success(success, { id: 'flash-success' });
            }

            if (error) {
                toast.error(error, { id: 'flash-error' });
            }
        });
    }, []);
}
