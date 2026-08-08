TrustLens Full Stack Prototype

1) Backend:
   cd backend
   cp .env.example .env
   set MONGO_URI and HF_API_KEY in .env
   npm install
   npm run dev

2) Frontend:
   cd frontend
   npm install
   npm start

Notes:
- If HF_API_KEY is not provided, server will give a simple fallback summary.
- OCR uses tesseract.js; large images may be slow.
