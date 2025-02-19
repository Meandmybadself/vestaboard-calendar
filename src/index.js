import ICAL from 'ical.js';
import { DateTime } from 'luxon';

async function updateBoard(message) {
  try {
    let characterCodes;

    if (Array.isArray(message) && message.every(row => Array.isArray(row))) {
      characterCodes = message;
    } else {
      const response = await fetch(VESTABOARD_COMPOSE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vestaboard-Read-Write-Key': VESTABOARD_API_KEY
        },
        body: JSON.stringify({
          components: [
            {
              "style": {
                "justify": "center",
                "align": "center"
              },
              template: message
            }]
        })
      });
      characterCodes = await response.json();
    }

    await fetch(VESTABOARD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vestaboard-Read-Write-Key': VESTABOARD_API_KEY
      },
      body: JSON.stringify(characterCodes)
    });
  } catch (error) {
    console.error('Error updating board:', error);
  }
}

async function getCurrentEvent() {
  console.log('Fetching calendar data...');
  console.log('ICS_CALENDAR_URL', ICS_CALENDAR_URL);
  const response = await fetch(ICS_CALENDAR_URL);
  const icsData = await response.text();
  console.log('Calendar data fetched successfully');

  const jcalData = ICAL.parse(icsData);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');
  const now = DateTime.now();
  console.log('Current time:', now.toISO());

  let currentEvent = null;

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);
    
    // Handle recurring events
    if (event.isRecurring()) {
      const expand = event.iterator();
      const oneYearFromNow = DateTime.now().plus({ years: 1 }).toJSDate();
      
      // Expand recurrences for the next year
      while (expand.next() && expand.last < oneYearFromNow) {
        const occurrence = expand.last;
        const start = DateTime.fromJSDate(occurrence);
        const duration = event.duration;
        const end = DateTime.fromJSDate(occurrence.plus(duration));

        if (now >= start && now <= end) {
          currentEvent = {
            summary: event.summary,
            description: event.description,
            start: occurrence,
            end: occurrence.plus(duration),
            isRecurring: true
          };
          console.log('Found current recurring event:', event.summary);
          break;
        }
      }
    } else {
      // Handle non-recurring events
      const start = DateTime.fromJSDate(event.startDate.toJSDate());
      const end = DateTime.fromJSDate(event.endDate.toJSDate());

      if (now >= start && now <= end) {
        currentEvent = {
          summary: event.summary,
          description: event.description,
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate(),
          isRecurring: false
        };
        console.log('Found current non-recurring event:', event.summary);
        break;
      }
    }

    if (currentEvent) break;
  }

  return currentEvent;
}

async function handleCalendarCheck(env) {
  console.log('Starting calendar check...');
    
  globalThis.ICS_CALENDAR_URL = env.ICS_CALENDAR_URL;
  globalThis.VESTABOARD_API_KEY = env.VESTABOARD_API_KEY;
  globalThis.VESTABOARD_COMPOSE_URL = 'https://vbml.vestaboard.com/compose';
  globalThis.VESTABOARD_API_URL = 'https://rw.vestaboard.com/';

  if (!ICS_CALENDAR_URL || !VESTABOARD_API_KEY) {
    console.error('ICS_CALENDAR_URL or VESTABOARD_API_KEY is not set');
    return { success: false, error: 'ICS_CALENDAR_URL or VESTABOARD_API_KEY is not set' };
  }
  

  try {
    const currentEvent = await getCurrentEvent();
    
    if (currentEvent) {
      console.log('Updating board with event:', currentEvent.summary);
      await updateBoard(currentEvent.description || currentEvent.summary);
      return { success: true, event: currentEvent };
    } else {
      console.log('No current event found');
      return { success: true, event: null };
    }
  } catch (error) {
    console.error('Error in worker:', error);
    return { success: false, error: error.message };
  }
}

export default {
  async fetch(_, env, __) {
    const result = await handleCalendarCheck(env);
    return new Response(JSON.stringify(result, null, 2), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    });
  },

  async scheduled(_, env, __) {
    await handleCalendarCheck(env);
  }
}; 