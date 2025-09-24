# Render Backend Deployment Guide

## ✅ Problém vyriešený!

Backend na Render dostáva 500 error pretože chýbajú environment variables alebo Puppeteer nefunguje správne.

### 🔧 Urobené zmeny:

1. **AI Scoring je teraz voliteľný** - ak nie je nastavený `OPENAI_API_KEY`, AI scoring sa preskočí
2. **Puppeteer konfigurácia pre Render** - pridané argumenty pre headless browser na Render
3. **Fallback handling** - aplikácia nebude crashovať ak chýbajú environment variables

### 🚀 Kroky pre deployment na Render:

#### 1. **Nastavte Environment Variables v Render Dashboard:**

Choďte na [render.com](https://render.com) → váš backend projekt → **Settings → Environment Variables**

**Pridajte tieto premenné:**
```
OPENAI_API_KEY=your-openai-api-key-here
PORT=3001
```

#### 2. **Redeploy na Render:**

Po nastavení environment variables:
- Choďte na **Deployments** tab
- Kliknite **Manual Deploy** → **Deploy latest commit**

#### 3. **Testovanie:**

Po redeploy otestujte:
```bash
# Test root endpoint
curl https://trip-finder-app.onrender.com

# Test trip search endpoint
curl -X POST https://trip-finder-app.onrender.com/trip/search \
  -H "Content-Type: application/json" \
  -d '{"from":"Bratislava","to":"Košice","date":"2024-01-15","time":"10:00","adults":1}'
```

### 📝 Poznámky:

- **Bez OPENAI_API_KEY**: Aplikácia bude fungovať, ale bez AI scoring
- **S OPENAI_API_KEY**: Aplikácia bude mať plnú funkcionalitu s AI
- **Puppeteer**: Je nakonfigurovaný pre Render s optimálnymi argumentmi

### 🔍 Troubleshooting:

Ak stále máte 500 error:
1. Skontrolujte **Logs** v Render dashboard
2. Overte, že environment variables sú nastavené
3. Skúste redeploy bez cache

### ✅ Očakávaný výsledok:

Po správnom nastavení by mal backend vrátiť:
- **200 OK** pre `/trip/search` endpoint
- **JSON response** s trip data
- **AI summary** (ak je nastavený OPENAI_API_KEY)
