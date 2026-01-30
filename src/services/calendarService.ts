import { Platform } from 'react-native';

export interface CalendarEvent {
  title: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  enableReminder?: boolean;
}

class CalendarService {
  /**
   * Add an event to the device calendar
   */
  async addToCalendar(event: CalendarEvent): Promise<boolean> {
    console.log('Adding to calendar:', event);

    if (Platform.OS === 'web') {
      // Mock web implementation
      return new Promise(resolve => {
        setTimeout(() => resolve(true), 500);
      });
    }

    // Native implementation would go here using react-native-calendar-events
    return true;
  }
}

export const calendarService = new CalendarService();
