# TrustLens Backend

## Setup
1. Install Node.js and npm.
2. Create MongoDB Atlas cluster and get connection string.
3. Copy .env.example to .env and set MONGO_URI and HF_API_KEY (optional).
4. npm install
5. npm run dev

Endpoints:
- GET / 
- POST /api/users/register
- POST /api/analyze  (form-data: file or text, userId)
- GET /api/docs/:userId
