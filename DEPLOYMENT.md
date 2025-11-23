# Deployment Guide

## Frontend Deployment on Vercel

### Step 1: Prepare your repository
Ensure your frontend code is in the `/frontend` directory and your environment variables are properly set.

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click "Import Project" and select your GitHub repository
3. Configure the project settings:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 3: Add Environment Variables
In Vercel dashboard, go to your project settings > Environment Variables and add:
```
REACT_APP_API_BASE_URL = https://ecommerce-shopping-cart-awyn.onrender.com
```

### Step 4: Deploy
Click "Deploy" and Vercel will automatically build and deploy your frontend.

## Backend Deployment on Render

Your backend is already deployed at: https://ecommerce-shopping-cart-awyn.onrender.com

### Environment Variables for Render:
Set these in your Render dashboard under Environment Variables:
```
NODE_ENV=production
PORT=10000
MONGO=mongodb+srv://your-connection-string
JWT_SECRET=your-secure-jwt-secret
CORS_ORIGIN=https://your-vercel-app.vercel.app
FRONTEND_URL=https://your-vercel-app.vercel.app
```

To redeploy or update:
1. Push changes to your GitHub repository
2. Render will automatically redeploy your backend service
3. Update CORS_ORIGIN with your actual Vercel URL after frontend deployment

## Environment Configuration

### For Local Development:
Create `frontend/.env`:
```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

### For Production:
The frontend `.env` already has the production URL configured.

## Testing the Deployment

1. After deployment, test the login with demo credentials:
   - Username: `demo`
   - Password: `demo123`

2. Test key features:
   - User registration/login
   - Product browsing
   - Adding items to cart
   - Checkout process
   - Order history

## Troubleshooting

- **CORS Issues**: Ensure your backend CORS settings allow your Vercel domain
- **API Connection**: Verify the `REACT_APP_API_BASE_URL` environment variable
- **Build Errors**: Check that all dependencies are in `package.json`