import { Linking, Platform } from 'react-native';
import { notificationService } from './notificationService';

export const emailService = {
  /**
   * Opens the default mail app with a pre-filled draft.
   */
  sendEmail: async (to: string, subject: string, body: string) => {
    const url = `mailto:${to}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    try {
      if (Platform.OS === 'web') {
        window.open(url);
        return;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        notificationService.showAlert(
          'Error',
          'No email client found. Please configure an email account on your device.',
        );
      }
    } catch (err) {
      console.error('An error occurred', err);
    }
  },

  /**
   * Generates a customer support email draft.
   */
  sendSupportEmail: async (userName: string, orderId?: string) => {
    const subject = `Support Request${
      orderId ? `: Order #${orderId}` : ''
    } - ${userName}`;
    const body = `Hello ShopyShop Support,

I need assistance with ${orderId ? `my order #${orderId}` : 'my account'}.

Details:
- User: ${userName}
${orderId ? `- Order ID: ${orderId}` : ''}

[Please describe your issue here]

Best regards,
${userName}`;

    await emailService.sendEmail('support@shopyshop.com', subject, body);
  },

  /**
   * Generates an order inquiry email draft.
   */
  sendOrderInquiryEmail: async (
    userEmail: string,
    orderId: string,
    status: string,
  ) => {
    const subject = `Order Inquiry: #${orderId}`;
    const body = `Dear ShopyShop Support,

I am writing regarding my order #${orderId}, which is currently marked as ${status.toUpperCase()}.

[Your query here]

Best regards,
${userEmail}`;

    await emailService.sendEmail('support@shopyshop.com', subject, body);
  },
};
