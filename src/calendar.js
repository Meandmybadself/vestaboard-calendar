import ICAL from 'ical.js';
import { DateTime } from 'luxon';

const MAX_RECURRENCE_ITERATIONS = 10000;

const parseIcsData = (icsData) => {
  try {
    const jcalData = ICAL.parse(icsData);
    if (!jcalData) {
      throw new Error('Failed to parse ICS data (ICAL.parse returned null)');
    }
    const comp = new ICAL.Component(jcalData);
    return comp.getAllSubcomponents('vevent');
  } catch (error) {
    console.error('Error parsing ICS data:', error);
    throw new Error(`Error parsing ICS data: ${error.message}`); // Re-throw for caller handling
  }
};

const checkRecurringEvent = (event, iterator, now) => {
  let iteration = 0;
  let nextOccurrenceTime = iterator.next();
  const buffer = 30000 // 30 seconds

  while (nextOccurrenceTime && iteration < MAX_RECURRENCE_ITERATIONS) {
    const occurrenceDate = new Date(nextOccurrenceTime.toJSDate().getTime() - buffer);
    const start = DateTime.fromJSDate(occurrenceDate);
    const durationSeconds = event.duration ? event.duration.toSeconds() : 0;
    const durationMs = durationSeconds * 1000;
    const end = DateTime.fromJSDate(new Date(occurrenceDate.getTime() + durationMs + buffer));

    if (now >= start && now <= end) {
      return {
        summary: event.summary,
        description: event.description,
        start: occurrenceDate,
        end: new Date(occurrenceDate.getTime() + durationMs),
        isRecurring: true
      };
    }

    if (start > now) {
      // The next occurrence is in the future, no need to check further occurrences of this event
      break;
    }

    nextOccurrenceTime = iterator.next();
    iteration++;
  }

  if (iteration >= MAX_RECURRENCE_ITERATIONS) {
    console.warn(`Reached maximum iterations (${MAX_RECURRENCE_ITERATIONS}) for recurring event: ${event.summary}.`);
  }

  return null; // No current occurrence found within limits
};

const checkNonRecurringEvent = (event, now) => {
  const start = DateTime.fromJSDate(event.startDate.toJSDate());
  const end = DateTime.fromJSDate(event.endDate.toJSDate());

  if (now >= start && now <= end) {
    return {
      summary: event.summary,
      description: event.description,
      start: event.startDate.toJSDate(),
      end: event.endDate.toJSDate(),
      isRecurring: false
    };
  }
  return null;
};

export const getCurrentEvent = async (icsUrl) => {
  if (!icsUrl) {
    console.error('ICS_CALENDAR_URL is missing in call to getCurrentEvent');
    return null; // Or throw an error
  }

  let icsData;
  try {
    console.log('Fetching calendar data from:', icsUrl);
    const response = await fetch(icsUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar: ${response.status} ${response.statusText}`);
    }
    icsData = await response.text();
    console.log('Calendar data fetched successfully.');
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return null; // Return null or throw, depending on desired error handling
  }

  let vevents;
  try {
    vevents = parseIcsData(icsData);
    console.log('Found events:', { totalEvents: vevents.length });
  } catch (error) {
    // Error already logged in parseIcsData
    return null;
  }

  const now = DateTime.now();
  console.log('Checking for current event at server time:', {
    iso: now.toISO(),
    zone: now.zoneName,
    offset: now.offset / 60 // offset in minutes
  });

  for (const veventComponent of vevents) {
    const event = new ICAL.Event(veventComponent);
    let currentEvent = null;

    if (event.isRecurring()) {
      try {
        const iterator = event.iterator();
        currentEvent = checkRecurringEvent(event, iterator, now);
      } catch (error) {
        // Log errors related to specific recurring event processing but continue checking others
        console.error(`Error processing recurring event (${event.summary || 'No Summary'}):`, error);
      }
    } else {
      currentEvent = checkNonRecurringEvent(event, now);
    }

    if (currentEvent) {
      console.log(`Found current ${currentEvent.isRecurring ? 'recurring' : 'non-recurring'} event:`, currentEvent.summary);
      return currentEvent; // Found the current event, return it
    }
  }

  console.log('No current event found.');
  return null; // No current event found after checking all
}; 