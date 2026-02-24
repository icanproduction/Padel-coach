# Padel Coach Pro - Claude Code Context

> **Last Updated:** 2026-02-21
> **Project:** Digital Skill Assessment & Progress Tracking for Padel Coaching

---

## 🎯 PROJECT OVERVIEW

**Padel Coach Pro** adalah aplikasi web mobile-friendly untuk tracking skill assessment dan progress pemain padel. Platform ini menghubungkan:
- **Admin** - Manage coaching sessions, user management
- **Coach** - Assess player skills, view player history
- **Player** - Join sessions, view personal progress

**Core Concept**: Digital "rapor" untuk pemain padel, di mana berbagai coach dapat assess player yang sama dan semua data ter-centralize untuk tracking progress jangka panjang.

---

## 🛠 TECH STACK

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16+ (App Router) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL + Auth + Storage) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State** | TanStack Query (React Query) |
| **Charts** | Recharts (for progress visualization) |
| **Hosting** | Vercel |

---

## 📁 PROJECT STRUCTURE

```
padel-coach-pro/
├── CLAUDE.md                      # This file - READ FIRST
├── CODE_INSTRUCTIONS.md           # Development guidelines
├── DATABASE_SCHEMA.md             # Complete database reference
├── database/
│   ├── 01_schema.sql             # Core schema (all tables)
│   ├── 02_rls_policies.sql       # RLS policies & helper functions
│   └── 03_seed_data.sql          # Test data
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login, Register
│   │   ├── admin/                # Admin dashboard pages
│   │   ├── coach/                # Coach dashboard pages
│   │   ├── player/               # Player dashboard pages
│   │   └── actions/              # Server Actions
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layouts/              # Sidebar, Header, Nav
│   │   └── features/             # Feature-specific components
│   ├── lib/
│   │   ├── supabase/             # Supabase client setup
│   │   └── utils.ts              # Utility functions
│   └── types/
│       └── database.ts           # TypeScript types for DB
└── package.json
```

---

## 🗄 DATABASE SCHEMA

**Full reference:** See `DATABASE_SCHEMA.md`

### Core Tables (10 tables)

**User Management:**
- `users` - Supabase Auth integration
- `user_profiles` - Extended profiles (role, full_name, avatar_url)
- `players` - Player-specific data (current_level, total_sessions, joined_date)
- `coaches` - Coach-specific data (specialization, years_experience, bio)

**Skills System:**
- `skill_categories` - Groups of skills (Serve, Volley, Groundstrokes, Movement, etc.)
- `skills` - Individual padel skills with category linkage

**Sessions & Assessments:**
- `coaching_sessions` - Session records (date, status, coach_id, max_participants)
- `session_participants` - Player → Session many-to-many junction
- `skill_assessments` - Coach assessment records (player, skill, score 1-10, notes)
- `player_progress_snapshots` - Periodic summary snapshots for historical comparison

---

## 🔐 AUTHENTICATION

**System:** Supabase Auth (Email/Password)

### User Roles:
```typescript
type UserRole = 'admin' | 'coach' | 'player'
```

### RLS Strategy:
- **Admin**: Full access to all tables
- **Coach**: Read all players, write assessments only
- **Player**: Read own data only, request join sessions

---

## 🔑 KEY BUSINESS RULES

1. **Skill Assessment Scoring** - Range 1-10 per skill
2. **Multi-Coach Assessment** - Different coaches can assess same player (full history visible)
3. **Session Workflow:**
   - Admin creates session → opens for registration
   - Player requests to join
   - Admin/Coach approves
   - Session happens
   - Coach records assessments
4. **Progress Tracking** - Historical comparison via snapshots + trend charts

---

## 📊 SKILL CATEGORIES

- **Serve** (Serve power, Serve placement, Serve variety)
- **Volley** (Forehand volley, Backhand volley, Smash)
- **Groundstrokes** (Forehand drive, Backhand drive, Lob)
- **Movement** (Court positioning, Footwork, Reaction time)
- **Strategy** (Game reading, Partner coordination, Shot selection)

---

## 🧪 TEST CREDENTIALS

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@padelcoach.pro | password123 |
| Coach | coach@padelcoach.pro | password123 |
| Player | player@padelcoach.pro | password123 |

---

## 📝 CODING CONVENTIONS

### Server Actions Pattern
```typescript
'use server'

export async function doSomething(data: DataType) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile) return { error: 'Profile not found' }

    // ... logic

    revalidatePath('/path')
    return { data: result }
  } catch (error: any) {
    return { error: error.message || 'Failed' }
  }
}
```

---

## 📌 CURRENT STATUS

✅ **Completed:**
- Project structure created
- Documentation files setup

❌ **TODO:**
- Database schema SQL
- Next.js initialization
- Supabase client setup
- Authentication flow
- Dashboard layouts
- Assessment UI
- Progress charts

---

**Last Updated:** 2026-02-21
**Version:** 1.0 - Initial Setup
