# StadiPass - Stadium Entrance Ticketing System

A modern, scalable stadium ticketing system built with Node.js, TypeScript, MongoDB, and Docker. Features secure authentication, role-based access control, and a complete CI/CD pipeline.

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Refresh Tokens + Session Management
- **Security**: Helmet, Rate Limiting, CORS, Input Validation
- **Containerization**: Multi-stage Docker builds
- **CI/CD**: GitHub Actions with Docker Hub integration
- **Infrastructure**: Docker Compose, Kubernetes ready

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- MongoDB (local or cloud)

### Local Development

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd stadipass
   cd backend
   cp ENV_SAMPLE .env
   ```

2. **Configure environment**
   ```bash
   # Edit .env file
PORT=5000
   MONGO_URI=mongodb://localhost:27017/stadipass
   JWT_SECRET=your-super-secret-jwt-key
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your-admin-password
   ```

3. **Install dependencies and start**
   ```bash
   npm install
   npm run dev
   ```

4. **Verify setup**
   ```bash
   curl http://localhost:5000/health
   # Expected: {"status":"OK","version":"dev","message":"StadiPass backend running 🚀"}
   ```

### Docker Development

1. **Start with Docker Compose**
   ```bash
   cd infra
   docker-compose up -d
   ```

2. **Or run individual containers**
   ```bash
   # Start MongoDB
   docker run -d --name mongo -p 27017:27017 mongo:6
   
   # Build and run backend
   docker build -t stadipass-backend -f backend/Dockerfile backend
   docker run -d --name backend -p 5000:5000 \
     -e MONGO_URI=mongodb://mongo:27017/stadipass \
     -e ADMIN_EMAIL=admin@example.com \
     -e ADMIN_PASSWORD=secret12 \
     --link mongo stadipass-backend
   ```

## 📚 API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "secret12"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Sets refresh_token cookie (httpOnly, Secure)**

#### Refresh Token
```http
POST /api/auth/refresh
Cookie: refresh_token=...
Cookie: refresh_token_id=...   # non-HTTP-only helper for fast session lookup
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "68c1af6817b7c8cebf7e18cc",
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin"
}
```

#### Logout
```http
POST /api/auth/logout
Cookie: refresh_token=...
Cookie: refresh_token_id=...
```

**Response:** `204 No Content`

### Email Verification

You can verify using either POST or GET (useful for email links):

```http
GET /api/auth/verify-email?token=<token>&email=<email>
```

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "..."
}
```

In non-production, verification and reset URLs are also logged to the server console for easy testing.

### Stadiums (Admin Only)

#### Create Stadium
```http
POST /api/stadiums
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "National Arena",
  "location": "Addis Ababa",
  "capacity": 50000,
  "sections": [
    {"name": "VIP", "capacity": 1000},
    {"name": "Regular", "capacity": 49000}
  ]
}
```

#### List Stadiums
```http
GET /api/stadiums
Authorization: Bearer <token>
```

#### Get Stadium
```http
GET /api/stadiums/:id
Authorization: Bearer <token>
```

#### Update Stadium
```http
PATCH /api/stadiums/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "capacity": 52000
}
```

#### Delete Stadium
```http
DELETE /api/stadiums/:id
Authorization: Bearer <admin-token>
```

### Events (Admin Only)

#### Create Event
```http
POST /api/events
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "stadium": "68c1af6817b7c8cebf7e18cc",
  "title": "Team A vs Team B",
  "startsAt": "2025-10-01T18:00:00.000Z",
  "endsAt": "2025-10-01T20:00:00.000Z",
  "ticketCategories": [
    {"name": "VIP", "price": 500, "quota": 100},
    {"name": "Regular", "price": 100, "quota": 1000}
  ],
  "isPublished": false
}
```

#### List Events
```http
GET /api/events
Authorization: Bearer <token>

# Filter by stadium
GET /api/events?stadium=68c1af6817b7c8cebf7e18cc

# Notes:
# - Non-admin users only see events where isPublished=true
# - Admin users can see all events
```

