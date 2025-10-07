const OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/3.0/onecall';

export const getWeatherContent = async (config) => {
  const { OPENWEATHER_API_KEY, OPENWEATHER_LAT, OPENWEATHER_LON } = config;

  if (!OPENWEATHER_API_KEY || !OPENWEATHER_LAT || !OPENWEATHER_LON) {
    console.error('Missing OpenWeatherMap configuration');
    return 'Weather unavailable (missing config)';
  }

  try {
    const url = `${OPENWEATHER_API_URL}?lat=${OPENWEATHER_LAT}&lon=${OPENWEATHER_LON}&appid=${OPENWEATHER_API_KEY}&units=imperial&exclude=minutely,hourly,alerts`;

    console.log('Fetching weather data...');
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const today = data.daily[0];
    const current = data.current;

    // Format weather information
    const lowTemp = Math.round(today.temp.min);
    const highTemp = Math.round(today.temp.max);
    const precipitation = Math.round((today.pop || 0) * 100);
    const aqi = current.air_quality?.aqi || 'N/A';

    // Build message for Vestaboard
    const message = `Today's Weather\n\nLow: ${lowTemp}°F\nHigh: ${highTemp}°F\nPrecip: ${precipitation}%\nAir Quality: ${aqi}`;

    console.log('Weather data fetched successfully');
    return message;

  } catch (error) {
    console.error('Error fetching weather:', error);
    return 'Weather currently unavailable';
  }
};
