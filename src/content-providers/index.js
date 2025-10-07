import { getWeatherContent } from './weather.js';
import { getLunchContent } from './lunch.js';
import { getUrlContent } from './url-fetcher.js';
import { getCurrentState, saveCurrentState, restoreState } from '../storage.js';

/**
 * Resolves dynamic content based on event title keywords
 * @param {string} eventTitle - The event title from calendar
 * @param {object} config - Configuration object with API keys and settings
 * @returns {Promise<string|object>} - The resolved content or original title, or action result
 */
export const resolveDynamicContent = async (eventTitle, config) => {
  if (!eventTitle || typeof eventTitle !== 'string') {
    return eventTitle;
  }

  const title = eventTitle.trim();

  // Check for URL: prefix for generic URL fetching
  if (title.startsWith('URL:')) {
    const url = title.substring(4).trim();
    if (url) {
      console.log('Detected URL content provider');
      return await getUrlContent(url);
    }
  }

  // Check for predefined keywords
  switch (title.toUpperCase()) {
    case 'WEATHER':
      console.log('Detected WEATHER content provider');
      return await getWeatherContent(config);

    case 'LUNCH':
      console.log('Detected LUNCH content provider');
      return await getLunchContent();

    case 'SAVE':
      console.log('Detected SAVE command - saving current board state');
      const currentStateResult = await getCurrentState(config.VESTABOARD_API_KEY);
      if (currentStateResult.success) {
        const saveResult = await saveCurrentState(currentStateResult.characterCodes, config.STATE_STORAGE_PATH);
        if (saveResult.success) {
          return { action: 'save', skipBoardUpdate: true };
        }
      }
      return { action: 'save', skipBoardUpdate: true, error: 'Failed to save state' };

    case 'RESTORE':
      console.log('Detected RESTORE command - restoring saved board state');
      const restoreResult = await restoreState(config.STATE_STORAGE_PATH, config.VESTABOARD_API_KEY);
      if (restoreResult.success) {
        return { action: 'restore', skipBoardUpdate: true };
      }
      return { action: 'restore', skipBoardUpdate: true, error: 'Failed to restore state' };

    default:
      // Not a dynamic content keyword, return original title
      return eventTitle;
  }
};
