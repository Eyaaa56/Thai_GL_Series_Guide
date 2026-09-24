# Deploying Roseframe on Vercel

This repository deploys as one Vercel project:

- `client/` builds to the static site.
- `api/index.js` runs the Express API as a Vercel Function.
- MongoDB Atlas stores application data.
- Admin cover-image uploads are written to Vercel Blob; MongoDB stores only the Blob URL.

## Configure cloud services

1. Create a MongoDB Atlas cluster and database user. In Atlas Network Access, allow Vercel to connect. For a simple first deployment, allow `0.0.0.0/0`, then restrict the policy appropriately.
2. In Vercel, import this repository. Under **Storage**, create a Blob store and connect it to the project. This creates a `BLOB_READ_WRITE_TOKEN`.
3. In Vercel Project Settings → Environment Variables, set these for Production, Preview, and Development:

| Variable | Value |
| --- | --- |
| `MONGO_URI` | Atlas SRV URI, for example `mongodb+srv://.../roseframe?retryWrites=true&w=majority` |
| `JWT_SECRET` | A long random secret |
| `BLOB_READ_WRITE_TOKEN` | The token supplied by Vercel Blob |

Leave `VITE_API_URL` unset on Vercel. The frontend calls the same-origin `/api` Function.

## Deploy

Vercel detects `vercel.json`, builds `client/dist`, and rewrites `/api/*` to the Express Function. The application does not rely on a persistent function filesystem.

For local development, configure `server/.env` with `MONGO_URI`, `JWT_SECRET`, and `BLOB_READ_WRITE_TOKEN`, then run:

```powershell
cd server
npm.cmd run dev

cd ../client
npm.cmd run dev
```

Only administrator sessions can upload cover images. Allowed types are JPG, PNG, WEBP, and GIF; files are limited to 4 MB and are stored in Vercel Blob.
