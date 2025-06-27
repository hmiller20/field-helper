# Researcher Time Tracking with Supabase

This application includes a researcher time tracking feature to monitor hours that research assistants spend collecting data. Data is now stored in Supabase for remote access from any device.

## Features

- **Sign-in/Sign-out**: Researchers can sign in and out using a simple interface
- **Time Tracking**: Automatic tracking of hours worked with real-time sync to Supabase
- **Session Counting**: Tracks the number of data collection sessions completed during each shift
- **Remote Access**: View researcher hours and session counts from any device with internet access
- **Data Export**: Export time tracking data from Supabase as JSON files
- **Password Protection**: Simple password protection (currently "5678")
- **Offline Backup**: Data saved locally if Supabase is unavailable

## Setup Instructions

### 1. Supabase Setup

1. **Create a Supabase Account**: Go to [https://supabase.com](https://supabase.com) and create a free account
2. **Create a New Project**: Click "New Project" and follow the setup
3. **Get Your Credentials**: Go to Settings > API and copy:
   - Project URL
   - Anon/Public Key

### 2. Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace with your actual Supabase credentials.

### 3. Database Table Creation

In your Supabase dashboard, go to SQL Editor and run this query to create the table:

```sql
CREATE TABLE researcher_sessions (
  id TEXT PRIMARY KEY,
  researcher_name TEXT NOT NULL,
  sign_in_time TIMESTAMPTZ NOT NULL,
  sign_out_time TIMESTAMPTZ,
  date DATE NOT NULL,
  duration_hours DECIMAL(5,2),
  sessions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX idx_researcher_sessions_researcher_name ON researcher_sessions(researcher_name);
CREATE INDEX idx_researcher_sessions_date ON researcher_sessions(date);
```

## How to Use

1. **Sign In**: Click the "Researcher Sign-In" button on the consent page
2. **Select Researcher**: Choose from the dropdown list
3. **Enter Password**: Enter the password (currently hardcoded as "5678")
4. **Collect Data**: Each time you complete a session and click "Record Data and Return to Consent Form" on the experimenter page, the session count increments
5. **Sign Out**: When finished, click the "Sign Out" button - this syncs all data to Supabase and resets the session counter
6. **View Hours**: Click "View Hours" to see a summary of all researcher shifts and session counts
7. **Export Data**: Click "Export" to download data from Supabase

## Remote Access

You can check researcher hours from any device by:
1. Opening the app on any device with internet
2. Clicking "Researcher Sign-In" → "View Hours" (no sign-in needed to view)
3. Using the Supabase dashboard directly at [https://supabase.com](https://supabase.com)

## Customizing Researchers

To add/remove researchers from the list, edit the `RESEARCHERS` array in `app/components/ResearcherSignIn.tsx`:

```typescript
const RESEARCHERS = [
  "Your Researcher Name 1",
  "Your Researcher Name 2", 
  "Your Researcher Name 3",
  // Add more researchers here
]
```

## Changing the Password

To change the password, edit the `CORRECT_PASSWORD` constant in `app/components/ResearcherSignIn.tsx`:

```typescript
const CORRECT_PASSWORD = "your-new-password"
```

## Data Storage

### Primary Storage: Supabase
- All completed researcher sessions are stored in Supabase
- Real-time sync when researchers sign out
- Accessible from any device with internet

### Backup Storage: Local Storage
- Data is saved locally in case of internet issues
- Falls back to local storage if Supabase fails
- Keys: `currentResearcher`, `researcherSessions`

### Data Format
Data includes:
- Researcher name
- Date (YYYY-MM-DD in EST)
- Sign-in time (EST timezone)
- Sign-out time (EST timezone)
- Duration in hours
- Sessions completed during shift
- Session ID
- Creation timestamp

**Important**: All times are stored and displayed in Eastern Time (EST/EDT), automatically adjusting for daylight saving time. The sessions completed counter tracks how many data collection sessions were completed during each researcher shift.

## Files Modified

- `app/lib/supabase.ts` - Supabase client configuration
- `app/api/researcher/route.ts` - API routes for Supabase operations
- `app/utils/sessionData.ts` - Added Supabase sync functionality
- `app/components/ResearcherSignIn.tsx` - Updated with remote data access
- `app/consent/page.tsx` - Added sign-in button to consent page
- `.gitignore` - Added `/data/` to ignore local export files

## Troubleshooting

### Environment Variables Not Working
- Make sure `.env.local` is in the project root (same level as `package.json`)
- Restart your development server after adding environment variables
- Check that variable names start with `NEXT_PUBLIC_`

### Supabase Connection Issues
- Verify your credentials in the Supabase dashboard
- Check that the table exists with the correct schema
- Ensure your Supabase project is not paused (free tier)

### Data Not Syncing
- Check browser console for error messages
- Verify internet connection
- Data is saved locally as backup if Supabase fails

## Alternative Storage Options

If you prefer other storage methods:

1. **Airtable**: Easy spreadsheet-like interface
2. **Google Sheets API**: Direct export to Google Sheets
3. **Firebase**: Google's database service
4. **Local SQLite**: File-based database
5. **CSV Export**: For manual data management 