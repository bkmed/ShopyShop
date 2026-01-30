import { Platform } from 'react-native';
import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
} from '@notifee/react-native';
import { modalService } from './modalService';
import { store } from '../store';
import { addNotification } from '../store/slices/notificationsSlice';

export const notificationService = {
  // Initialize notifications
  initialize: async () => {
    if (Platform.OS === 'web') {
      console.warn('Notifications not available on web');
      return;
    }

    // Request permission (iOS)
    await notifee.requestPermission();

    // Create notification channels (Android)
    await notifee.createChannel({
      id: 'orders',
      name: 'Order Updates',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    await notifee.createChannel({
      id: 'promotions',
      name: 'Promotions',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });
  },

  checkPermissions: async () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return (Notification as any).permission === 'granted';
      }
      return false;
    }
    const settings = await notifee.getNotificationSettings();
    return settings.authorizationStatus >= 1;
  },

  requestPermission: async () => {
    if (Platform.OS === 'web') {
      return true;
    }
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= 1;
  },

  // Notify about order status update
  notifyOrderStatusUpdate: async (orderId: string, status: string) => {
    if (Platform.OS === 'web') return;

    await notifee.displayNotification({
      id: `order-${orderId}`,
      title: 'Order Status Updated',
      body: `Your order #${orderId} is now ${status}.`,
      android: {
        channelId: 'orders',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
      data: {
        type: 'order_update',
        orderId,
      },
    });
  },

  // Schedule flash sale reminder
  scheduleSaleReminder: async (
    saleId: string,
    title: string,
    startTime: string,
  ) => {
    if (Platform.OS === 'web') return;
    const saleDate = new Date(startTime);

    // Schedule 15 minutes before
    const reminderTime = new Date(saleDate.getTime() - 15 * 60 * 1000);

    if (reminderTime < new Date()) return;

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: reminderTime.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id: `sale-${saleId}`,
        title: 'Flash Sale Starting Soon!',
        body: `${title} starts in 15 minutes. Don't miss out!`,
        android: {
          channelId: 'promotions',
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
        },
        data: {
          type: 'sale_reminder',
          saleId,
        },
      },
      trigger,
    );
  },

  // Show a general alert using the custom modal
  showAlert: async (title: string, body: string) => {
    modalService.show({ title, message: body });
  },

  showToast: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    modalService.show({ title: type.toUpperCase(), message });
  },

  broadcastNotification: async ({
    title,
    body,
    targetType,
    targetId,
    senderId,
  }: {
    title: string;
    body: string;
    targetType: 'all' | 'user' | 'stock';
    targetId?: string;
    senderId?: string;
  }) => {
    // Store in Redux
    const notification = {
      id: Date.now().toString(),
      title,
      message: body,
      type: 'info' as const,
      isRead: false,
      createdAt: new Date().toISOString(),
      link: undefined,
      targetType,
      targetId,
      senderId: senderId?.toString(),
    };

    store.dispatch(addNotification(notification));

    if (Platform.OS !== 'web') {
      await notifee.displayNotification({
        title,
        body,
        android: { channelId: 'promotions' },
      });
    }
  },
};
