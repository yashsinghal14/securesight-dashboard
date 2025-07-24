# SecureSight Dashboard

A CCTV monitoring dashboard for SecureSight, built with Next.js 15, Prisma, and SQLite.

## Features

- Dashboard with Navbar, Incident Player, and Incident List
- Optimistic UI for resolving incidents
- API routes for fetching and resolving incidents
- Seed script for demo data

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Deployment

- Deploy easily to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
- Make sure to set up your `.env` file in the deployment environment.

## Technical Decisions

- **Next.js 15 App Router** for modern React and API routes
- **Prisma + SQLite** for easy local development and seeding
- **Tailwind CSS** for rapid, clean UI styling

## If I had more time...

- Implement the 24-hour incident timeline under the player
- Add a 3D view with React Three Fibre
- Add authentication and user roles
- Improve error handling and loading states
- Add real video feeds and live updates

## Credits

- [Figma design](#) (link if provided)
- Placeholder images from [Unsplash](https://unsplash.com/) or similar
