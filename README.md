# Vestaboard Calendar Language

Use your calendar to schedule messages on a Vestaboard with support for dynamic content.

![Vestaboard Calendar](vb-cal.jpg)

![Dynamic Content](./calendar-language.jpg)

A Node.js application to automate the display of Vestaboard messages using your existing online calendar, with support for weather forecasts, school lunch menus, custom URL content, and state management.

## Features

- **Calendar Integration** - Display static messages from calendar event titles/descriptions
- **Dynamic Content Providers**:
  - `WEATHER` - Display current weather forecast (temp, precipitation, air quality using OpenWeatherMap)
  - `LUNCH` - Display today's school lunch menu (using https://github.com/Meandmybadself/mealviewer-to-ICS)
  - `URL:https://example.com` - Fetch and display content from any URL
  - **Color Patterns** - Display colorful patterns using Vestaboard's color tiles:
    - `COLOR_RANDOM` - Random colors for each tile
    - `COLOR_VERTICAL` - Solid color columns
    - `COLOR_HORIZONTAL` - Solid color rows
    - `COLOR_DIAGONAL` - Diagonal color patterns
- **State Management**:
  - `SAVE` - Save current board state for later restoration
  - `RESTORE` - Restore previously saved board state

## Related
- [Vestaboard API Docs](https://docs.vestaboard.com/docs/read-write-api/introduction)

## Prerequisites

- [Node.js](https://nodejs.org/)

## Usage

### 1. Create a publicly accessible ICS calendar

#### Google Calendar

1. Go to [Google Calendar](https://calendar.google.com/)
2. Create a new calendar
3. Make it public
4. Get the ICS URL

### 2. Create a Vestaboard API key

1. Go to [Vestaboard](https://web.vestaboard.com/)
2. Create a new API key & make note of it.

### 3. Configure environment variables

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the required environment variables:

```bash
# Required
ICS_CALENDAR_URL=https://calendar.google.com/calendar/ical/your_calendar_id%40group.calendar.google.com/public/basic.ics
VESTABOARD_API_KEY=replace_with_your_api_key

# Optional - for WEATHER keyword support
OPENWEATHER_API_KEY=your_openweather_api_key
OPENWEATHER_LAT=44.9778
OPENWEATHER_LON=-93.2650

# Optional - for state storage (defaults to ./vestaboard-state.json)
STATE_STORAGE_PATH=./vestaboard-state.json

# Optional - cron schedule (defaults to every minute from 6am-10pm)
CRON_SCHEDULE=*/1 6-22 * * *
```

### 4. Run the application

```bash
node index.js
```

The application will run continuously, checking your calendar on the configured schedule.

## Dynamic Content Keywords

Use these special keywords as event titles in your calendar to trigger dynamic content:

### Weather Forecast
Create an event with title: `WEATHER`

Displays:
- Low/High temperature
- Precipitation chance
- Air Quality Index

*Requires OpenWeatherMap API configuration*

### School Lunch Menu
Create an event with title: `LUNCH`

Displays today's lunch menu from the configured school.

### Custom URL Content
Create an event with title: `URL:https://api.example.com/message`

Fetches and displays the response from the specified URL.

### Color Patterns
Create events with these titles to display colorful patterns:

- **`COLOR_RANDOM`** - Each tile displays a random color
- **`COLOR_VERTICAL`** - Each column displays a solid random color
- **`COLOR_HORIZONTAL`** - Each row displays a solid random color  
- **`COLOR_DIAGONAL`** - Colors follow diagonal patterns across the board

*Uses Vestaboard's 8 color tiles: Red, Orange, Yellow, Green, Blue, Violet, Black, and Filled*

### State Management
- **Save current state**: Create event with title `SAVE`
- **Restore saved state**: Create event with title `RESTORE`

This allows you to save the current board display and restore it later.

## Example Workflow

1. **8:00 AM** - Event titled `SAVE` (saves current board state)
2. **8:01 AM** - Event titled `WEATHER` (shows weather forecast)
3. **8:15 AM** - Event titled `COLOR_RANDOM` (displays random color pattern)
4. **8:30 AM** - Event titled `RESTORE` (restores saved state)
5. **12:00 PM** - Event titled `LUNCH` (shows school lunch menu)
6. **3:00 PM** - Event titled `URL:https://myapi.com/quote` (shows custom content)
7. **6:00 PM** - Event titled `COLOR_DIAGONAL` (displays diagonal color pattern)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.