# Ngrok Setup Instructions

When using ngrok to expose your backend API, follow these steps:

## 1. Start your backend server
```bash
cd FreeStudent-API
npm start
# Server should be running on port 8080
```

## 2. Start ngrok
```bash
ngrok http 8080
```

This will give you a URL like: `https://abc123.ngrok-free.app`

## 3. Create a `.env` file in the frontend directory

Create a file named `.env` in the `freshlancer-frontend` directory with:

```env
VITE_NGROK_URL=https://your-ngrok-url.ngrok-free.app
```

Replace `your-ngrok-url` with your actual ngrok URL (without trailing slash).

**Example:**
```env
VITE_NGROK_URL=https://abc123.ngrok-free.app
```

## 4. Restart your Vite dev server

After creating/updating the `.env` file, restart your Vite dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 5. Verify it's working

The proxy should now forward all `/api/*` requests to your ngrok URL instead of localhost.

## Notes:

- The `.env` file is gitignored, so it won't be committed
- If you want to switch back to localhost, either:
  - Remove the `VITE_NGROK_URL` from `.env`, or
  - Set `VITE_API_BASE_URL=http://localhost:8080` in `.env`
- Make sure your ngrok URL doesn't have a trailing slash

