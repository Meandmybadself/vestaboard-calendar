const OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const AIR_QUALITY_API_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

export const getWeatherContent = async (config) => {
  const { OPENWEATHER_API_KEY, OPENWEATHER_LAT, OPENWEATHER_LON } = config;

  if (!OPENWEATHER_API_KEY || !OPENWEATHER_LAT || !OPENWEATHER_LON) {
    console.error('Missing OpenWeatherMap configuration');
    return 'Weather unavailable (missing config)';
  }

  try {
    const weatherUrl = `${OPENWEATHER_API_URL}?lat=${OPENWEATHER_LAT}&lon=${OPENWEATHER_LON}&appid=${OPENWEATHER_API_KEY}&units=imperial&exclude=minutely,hourly,alerts`;
    const airQualityUrl = `${AIR_QUALITY_API_URL}?lat=${OPENWEATHER_LAT}&lon=${OPENWEATHER_LON}&appid=${OPENWEATHER_API_KEY}`;

    console.log('Fetching weather data...');
    const [weatherResponse, airQualityResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(airQualityUrl)
    ]);

    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const data = await weatherResponse.json();
    const today = data.daily[0];
    const current = data.current;

    // Format weather information
    const lowTemp = Math.round(today.temp.min);
    const highTemp = Math.round(today.temp.max);
    const precipitation = Math.round((today.pop || 0) * 100);

    // Get air quality data
    let aqi = 'N/A';
    if (airQualityResponse.ok) {
      const airQualityData = await airQualityResponse.json();
      aqi = airQualityData.list[0]?.main?.aqi || 'N/A';
    }

    // Build message for Vestaboard
    const message = `Today's Weather\n\nLow: ${lowTemp}°F\nHigh: ${highTemp}°F\nPrecip: ${precipitation}%\nAir Quality: ${aqi}`;

    console.log('Weather data fetched successfully');
    return message;

  } catch (error) {
    console.error('Error fetching weather:', error);
    return 'Weather currently unavailable';
  }
};
