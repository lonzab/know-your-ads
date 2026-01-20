# KnowYourAds

A mobile-first web app for discovering ads you actually want to see. Users swipe through vertical video ads in an Instagram Stories-style interface.

## Features

- **Stories-style feed** - Full-screen vertical video ads (9:16)
- **Swipe gestures**
  - Right = Like
  - Left = Dislike
  - Up = Skip/Indifferent
- **Tap navigation**
  - Tap right side = Next ad
  - Tap left side = Previous ad
  - Press & hold = Pause video
- **Personalization** - Feed adapts based on swipes, watch time, and clicks
- **Admin dashboard** - Create, edit, and manage ads
- **Event tracking** - Impressions, watch time, completion, swipes, clicks

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- PWA-ready

## Getting Started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database (local, Neon, or Supabase)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/knowyourads?schema=public"

# Admin password for /admin page
ADMIN_PASSWORD="your-secure-password"
```

### 4. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample ads
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with "Start Swiping" CTA |
| `/feed` | Main Stories-style ad feed |
| `/admin` | Admin dashboard (password protected) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/feed` | GET | Get personalized ad feed |
| `/api/events` | POST | Track events (impressions, swipes, etc.) |
| `/api/ads` | GET/POST | List/create ads (admin only) |
| `/api/ads/[id]` | GET/PATCH/DELETE | Manage single ad (admin only) |

## Event Types

| Event | When Fired | Payload |
|-------|------------|---------|
| `impression` | Ad visible for 500ms+ | `{ visible_ms }` |
| `view_start` | Video starts playing | `{}` |
| `watch_time` | On pause/swipe/leave | `{ watch_time_ms }` |
| `complete` | Video reaches end | `{ completed: true }` |
| `swipe` | User swipes | `{ direction: "right"|"left"|"up" }` |
| `click` | CTA button clicked | `{ destination_url }` |

## Personalization Logic

No machine learning - simple rules-based scoring:

| Action | Score Delta |
|--------|-------------|
| Swipe Right | +5 per category tag |
| Swipe Left | -5 per category tag |
| Swipe Up | 0 |
| Watch ≥75% | +3 per category tag |
| Watch <25% | -1 per category tag |
| Click CTA | +10 per category tag |

- First ~5 swipes = **Exploration mode** (random ads)
- After that = **Personalized mode** (biased toward high-scoring categories)

## Deployment

Vercel-compatible. Just connect your repo and add environment variables.

```bash
npm run build
```

## Project Structure

```
knowyourads/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Sample data seeder
├── public/
│   └── manifest.json    # PWA manifest
├── src/
│   ├── app/
│   │   ├── admin/       # Admin dashboard
│   │   ├── api/         # API routes
│   │   ├── feed/        # Main feed page
│   │   ├── globals.css  # Global styles
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Landing page
│   ├── components/
│   │   └── StoryCard.tsx # Video story component
│   ├── lib/
│   │   ├── ads.ts       # Ad data access
│   │   ├── auth.ts      # Admin auth
│   │   ├── events.ts    # Event tracking
│   │   ├── personalization.ts
│   │   ├── prisma.ts    # DB client
│   │   ├── sessions.ts  # Session management
│   │   ├── useEventTracker.ts
│   │   └── useSession.ts
│   └── types/
│       └── index.ts     # TypeScript types
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## License

MIT
