# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files & install all deps (including dev for build)
COPY package*.json ./
RUN npm ci

# Copy source code & build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Copy only what’s needed for runtime 
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install only production deps
RUN npm ci --omit=dev

EXPOSE 5000
CMD ["node", "dist/server.js"]
