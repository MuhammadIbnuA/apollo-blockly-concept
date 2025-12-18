# BlockyKids Python Executor

Python code execution API for BlockyKids educational platform.

## Deploy to Replit

### Step 1: Create New Repl
1. Go to [replit.com](https://replit.com)
2. Click **Create Repl**
3. Choose **Import from GitHub** atau **Upload folder**
4. Upload semua file di folder `python-executor/`

### Step 2: Install Dependencies
Di Shell Replit, jalankan:
```bash
npm install
```

### Step 3: Run
Klik tombol **Run** atau jalankan:
```bash
npm start
```

### Step 4: Get URL
Setelah running, Replit akan memberikan URL publik seperti:
```
https://your-repl-name.your-username.repl.co
```

### Step 5: Update BlockyKids Frontend
Update file `src/services/judge0.ts` di BlockyKids, ganti:
```typescript
const JUDGE0_API_URL = process.env.NEXT_PUBLIC_JUDGE0_URL || 'http://localhost:2359';
```
Menjadi URL Replit kamu:
```typescript
const JUDGE0_API_URL = process.env.NEXT_PUBLIC_JUDGE0_URL || 'https://your-repl-name.your-username.repl.co';
```

Atau set environment variable di `.env.local`:
```
NEXT_PUBLIC_JUDGE0_URL=https://your-repl-name.your-username.repl.co
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server info |
| `/about` | GET | Version info |
| `/submissions` | POST | Execute Python code |

## Example Request

```bash
curl -X POST https://your-replit-url.repl.co/submissions?base64_encoded=false&wait=true \
  -H "Content-Type: application/json" \
  -d '{"source_code": "print(\"Hello World!\")", "language_id": 71}'
```

## Local Development

```bash
npm install
npm start
# Server runs on http://localhost:3000
```
