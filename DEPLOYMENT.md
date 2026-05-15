# Deployment Guide for Friends

## Local Development

### Backend Setup
```bash
cd backend
# Copy .env.example to .env and add your API keys
cp .env.example .env

# Edit .env with your Gemini API key
# GEMINI_API_KEY=your_key_here

# Run backend
source myenv/bin/activate.fish  # or activate.bat on Windows
python -m uvicorn main:app --reload
```

### Frontend Setup
```bash
# Copy .env.example to .env (optional for local dev)
cp .env.example .env

# Install and run
npm install
npm run dev
```

Then open `http://localhost:5173`

---

## Deploying to Production (Vercel + Render)

### Deploy Backend (Render)

1. **Push to GitHub** (if not already)
2. **Create Render account** at render.com
3. **Create new Web Service**
   - Connect GitHub repo
   - Set Runtime: Python 3.12
   - Build: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port 8000`
   
4. **Set Environment Variables** in Render dashboard:
   ```
   GEMINI_API_KEY=your_key
   HOST=0.0.0.0
   PORT=8000
   ENVIRONMENT=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

5. **Copy the backend URL** (e.g., `https://connections-api.render.com`)

### Deploy Frontend (Vercel)

1. **Create Vercel account** at vercel.com
2. **Import GitHub project**
3. **Set Environment Variables**:
   ```
   VITE_BACKEND_URL=https://your-backend-url-from-render.com
   ```
4. **Deploy**

---

## Security Notes

✅ CORS is now restricted to your frontend domain  
✅ Error messages don't expose details  
✅ Input validation prevents abuse  
✅ Backend only listens on localhost in dev  
✅ API keys in .env are gitignored  

For your friends-only app, this is sufficient security.

---

## Creating `requirements.txt` for backend

Run this once to create the file:
```bash
cd backend
source myenv/bin/activate.fish
pip freeze > requirements.txt
```

This ensures consistent dependencies across machines.
