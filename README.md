# E-Commerce Shopping Cart (MERN)

This repository contains a simple MERN (MongoDB, Express.js, React, Node.js) shopping cart example.

Backend (port 5000)
- Location: `backend/`
- Start: `cd backend; npm install; npm run dev` (or `npm start`)
- Env: `MONGO` (mongodb connection string), `JWT_SECRET` (optional)
- Endpoints:
  - `POST /users` — register { username, password }
  - `POST /users/login` — login { username, password } → returns token
  - `GET /items` — list items
  - `POST /carts` — add item to active cart { item_id } (Authorization: Bearer <token>)
  - `GET /carts` — list user's carts (Authorization)
  - `POST /orders` — convert active cart to order (Authorization)
  - `GET /orders` — list user's orders (Authorization)

The backend seeds some sample items on first run.

Frontend (port 3000)
- Location: `frontend/`
- Start: `cd frontend; npm install; npm start`
- The app uses `localStorage` to store the token and hits `http://localhost:5000` for API calls.

Notes
- Auth is JWT-based and single-device: logging in replaces the previously stored token in the user document, invalidating previous sessions.
- No inventory tracking (infinite stock assumed).
- Real product data loaded from Fake Store API on first run.

Quick Start
```bash
# Run the batch file to start both servers automatically
start-servers.bat

# Or manually:
# Terminal 1 - Backend
cd backend && node server.js

# Terminal 2 - Frontend  
cd frontend && npm start
```

Troubleshooting
- **401 Unauthorized errors**: Make sure you're logged in before trying to add items to cart
- **Database issues**: Run `node backend/clear-db.js` to reset the database
- **API data not loading**: The app will use fallback data if the Fake Store API is unavailable
- **Port conflicts**: Make sure ports 3000 and 5000 are available

Features
- 🛍️ Real product data from Fake Store API (20+ products)
- 🎨 Modern responsive UI with card-based design
- 🏷️ Category filtering (Electronics, Clothing, Jewelry)
- ⭐ Product ratings and reviews
- 💰 Real pricing and detailed descriptions
- 🛒 Shopping cart with real-time counter
- 📦 Order history and checkout system
- 🔐 JWT authentication with session management
