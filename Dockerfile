# Multi-stage Dockerfile for CHILLMODE Full-Stack Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root, backend and frontend package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm run install:all || (cd backend && npm install && cd ../frontend && npm install)

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build backend and frontend
RUN npm run build --prefix backend
RUN npm run build --prefix frontend

# Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy backend production dependencies & built code
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 5000

WORKDIR /app/backend

CMD ["node", "dist/index.js"]
