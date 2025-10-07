export const getUrlContent = async (url) => {
  try {
    console.log(`Fetching content from URL: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`URL fetch error: ${response.status}`);
    }

    const content = await response.text();
    console.log('URL content fetched successfully');

    // Truncate if too long for display
    const maxLength = 500;
    if (content.length > maxLength) {
      return content.substring(0, maxLength) + '...';
    }

    return content;

  } catch (error) {
    console.error('Error fetching URL content:', error);
    return `Unable to fetch content from URL: ${error.message}`;
  }
};
