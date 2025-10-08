import ICAL from 'ical.js';
import { DateTime } from 'luxon';

const SCHOOL_LUNCH_ICS_URL = 'https://mealcal.meandmybadself.com/?schoolId=EisenhowerElementaryMN&meal=Lunch';

export const getLunchContent = async () => {
  try {
    console.log('Fetching school lunch menu...');
    const response = await fetch(SCHOOL_LUNCH_ICS_URL);

    if (!response.ok) {
      throw new Error(`Lunch API error: ${response.status}`);
    }

    const icsData = await response.text();
    const jcalData = ICAL.parse(icsData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');

    const today = DateTime.now().startOf('day');

    // Find today's lunch event
    for (const veventComponent of vevents) {
      const event = new ICAL.Event(veventComponent);
      const eventStart = DateTime.fromJSDate(event.startDate.toJSDate()).startOf('day');

      // Check if event is today
      if (eventStart.equals(today)) {
        let lunchMenu = event.description || event.summary || 'Menu not available';
        // Remove HTML tags
        lunchMenu = lunchMenu.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');
        let lunchMenuSplit = lunchMenu.split('ALTERNATE');
        lunchMenu = lunchMenuSplit[0];
        console.log('Lunch menu found for today');
        return `Today's Lunch\n\n${lunchMenu}`;
      }
    }

    console.log('No lunch menu found for today');
    return 'No lunch menu available today';

  } catch (error) {
    console.error('Error fetching lunch menu:', error);
    return 'Lunch menu currently unavailable';
  }
};
