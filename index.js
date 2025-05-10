import ICAL from 'ical.js';
import { DateTime } from 'luxon';
import { pathToFileURL } from 'url';
import { argv } from 'process';
import { loadConfig } from './src/config.js';
import { startScheduler } from './src/scheduler.js';

const main = async () => {
  console.log('Initializing Vestaboard Calendar Script...');

  // Load and validate configuration
  // Exits automatically if required config is missing or invalid
  const config = loadConfig();

  // Start the scheduler with the loaded configuration
  startScheduler(config);

  // The script will now keep running due to the active cron scheduler
};

main().catch(err => {
  // Catch any unhandled errors during the initial setup phase
  console.error("Unhandled error during script initialization:", err);
  process.exit(1); // Exit with an error code
});
