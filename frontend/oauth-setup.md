# OAuth Setup Guide

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
7. Copy the Client ID and add it to your `.env.local` file:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: StadiPass
   - Homepage URL: `http://localhost:3000` (development)
   - Authorization callback URL: `http://localhost:3000/auth/callback`
4. Click "Register application"
5. Copy the Client ID and add it to your `.env.local` file:
   ```
   VITE_GITHUB_CLIENT_ID=your_github_client_id_here
   ```

## Environment Variables

Create a `.env.local` file in the frontend directory with:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GITHUB_CLIENT_ID=your_github_client_id_here

# Environment
VITE_NODE_ENV=development
```

## Backend OAuth Endpoints

The backend needs to implement OAuth callback endpoints:

- `POST /api/auth/oauth/callback` - Handle OAuth callback
- `GET /api/auth/oauth/google` - Initiate Google OAuth
- `GET /api/auth/oauth/github` - Initiate GitHub OAuth

These endpoints should:
1. Exchange the authorization code for access tokens
2. Fetch user profile information
3. Create or update user account
4. Return JWT token for frontend authentication
