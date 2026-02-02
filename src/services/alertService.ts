import { ModalContextType } from '../context/ModalContext';
import { ToastContextType } from '../context/ToastContext';
import i18n from '../i18n';

export class AlertService {
    /**
     * Shows a confirmation modal with Confirm/Cancel buttons
     */
    static showConfirmation(
        modal: ModalContextType,
        title: string,
        message: string,
        onConfirm: () => void,
        confirmText?: string,
        cancelText?: string
    ) {
        modal.showModal({
            title,
            message,
            buttons: [
                {
                    text: cancelText || i18n.t('common.cancel') || 'Cancel',
                    style: 'cancel'
                },
                {
                    text: confirmText || i18n.t('common.confirm') || 'Confirm',
                    onPress: onConfirm
                }
            ]
        });
    }

    /**
     * Shows a success toast notification
     */
    static showSuccess(toast: ToastContextType, message: string) {
        toast.showToast(message, 'success');
    }

    /**
     * Shows an error toast notification
     */
    static showError(toast: ToastContextType, message: string) {
        toast.showToast(message, 'error');
    }

    /**
     * Shows a generic info alert using Modal
     */
    static showAlert(
        modal: ModalContextType,
        title: string,
        message: string,
        buttonText?: string,
        onPress?: () => void
    ) {
        modal.showModal({
            title,
            message,
            buttons: [
                {
                    text: buttonText || 'OK',
                    style: 'default',
                    onPress
                }
            ]
        });
    }
}
