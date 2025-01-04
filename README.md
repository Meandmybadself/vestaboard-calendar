# Vestaboard Calendar

A Cloudflare worker to automate the display of Vestaboard messages using an ICS calendar.

## Related
- [Vestaboard API Docs](https://docs.vestaboard.com/docs/read-write-api/introduction)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/s)

## Usage

### Create a publicly accessible ICS calendar

#### Google Calendar

1. Go to [Google Calendar](https://calendar.google.com/)
2. Create a new calendar
3. Make it public
4. Get the ICS URL

## Environment Variables

- `ICS_CALENDAR_URL`: The URL of the ICS calendar.
- `VESTABOARD_API_KEY`: The API key for the Vestaboard API.  [Request here](https://web.vestaboard.com/).

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
