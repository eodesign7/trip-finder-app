# Deployment Guide - Render Backend Migration

## ✅ Completed Changes

Backend bol úspešne migovaný z Railway na **Render** s endpointom:
`https://trip-finder-app.onrender.com`

### Aktualizované súbory:

1. **Environment Variables** - aktualizované v kóde s fallback hodnotami:

   - `VITE_API_URL` → `https://trip-finder-app.onrender.com`
   - `VITE_WS_URL` → `wss://trip-finder-app.onrender.com`

2. **Aktualizované súbory:**

   - `src/components/TripForm.tsx` - API endpoint
   - `src/components/search/useTripSearch.ts` - API endpoint
   - `src/hooks/use-web-socket.ts` - WebSocket endpoint
   - `src/components/LogPanel.tsx` - WebSocket endpoint
   - `vercel.json` - environment variables pre Vercel deployment

3. **Vytvorené súbory:**
   - `src/config/endpoints.ts` - centralizovaná konfigurácia endpointov

## 🚀 Next Steps

### Pre Vercel Deployment:

1. **Deploy na Vercel:**

   ```bash
   npm run build
   # Alebo push do GitHub repo pre automatický deploy
   ```

2. **Alternatívne nastavenie ENV variables v Vercel Dashboard:**
   - Choď na [vercel.com](https://vercel.com) → tvoj projekt → Settings → Environment Variables
   - Pridaj:
     - `VITE_API_URL` = `https://trip-finder-app.onrender.com`
     - `VITE_WS_URL` = `wss://trip-finder-app.onrender.com`

### Testing:

Backend endpoint je už testovaný a funguje:

- ✅ `https://trip-finder-app.onrender.com` - Status 200 OK
- ✅ CORS povolený (`access-control-allow-origin: *`)

### Lokálny development:

Pre lokálny development vytvor `.env.local` súbor:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## 📝 Poznámky

- Všetky súbory majú fallback hodnoty, takže aj bez .env súboru bude aplikácia fungovať s Render endpointom
- WebSocket endpoint bol zmenený z `ws://` na `wss://` pre HTTPS
- vercel.json už obsahuje environment variables pre automatický deploy
