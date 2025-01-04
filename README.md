# Vestaboard Calendar

A Cloudflare worker to automate the display of Vestaboard messages using an ICS calendar.

## Usage

### Create a publicly accessible ICS calendar

#### Google Calendar

1. Go to Google Calendar
2. Create a new calendar
3. Make it public
4. Get the ICS URL

## Environment Variables

- `ICS_CALENDAR_URL`: The URL of the ICS calendar.
- `VESTABOARD_API_KEY`: The API key for the Vestaboard API.

## Usage

1. Clone the repository
2. Create a `.dev.vars` file with the required environment variables
3. Run the worker

## Setting Environment Variables with Wrangler

```bash
wrangler secret put ICS_CALENDAR_URL
wrangler secret put VESTABOARD_API_KEY
```

### Deploying

```bash
wrangler deploy
```
