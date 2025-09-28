import cron from 'node-cron';
import { getCurrentEvent } from './calendar.js';
import { updateBoard } from './vestaboard.js';

const performCalendarCheck = async (config) => {
  console.log('Starting scheduled calendar check...');
  const { ICS_CALENDAR_URL, VESTABOARD_API_KEY } = config;

  try {
    const currentEvent = await getCurrentEvent(ICS_CALENDAR_URL);

    if (currentEvent) {
      console.log('Current event found, updating board:', currentEvent.summary);
      // Use description if available, otherwise fallback to summary
      const message = currentEvent.description || currentEvent.summary;
      const updateResult = await updateBoard(message, VESTABOARD_API_KEY);

      if (!updateResult.success) {
        console.error('Failed to update Vestaboard:', updateResult.error);
        // Decide if this should be a fatal error for the check
        return { success: false, error: `Failed to update Vestaboard: ${updateResult.error}` };
      }

      console.log('Calendar check finished. Board updated for event:', currentEvent.summary);
      return { success: true, eventFound: true, eventSummary: currentEvent.summary };
    } else {
      console.log('No current event found. Calendar check finished.');
      // Optionally, clear the board or display a default message here
      // e.g., await updateBoard("No events scheduled", VESTABOARD_API_KEY);
      return { success: true, eventFound: false };
    }
  } catch (error) {
    // Catch errors from getCurrentEvent or potential issues before updateBoard
    console.error('Error during calendar check:', error);
    return { success: false, error: error.message };
  }
};

export const startScheduler = (config) => {
  console.log(`Scheduler starting with cron pattern: ${config.CRON_SCHEDULE}`);

  cron.schedule(config.CRON_SCHEDULE, async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Running scheduled task...`);

    const result = await performCalendarCheck(config);

    if (!result.success) {
      console.error(`[${timestamp}] Scheduled task finished with errors:`, result.error);
      // Consider adding monitoring/alerting here
    } else {
      const status = result.eventFound ? `Event found: ${result.eventSummary}` : 'No event found';
      console.log(`[${timestamp}] Scheduled task finished successfully. Status: ${status}`);
    }
  }, {
    scheduled: true,
    // timezone: "Your/Timezone" // Optional: Specify timezone if needed
  });

  console.log('Scheduler is running. Waiting for the next scheduled execution...');
  // Keep the script running (implicitly handled by Node.js for cron)
}; 