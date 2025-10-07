import cron from 'node-cron';
import { getCurrentEvent } from './calendar.js';
import { updateBoard } from './vestaboard.js';
import { resolveDynamicContent } from './content-providers/index.js';

const performCalendarCheck = async (config) => {
  console.log('Starting scheduled calendar check...');
  const { ICS_CALENDAR_URL, VESTABOARD_API_KEY, STATE_STORAGE_PATH } = config;

  try {
    const currentEvent = await getCurrentEvent(ICS_CALENDAR_URL);

    if (currentEvent) {
      console.log('Current event found:', currentEvent.summary);

      // Use description if available, otherwise fallback to summary
      let message = currentEvent.description || currentEvent.summary;

      // Check if the message is a dynamic content keyword
      const resolvedMessage = await resolveDynamicContent(message, config);

      // Check if this is an action command (SAVE/RESTORE) that shouldn't update the board
      if (typeof resolvedMessage === 'object' && resolvedMessage.skipBoardUpdate) {
        const action = resolvedMessage.action;
        if (resolvedMessage.error) {
          console.error(`${action.toUpperCase()} command failed:`, resolvedMessage.error);
          return { success: false, error: resolvedMessage.error };
        }
        console.log(`${action.toUpperCase()} command completed successfully`);
        return { success: true, eventFound: true, eventSummary: currentEvent.summary, action };
      }

      console.log('Updating board with resolved content');
      const updateResult = await updateBoard(resolvedMessage, VESTABOARD_API_KEY);

      if (!updateResult.success) {
        console.error('Failed to update Vestaboard:', updateResult.error);
        return { success: false, error: `Failed to update Vestaboard: ${updateResult.error}` };
      }

      console.log('Calendar check finished. Board updated for event:', currentEvent.summary);
      return { success: true, eventFound: true, eventSummary: currentEvent.summary };
    } else {
      console.log('No current event found. Calendar check finished.');
      return { success: true, eventFound: false };
    }
  } catch (error) {
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