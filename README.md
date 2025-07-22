# Fittese Full-Stack Application

A comprehensive fitness consultation platform with React frontend and Node.js backend.

## Project Structure

```
├── doctor/          # React frontend (Vite)
├── fittese/         # Node.js backend (Express)
└── package.json     # Root package.json for running both services
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB connection (configured in fittese/.env)

### Installation & Running

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start both frontend and backend:**
   ```bash
   npm run dev
   # or
   npm start
   ```

This will start:
- **Backend** on http://localhost:3200
- **Frontend** on http://localhost:3000

### Individual Services

- **Backend only:** `npm run backend`
- **Frontend only:** `npm run frontend`
- **Build frontend:** `npm run build`

## Configuration

### Backend Configuration (fittese/.env)
- MongoDB connection string
- JWT secrets
- API keys for email and payment services
- Port configuration (default: 3200)

### Frontend Configuration
- Automatically proxies API calls to backend during development
- Production build points to dashboard.fitetse.com
- Development mode uses localhost:3200

## Features

### Frontend (React + Vite)
- Modern React 19 with hooks
- Responsive design with Tailwind-like styling
- Interactive components (BMI calculator, consultation forms)
- Animation with Framer Motion
- Routing with React Router

### Backend (Node.js + Express)
- RESTful API endpoints
- MongoDB integration with Mongoose
- Authentication with JWT
- File upload support
- Email integration (Brevo/Sendinblue)
- Payment integration (Razorpay)
- Socket.IO for real-time communication
- API documentation with Swagger

## API Endpoints

- `/admin/*` - Admin panel routes
- `/api/*` - API endpoints
- `/uploads/*` - Static file serving

## Development Notes

- Frontend development server includes hot reload
- Backend uses nodemon for auto-restart
- CORS configured for cross-origin requests
- Environment variables managed through .env files

## Troubleshooting

If you encounter any issues:

1. **Port conflicts:** Ensure ports 3000 and 3200 are available
2. **Database connection:** Check MongoDB connection string in fittese/.env
3. **Dependencies:** Run `npm run install-all` to ensure all packages are installed
4. **Build errors:** Check console output for specific component import issues

## Production Deployment

1. Build the frontend: `npm run build`
2. Configure production environment variables
3. Deploy backend with process manager (PM2 recommended)
4. Serve frontend build files through web server (Nginx/Apache)
