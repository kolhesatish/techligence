# Google OAuth Setup Guide

## Issue Fixed
The Google OAuth endpoint was returning a 500 error when `GOOGLE_CLIENT_ID` was not configured. This has been fixed to redirect to the frontend with a proper error message instead.

## Setup Instructions

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5050/api/auth/google/callback` (for local development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)
   - Save and copy the Client ID and Client Secret

### 2. Configure Environment Variables

Add these to your `server/.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5050/api/auth/google/callback
FRONTEND_URL=http://localhost:8081
```

### 3. Production Configuration

For production, update the environment variables:

```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

### 4. Verify Setup

1. Make sure your backend server is running on port 5050
2. Make sure your frontend is running on port 8081
3. Click "Sign in with Google" on the auth page
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back and logged in

## Troubleshooting

### Error: "Google OAuth is not configured"
- **Solution**: Make sure `GOOGLE_CLIENT_ID` is set in your `server/.env` file
- Restart your backend server after adding the environment variable

### Error: "redirect_uri_mismatch"
- **Solution**: Make sure the redirect URI in Google Cloud Console matches exactly:
  - For development: `http://localhost:5050/api/auth/google/callback`
  - For production: `https://yourdomain.com/api/auth/google/callback`

### Error: "invalid_client"
- **Solution**: Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Make sure there are no extra spaces or quotes in the `.env` file

### Error: 500 Internal Server Error
- **Solution**: Check backend server logs for detailed error messages
- Verify all environment variables are set correctly
- Make sure MongoDB is running and connected

## Security Notes

1. **Never commit** your `.env` file to version control
2. Keep your `GOOGLE_CLIENT_SECRET` secure
3. Use different OAuth credentials for development and production
4. Regularly rotate your OAuth credentials

## Testing Without Google OAuth

If you don't want to set up Google OAuth, you can still use the application with:
- Email/Password registration and login
- OTP verification for account activation

The Google OAuth button will show an error message if not configured, but won't break the application.

