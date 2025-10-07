import { writeFile, readFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

const VESTABOARD_API_URL = 'https://rw.vestaboard.com/';

/**
 * Saves the current Vestaboard state to a JSON file
 * @param {Array} characterCodes - The 2D array of character codes from the board
 * @param {string} storagePath - Path to save the state file
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const saveCurrentState = async (characterCodes, storagePath) => {
  try {
    console.log(`Saving board state to: ${storagePath}`);

    // Ensure directory exists
    const dir = dirname(storagePath);
    await mkdir(dir, { recursive: true });

    const state = {
      timestamp: new Date().toISOString(),
      characterCodes
    };

    await writeFile(storagePath, JSON.stringify(state, null, 2));
    console.log('Board state saved successfully');

    return { success: true };

  } catch (error) {
    console.error('Error saving board state:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Retrieves the current state from the Vestaboard API
 * @param {string} apiKey - Vestaboard API key
 * @returns {Promise<{success: boolean, characterCodes?: Array, error?: string}>}
 */
export const getCurrentState = async (apiKey) => {
  try {
    console.log('Fetching current board state from Vestaboard API...');
    const response = await fetch(VESTABOARD_API_URL, {
      method: 'GET',
      headers: {
        'X-Vestaboard-Read-Write-Key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch current state: ${response.status}`);
    }

    const characterCodes = await response.json();
    console.log('Current board state retrieved successfully');

    return { success: true, characterCodes };

  } catch (error) {
    console.error('Error retrieving current state:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Restores a previously saved board state
 * @param {string} storagePath - Path to the saved state file
 * @param {string} apiKey - Vestaboard API key
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const restoreState = async (storagePath, apiKey) => {
  try {
    console.log(`Restoring board state from: ${storagePath}`);

    const data = await readFile(storagePath, 'utf8');
    const state = JSON.parse(data);

    if (!state.characterCodes) {
      throw new Error('Invalid state file: missing characterCodes');
    }

    // Update the board with saved state
    console.log('Sending saved state to Vestaboard API...');
    const response = await fetch(VESTABOARD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vestaboard-Read-Write-Key': apiKey
      },
      body: JSON.stringify(state.characterCodes)
    });

    if (!response.ok) {
      throw new Error(`Failed to restore state: ${response.status}`);
    }

    console.log('Board state restored successfully');
    return { success: true };

  } catch (error) {
    console.error('Error restoring board state:', error);
    return { success: false, error: error.message };
  }
};
