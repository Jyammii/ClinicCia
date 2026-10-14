# ClinicNow deployment guide

This project is already a full-stack MERN application.  Deploy it as two services:

```
Browser -> Vercel (React client) -> Render (Express API) -> MongoDB Atlas
```

## 1. Prepare MongoDB Atlas

1. In Atlas, create a database deployment (the free tier is fine for a school demo).
2. Create a **database user** with a long password. This is not the same as your Atlas login.
3. In **Network Access**, add the IP ranges that can connect. For a quick class demo, `0.0.0.0/0` works, but use a restricted range for a real deployment.
4. Click **Connect > Drivers > Node.js** and copy the `mongodb+srv://...` string. Replace `<password>` with the URL-encoded database-user password, and use `clinicnow` as the database name.

Never commit this URI or any secret to GitHub.

## 2. Test against Atlas locally (optional but recommended)

Create `server/.env` from `server/.env.example`. Set at least:

```dotenv
MONGO_URI=your-Atlas-connection-string
JWT_SECRET=a-long-random-secret
CLIENT_URL=http://localhost:5173
```

Then run from the project root:

```bash
npm run install:all
npm run seed
npm run dev
```

`npm run seed` clears the selected database and inserts demo data, so use it only with a demo database.

## 3. Put the code on GitHub

From the project root:

```bash
git init
git add .
git commit -m "Prepare ClinicNow for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/clinicnow.git
git push -u origin main
```

Before pushing, run `git status` and confirm that `server/.env`, `node_modules`, and files under `server/uploads/` are not listed.

## 4. Deploy the backend on Render

1. In Render, select **New > Blueprint** and select the GitHub repository. Render reads `render.yaml`.
2. Enter `MONGO_URI` (the Atlas connection string) and set `CLIENT_URL` temporarily to `http://localhost:5173`.
3. Create the service and wait for a successful deploy. Open `https://YOUR-RENDER-SERVICE.onrender.com/api/health`; it should return `{ "ok": true, ... }`.

The blueprint gives the API these production values: `rootDir: server`, `buildCommand: npm ci`, `startCommand: npm start`, and a `/api/health` health check. Render generates a secure `JWT_SECRET` automatically; do not replace it unless you intentionally rotate it.

## 5. Deploy the frontend on Vercel

1. In Vercel, import the same GitHub repository.
2. Set **Root Directory** to `client`. Vercel should detect Vite.
3. Under **Environment Variables**, add these for Production, Preview, and Development as appropriate:

```dotenv
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
VITE_ASSET_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

4. Deploy. Copy the final `https://YOUR-PROJECT.vercel.app` URL.

## 6. Allow the Vercel site in the API

Go back to Render > Environment and set:

```dotenv
CLIENT_URL=https://YOUR-PROJECT.vercel.app
```

For a custom domain plus the Vercel domain, separate the allowed URLs with a comma:

```dotenv
CLIENT_URL=https://app.example.com,https://YOUR-PROJECT.vercel.app
```

Save changes and wait for Render to redeploy. Then test sign-up/login, doctor search, appointment booking, dashboard CRUD, and an image upload from the Vercel URL.

## Important production note: uploaded images

The current uploader writes files to `server/uploads`. Render’s local disk can be erased on redeploy or restart, so these uploaded images are suitable only for a classroom/demo deployment. For a real clinic, replace this storage with Cloudinary, S3, or another persistent object-storage service before putting real patient or clinic data online.

## Security checklist

- Change all documented demo passwords before sharing the site.
- Use a separate Atlas database for demo data; do not seed a real clinic database.
- Keep `MONGO_URI` and `JWT_SECRET` only in Render/Atlas environment settings.
- Restrict Atlas network access and limit which administrators can access production accounts.
- Do not use this demo as a production medical-record system without a security, privacy, backup, and compliance review.
