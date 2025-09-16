# OAuth Setup Guide for StadiPass

This guide will help you set up Google and GitHub OAuth authentication for the StadiPass application.

## Prerequisites

- Google Cloud Console account
- GitHub account
- StadiPass backend and frontend running locally

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### 2. Configure OAuth Consent Screen

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: `StadiPass`
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Add test users (for development)

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set authorized redirect URIs:
   - `http://localhost:5000/auth/callback` (for backend)
   - `http://localhost:5173/auth/callback` (for frontend development)
5. Copy the Client ID and Client Secret

### 4. Configure Backend

Add to your `.env` file in the backend directory:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: `StadiPass`
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5000/auth/callback`
4. Click "Register application"
5. Copy the Client ID and generate a Client Secret

### 2. Configure Backend

Add to your `.env` file in the backend directory:

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

## Frontend Configuration

### 1. Create Environment File

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

### 2. Update OAuth Service

The OAuth service is already configured to use these environment variables. No additional changes needed.

## Testing OAuth Flow

### 1. Start the Backend

```bash
cd backend
npm run dev
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Test OAuth Login

1. Go to `http://localhost:5173/login`
2. Click on "Google" or "GitHub" button
3. Complete the OAuth flow
4. You should be redirected back to the application and logged in

## Production Configuration

### 1. Update Redirect URIs

For production, update the redirect URIs in both Google and GitHub OAuth apps:

- Google: `https://yourdomain.com/auth/callback`
- GitHub: `https://yourdomain.com/auth/callback`

### 2. Update Environment Variables

Update your production environment variables:

```env
# Backend
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
APP_BASE_URL=https://yourdomain.com

# Frontend
VITE_API_URL=https://yourdomain.com/api
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_GITHUB_CLIENT_ID=your_production_github_client_id
```

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure the redirect URI in your OAuth app matches exactly
   - Check for trailing slashes and protocol (http vs https)

2. **"Client ID not found" error**
   - Verify the Client ID is correct in your environment variables
   - Ensure the OAuth app is properly configured

3. **"Access denied" error**
   - Check if the user has granted the required permissions
   - Verify the OAuth consent screen is properly configured

4. **CORS errors**
   - Ensure the frontend URL is added to CORS_ORIGINS in backend
   - Check if the API URL is correct

### Debug Mode

To see OAuth URLs in development, check the backend console logs. The system will log verification and reset URLs when SMTP is not configured.

## Security Notes

1. **Never commit OAuth secrets to version control**
2. **Use different OAuth apps for development and production**
3. **Regularly rotate OAuth secrets**
4. **Monitor OAuth app usage in Google/GitHub dashboards**
5. **Use HTTPS in production**

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

