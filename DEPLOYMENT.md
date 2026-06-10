# Apartment Management System — Deployment Guide

## Prerequisites
- Node.js 18+
- npm 9+
- Angular CLI 18+ (`npm install -g @angular/cli`)

## Quick Start (Development)

### 1. Backend
```bash
cd backend
npm install
node src/db/migrate.js   # Run migrations
node src/db/seed.js      # Load seed data
npm run dev              # Start on http://localhost:3000
```

### 2. Frontend
```bash
cd frontend
npm install --legacy-peer-deps
ng serve                 # Start on http://localhost:4200
```

API docs: http://localhost:3000/api/docs

### 3. Default Login Credentials
| Role   | Username | Password    |
|--------|----------|-------------|
| Admin  | admin    | Admin@123   |
| Owner  | owner1   | Owner@123   |
| Tenant | tenant1  | Tenant@123  |

---

## Environment Variables (backend/.env)
```
PORT=3000
NODE_ENV=development
JWT_SECRET=<change-this-in-production>
JWT_REFRESH_SECRET=<change-this-in-production>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
DB_PATH=./database/apartment.db
CORS_ORIGIN=http://localhost:4200
```

---

## Production Deployment

### Option A: Single-Server (Express serves Angular build)

```bash
# Build frontend
cd frontend
ng build --configuration=production
# Output: frontend/dist/frontend/browser/

# Copy build output to backend/public
mkdir -p ../backend/public
cp -r dist/frontend/browser/* ../backend/public/

# Start backend (serves both API and static files)
cd ../backend
NODE_ENV=production npm start
```

Add to `backend/src/app.js` (before 404 handler):
```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
```

### Option B: Separate Servers (Nginx + PM2)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
NODE_ENV=production pm2 start server.js --name apartment-api

# Nginx config for frontend
# server {
#   listen 80;
#   root /var/www/apartment/frontend/dist/frontend/browser;
#   location /api { proxy_pass http://localhost:3000; }
#   location / { try_files $uri $uri/ /index.html; }
# }
```

---

## Database Backups
```bash
# SQLite backup (just copy the .db file)
cp backend/database/apartment.db backend/database/apartment_backup_$(date +%Y%m%d).db
```

---

## Re-seed Data
```bash
cd backend
node src/db/seed.js
```

To reset DB completely:
```bash
rm backend/database/apartment.db
node src/db/migrate.js
node src/db/seed.js
```
