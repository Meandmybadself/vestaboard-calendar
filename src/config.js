import cron from 'node-cron';

// Default to every 5 minutes, 6am to 10pm
const DEFAULT_CRON_SCHEDULE = '*/5 6-22 * * *';

export const loadConfig = () => {
  console.log('Loading configuration...');

  const config = {
    ICS_CALENDAR_URL: process.env.ICS_CALENDAR_URL,
    VESTABOARD_API_KEY: process.env.VESTABOARD_API_KEY,
    CRON_SCHEDULE: process.env.CRON_SCHEDULE || DEFAULT_CRON_SCHEDULE,
  };

  // Validate required config
  if (!config.ICS_CALENDAR_URL) {
    console.error('FATAL: Missing required environment variable: ICS_CALENDAR_URL. Please set it and restart. Exiting.');
    process.exit(1);
  }
  if (!config.VESTABOARD_API_KEY) {
    console.error('FATAL: Missing required environment variable: VESTABOARD_API_KEY. Please set it and restart. Exiting.');
    process.exit(1);
  }

  // Validate cron schedule
  if (!cron.validate(config.CRON_SCHEDULE)) {
    console.error(`FATAL: Invalid CRON_SCHEDULE: "${config.CRON_SCHEDULE}". Please provide a valid cron pattern. Exiting.`);
    process.exit(1);
  }

  console.log('Configuration loaded successfully.');
  console.log(`Using cron schedule: ${config.CRON_SCHEDULE}`);

  return config;
}; 