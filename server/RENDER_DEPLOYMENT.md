# Render Deployment Guide

This guide will help you deploy the Techligence backend to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. MongoDB database (MongoDB Atlas recommended for production)
3. All required API keys and secrets

## Deployment Steps

### Option 1: Using Render Blueprint (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. In Render dashboard, click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect the `render.yaml` file in the server folder
5. Configure the root directory as `server` in the service settings
6. Add all required environment variables (see below)
7. Deploy!

### Option 2: Manual Setup

1. Push your code to GitHub/GitLab/Bitbucket
2. In Render dashboard, click "New +" → "Web Service"
3. Connect your repository
4. Configure the service:
   - **Name**: `techligence-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add all required environment variables (see below)
6. Click "Create Web Service"

## Required Environment Variables

Add these in the Render dashboard under "Environment" tab:

### Required (Server won't start without these):
```
NODE_ENV=production
PORT=5050
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

### CORS Configuration:
```
CLIENT_URL=https://your-frontend-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-vercel-app.vercel.app
```

### Supabase (if using):
```
SUPABASE_URL=https://your-project.supabase.co
SERVICE_ROLE_SUPABASE=your-service-role-key
```

### Pinecone (if using):
```
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=techligence-content-index
```

### Razorpay (if using payments):
```
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### Email Configuration (for OTP and Contact Form):
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
CONTACT_FORM_RECEIVER_EMAIL=contact@techligence.com
```

### Ollama (if using local LLM):
```
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=phi3:mini
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

## Important Notes

1. **Root Directory**: Make sure to set the root directory to `server` in Render dashboard
2. **Port**: Render automatically sets the `PORT` environment variable, but you can override it
3. **MongoDB**: Use MongoDB Atlas for production. Update `MONGODB_URI` with your Atlas connection string
4. **JWT_SECRET**: Generate a strong, random secret for production
5. **CORS**: Update `CLIENT_URL` and `CORS_ALLOWED_ORIGINS` with your actual frontend domain(s)
6. **Health Check**: The server has a `/health` endpoint that Render can use for health checks

## Health Check Configuration

In Render dashboard, you can configure:
- **Health Check Path**: `/health`
- **Health Check Interval**: 60 seconds (default)

## Post-Deployment

1. Test the health endpoint: `https://your-service.onrender.com/health`
2. Test API endpoints: `https://your-service.onrender.com/api/products`
3. Update your frontend to use the new backend URL
4. Monitor logs in Render dashboard for any issues

## Troubleshooting

### Server won't start
- Check that all required environment variables are set
- Verify `JWT_SECRET` is set (server exits if missing)
- Check MongoDB connection string is correct

### CORS errors
- Add your frontend domain to `CORS_ALLOWED_ORIGINS`
- Update `CLIENT_URL` environment variable

### Database connection issues
- Verify MongoDB Atlas allows connections from Render's IPs (0.0.0.0/0 for all)
- Check MongoDB connection string format
- Ensure database user has proper permissions

### Build failures
- Check that `package.json` is in the `server` directory
- Verify Node.js version compatibility (Render uses Node 18+ by default)

## Support

For issues specific to Render, check their documentation: https://render.com/docs