#### Get Event
```http
GET /api/events/:id
Authorization: Bearer <token>
```

#### Update Event
```http
PATCH /api/events/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isPublished": true,
  "title": "Team A vs Team B - Final"
}
```

#### Delete Event
```http
DELETE /api/events/:id
Authorization: Bearer <admin-token>
```

## 🔐 Security Features

- **JWT Authentication**: Short-lived access tokens (15 minutes)
- **Refresh Tokens**: Long-lived, httpOnly cookies (30 days)
- **Session Management**: Tracked sessions with device info
- **Rate Limiting**: Auth routes (5/15min), API routes (100/15min)
- **Security Headers**: Helmet with CSP, CORS policies
- **Input Validation**: Zod schemas for all endpoints
- **Password Security**: bcrypt with salt rounds
- **Admin Bootstrap**: Secure first-time admin creation

## 🏗️ Project Structure

```
stadipass/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Auth, security, error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API route definitions
│   │   ├── utils/           # Utilities (cookies, bootstrap)
│   │   └── server.ts        # Main application entry
│   ├── Dockerfile           # Multi-stage container build
│   ├── package.json
│   └── ENV_SAMPLE          # Environment template
├── frontend/                # React frontend (coming soon)
├── infra/
│   ├── docker-compose.yml   # Local development
│   ├── k8s/                 # Kubernetes manifests
│   └── terraform/           # Infrastructure as code
├── .github/workflows/       # CI/CD pipelines
└── README.md
```

## 🚀 Deployment

### Docker Hub

The CI pipeline automatically builds and pushes images on `main` branch:

```bash
# Images are available at:
tensae61/stadipass-backend:latest
tensae61/stadipass-backend:ci-<run-number>
tensae61/stadipass-backend:<commit-sha>
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | `dev-secret` |
| `ADMIN_EMAIL` | Bootstrap admin email | Optional |
| `ADMIN_PASSWORD` | Bootstrap admin password | Optional |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,http://localhost:3000` |
| `APP_VERSION` | Application version | `dev` |
| `ACCESS_TOKEN_TTL` | Access token lifetime | `15m` |
| `REFRESH_TOKEN_TTL` | Refresh token lifetime | `30d` |

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure `MONGO_URI` for production database
- [ ] Set `CORS_ORIGINS` for your frontend domains
- [ ] Remove or secure `ADMIN_EMAIL`/`ADMIN_PASSWORD`
- [ ] Enable HTTPS in production
- [ ] Configure monitoring and logging
- [ ] Set up database backups

## 🧪 Testing

### Manual Testing with Thunder Client

1. **Setup**: Import the collection or use individual requests
2. **Login**: POST `/api/auth/login` with admin credentials
3. **Test endpoints**: Use the returned token for authenticated requests
4. **Refresh**: Test token refresh with cookie-based requests

### Container Testing

```bash
# Build and test locally
docker build -t stadipass-backend:test -f backend/Dockerfile backend

# Run with MongoDB
docker run -d --name mongo -p 27017:27017 mongo:6
docker run -d --name backend -p 5000:5000 \
  -e MONGO_URI=mongodb://mongo:27017/stadipass \
  -e ADMIN_EMAIL=admin@example.com \
  -e ADMIN_PASSWORD=secret12 \
  --link mongo stadipass-backend:test

# Test health
curl http://localhost:5000/health
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow:

1. **Build**: Compiles TypeScript and creates Docker image
2. **Test**: Runs health checks in container
3. **Push**: On `main` branch, pushes to Docker Hub with multiple tags
4. **Security**: Includes security headers and rate limiting

## 📈 Monitoring

- **Health Check**: `GET /health` returns service status and version
- **Request IDs**: Every request gets a unique ID for tracing
- **Structured Logs**: JSON-formatted logs for easy parsing
- **Rate Limiting**: Built-in protection against abuse

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the API documentation above
- Review the environment configuration
- Check container logs for errors
- Ensure MongoDB is accessible

---

**StadiPass** - Making stadium access seamless and secure! 🎫⚽