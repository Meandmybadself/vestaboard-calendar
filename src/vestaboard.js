const VESTABOARD_COMPOSE_URL = 'https://vbml.vestaboard.com/compose';
const VESTABOARD_API_URL = 'https://rw.vestaboard.com/';

export const updateBoard = async (message, apiKey) => {
  if (!apiKey) {
    console.error('VESTABOARD_API_KEY is missing in call to updateBoard');
    // Consider throwing an error or returning a more specific status
    return { success: false, error: 'API key missing' };
  }

  try {
    let characterCodes;

    // If message is not already character codes, compose it first
    if (typeof message === 'string') {
      console.log('Composing message for Vestaboard...');
      const composeResponse = await fetch(VESTABOARD_COMPOSE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vestaboard-Read-Write-Key': apiKey
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

      if (!composeResponse.ok) {
        const errorText = await composeResponse.text();
        throw new Error(`Failed to compose message: ${composeResponse.status} ${errorText}`);
      }
      characterCodes = await composeResponse.json();
      console.log('Message composed successfully.');
    } else if (Array.isArray(message) && message.every(row => Array.isArray(row))) {
      // Assume it's already character codes if it's a 2D array
      characterCodes = message;
      console.log('Using pre-formatted character codes.');
    } else {
      throw new Error('Invalid message format for updateBoard. Must be string or 2D character code array.');
    }

    console.log('Sending message to Vestaboard API...');
    const updateResponse = await fetch(VESTABOARD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vestaboard-Read-Write-Key': apiKey
      },
      body: JSON.stringify(characterCodes)
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update board: ${updateResponse.status} ${errorText}`);
    }

    console.log('Board updated successfully.');
    return { success: true };

  } catch (error) {
    console.error('Error updating board:', error);
    return { success: false, error: error.message };
  }
}; 