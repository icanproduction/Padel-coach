# Padel Coach Pro

Digital skill assessment & progress tracking for padel coaching.

## 📚 Documentation

Before starting development, read these files in order:

1. **[CLAUDE.md](./CLAUDE.md)** - Project overview, tech stack, database overview
2. **[CODE_INSTRUCTIONS.md](./CODE_INSTRUCTIONS.md)** - Development guidelines to prevent bugs
3. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete database reference

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local`
3. Fill in your Supabase credentials

```bash
cp .env.local.example .env.local
```

### 3. Run Database Migrations

In your Supabase SQL Editor, run these files in order:

1. `database/01_schema.sql` - Creates all tables
2. `database/02_rls_policies.sql` - Sets up security policies
3. `database/03_seed_data.sql` - Adds test data

**Important:** For seed data to work, you must first create the test users in Supabase Auth Dashboard:

- admin@padelcoach.pro
- coach@padelcoach.pro
- player@padelcoach.pro

All with password: `password123`

Then update the UUIDs in `03_seed_data.sql` with the actual user IDs.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🧪 Test Accounts

After setting up the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@padelcoach.pro | password123 |
| Coach | coach@padelcoach.pro | password123 |
| Player | player@padelcoach.pro | password123 |

## 📁 Project Structure

```
padel-coach-pro/
├── CLAUDE.md                    # Project context for Claude
├── CODE_INSTRUCTIONS.md         # Development guidelines
├── DATABASE_SCHEMA.md           # Database reference
├── database/
│   ├── 01_schema.sql           # Core database schema
│   ├── 02_rls_policies.sql     # Security policies
│   └── 03_seed_data.sql        # Test data
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── admin/              # Admin dashboard
│   │   ├── coach/              # Coach dashboard
│   │   ├── player/             # Player dashboard
│   │   └── actions/            # Server Actions
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── supabase/           # Supabase clients
│   │   └── utils.ts            # Utilities
│   └── types/
│       └── database.ts         # TypeScript types
└── package.json
```

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Charts:** Recharts
- **State:** TanStack Query

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 🔐 Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🎯 Core Features

### For Admins
- Create and manage coaching sessions
- Manage users (players & coaches)
- Configure skill categories and skills
- View all assessments and progress

### For Coaches
- View all players
- Create skill assessments (1-10 score per skill)
- Manage own coaching sessions
- View player progress history
- Multi-coach assessment (see other coaches' assessments)

### For Players
- View personal skill report card
- Track progress over time
- Request to join coaching sessions
- See assessments from multiple coaches

## 🗄 Database

10 core tables:

1. **users** - Supabase Auth
2. **user_profiles** - Extended profiles with role
3. **players** - Player-specific data
4. **coaches** - Coach-specific data
5. **skill_categories** - Skill groupings
6. **skills** - Individual assessable skills
7. **coaching_sessions** - Session scheduling
8. **session_participants** - Player-session junction
9. **skill_assessments** - Assessment records (1-10 scores)
10. **player_progress_snapshots** - Historical summaries

## 🚨 Important Notes

### Before Writing Queries

**ALWAYS check [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) first!**

Common mistakes:
- ❌ `user_profiles.name` → ✅ `user_profiles.full_name`
- ❌ `players.level` → ✅ `players.current_level`
- ❌ `coaching_sessions.date` → ✅ `coaching_sessions.session_date`

### Score Validation

Skill assessments must be integers between 1-10:

```typescript
score >= 1 && score <= 10
```

### RLS Security

All tables have Row Level Security enabled. Never bypass RLS policies in application code.

## 📚 Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Recharts Documentation](https://recharts.org)

---

**Last Updated:** 2026-02-21
**Version:** 1.0 - Initial Setup
