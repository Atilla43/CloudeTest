# 🎯 NicheMaster Pro Platform

AI-Powered Niche Research & Automated Content Factory

## 🚀 Phase 1: MVP Setup - COMPLETE ✅

### Project Structure

```
nichemaster-platform/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Libraries & utilities
│   ├── prisma.ts         # Prisma client
│   ├── redis.ts          # Redis client
│   └── utils.ts          # Utility functions
├── db/                    # Database utilities
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
├── docker-compose.yml    # PostgreSQL + Redis
├── .env                  # Environment variables
└── package.json          # Dependencies
```

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Docker Services (PostgreSQL + Redis)

```bash
docker compose up -d
```

This will start:
- **PostgreSQL** on `localhost:5432`
- **Redis** on `localhost:6379`

### 3. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

**Required for Module 1 (Niche Analysis):**
- `YOUTUBE_API_KEY` - Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- `SERPAPI_KEY` - Get from [SerpAPI](https://serpapi.com/)
- `OPENAI_API_KEY` - Get from [OpenAI](https://platform.openai.com/api-keys)

**Required for Module 2 (Content Factory):**
- `HEYGEN_API_KEY` - Get from [HeyGen](https://app.heygen.com/)
- `PICTORY_API_KEY` - Get from [Pictory](https://pictory.ai/)
- `ELEVENLABS_API_KEY` - Get from [ElevenLabs](https://elevenlabs.io/)

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app!

## 🗄️ Database Schema

The Prisma schema includes:

- **User** - User authentication and management
- **Niche** - Discovered and analyzed niches
- **ContentIdea** - AI-generated content ideas
- **Video** - Produced videos with analytics

## 🐳 Docker Services

### PostgreSQL
- **Port:** 5432
- **User:** nichemaster
- **Password:** nichemaster_dev_password
- **Database:** nichemaster_db

### Redis
- **Port:** 6379
- **Password:** nichemaster_redis_password

### Useful Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Remove volumes (WARNING: deletes all data)
docker compose down -v
```

## 📦 Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Next.js API Routes
- **Database:** PostgreSQL 16 (via Prisma ORM)
- **Cache:** Redis 7
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **AI:** OpenAI GPT-4o, Anthropic Claude

## 🎨 UI Components (shadcn/ui)

Add UI components as needed:

```bash
# Example: Add button component
npx shadcn@latest add button

# Add card component
npx shadcn@latest add card

# Add form components
npx shadcn@latest add form input label
```

## 📊 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🔐 Security Notes

- `.env` file is gitignored and contains sensitive data
- Never commit API keys or passwords
- Use different credentials for production
- Enable 2FA on all API service accounts

## 📝 Next Steps (Phase 1)

- [ ] Implement authentication (NextAuth.js)
- [ ] Create Module 1: Niche Analysis dashboard
- [ ] Integrate YouTube Data API
- [ ] Integrate Google Trends (SerpAPI)
- [ ] Add AI analysis with GPT-4o
- [ ] Create Module 2: Content Ideas generator
- [ ] Build basic UI components

## 🐛 Troubleshooting

### Port Already in Use

If PostgreSQL or Redis ports are already in use:

```bash
# Change ports in docker-compose.yml
# PostgreSQL: "5433:5432"
# Redis: "6380:6379"

# Update .env accordingly
DATABASE_URL="postgresql://nichemaster:nichemaster_dev_password@localhost:5433/nichemaster_db"
REDIS_URL="redis://:nichemaster_redis_password@localhost:6380"
```

### Prisma Issues

```bash
# Reset database
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate
```

### Redis Connection Error

```bash
# Check Redis is running
docker compose ps

# View Redis logs
docker compose logs redis
```

## 📚 Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Redis Docs](https://redis.io/docs/)

## 📧 Support

For issues or questions, please open an issue in the repository.

---

**Status:** ✅ Phase 1 Setup Complete - Ready for Development!
