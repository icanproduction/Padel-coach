# Padel Coach Pro - Database Schema Reference

> **Last Updated:** 2026-02-21
> **Purpose:** Complete database reference to prevent column name errors

---

## ⚠️ CRITICAL - READ BEFORE QUERIES

**ALWAYS check this file before writing ANY database query!**

Common mistakes:
- ❌ Using `name` instead of `full_name` in user_profiles
- ❌ Forgetting to join with `users` to get email
- ❌ Using `level` instead of `current_level` in players

---

## 📊 TABLE OF CONTENTS

1. [User Management Tables](#user-management-tables)
   - users
   - user_profiles
   - players
   - coaches
2. [Skills System Tables](#skills-system-tables)
   - skill_categories
   - skills
3. [Sessions & Assessments Tables](#sessions--assessments-tables)
   - coaching_sessions
   - session_participants
   - skill_assessments
   - player_progress_snapshots

---

## USER MANAGEMENT TABLES

### 1. `users`

**Purpose:** Base user authentication (Supabase Auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Supabase Auth user ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation date |

**Notes:**
- Managed by Supabase Auth - do NOT insert directly
- Reference this table for user_id foreign keys
- Email is stored here, not in profiles

**Common Queries:**
```sql
-- Get user with profile
SELECT u.email, p.full_name, p.role
FROM users u
INNER JOIN user_profiles p ON p.user_id = u.id
WHERE u.id = 'user-uuid-here';
```

---

### 2. `user_profiles`

**Purpose:** Extended user information and role assignment

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Profile ID |
| `user_id` | UUID | UNIQUE, NOT NULL, FK → users.id | Links to auth user |
| `role` | VARCHAR(20) | NOT NULL | 'admin', 'coach', or 'player' |
| `full_name` | VARCHAR(255) | NOT NULL | User's full name |
| `avatar_url` | TEXT | NULL | Profile photo URL |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Profile creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**⚠️ Common Mistakes:**
- ❌ `user_profiles.name` → ✅ `user_profiles.full_name`
- ❌ `user_profiles.email` → ✅ Join with `users.email`

**Common Queries:**
```sql
-- Get current user's profile
SELECT role, full_name, avatar_url
FROM user_profiles
WHERE user_id = auth.uid();

-- Check if user is coach
SELECT role = 'coach' AS is_coach
FROM user_profiles
WHERE user_id = auth.uid();
```

---

### 3. `players`

**Purpose:** Player-specific data and stats

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Player ID |
| `user_id` | UUID | UNIQUE, NOT NULL, FK → users.id | Links to auth user |
| `current_level` | VARCHAR(20) | DEFAULT 'beginner' | Current skill level |
| `total_sessions` | INTEGER | DEFAULT 0 | Total sessions attended |
| `joined_date` | DATE | NOT NULL | Date player joined program |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Valid `current_level` values:**
- `'beginner'`
- `'intermediate'`
- `'advanced'`
- `'professional'`

**⚠️ Common Mistakes:**
- ❌ `players.level` → ✅ `players.current_level`
- ❌ `players.full_name` → ✅ Join with `user_profiles.full_name`

**Common Queries:**
```sql
-- Get player with full info
SELECT
  p.*,
  up.full_name,
  up.avatar_url,
  u.email
FROM players p
INNER JOIN user_profiles up ON up.user_id = p.user_id
INNER JOIN users u ON u.id = p.user_id
WHERE p.id = 'player-id-here';

-- Get all players with their stats
SELECT
  p.id,
  up.full_name,
  p.current_level,
  p.total_sessions,
  p.joined_date
FROM players p
INNER JOIN user_profiles up ON up.user_id = p.user_id
ORDER BY p.joined_date DESC;
```

---

### 4. `coaches`

**Purpose:** Coach-specific data and credentials

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Coach ID |
| `user_id` | UUID | UNIQUE, NOT NULL, FK → users.id | Links to auth user |
| `specialization` | VARCHAR(100) | NULL | Primary coaching area |
| `years_experience` | INTEGER | DEFAULT 0 | Years of coaching experience |
| `bio` | TEXT | NULL | Coach biography/description |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Common Specializations:**
- Singles
- Doubles
- Serve & Volley
- Groundstrokes
- Mental Game
- Beginners
- Youth Development

**⚠️ Common Mistakes:**
- ❌ `coaches.name` → ✅ Join with `user_profiles.full_name`
- ❌ `coaches.email` → ✅ Join with `users.email`

**Common Queries:**
```sql
-- Get coach with full info
SELECT
  c.*,
  up.full_name,
  up.avatar_url,
  u.email
FROM coaches c
INNER JOIN user_profiles up ON up.user_id = c.user_id
INNER JOIN users u ON u.id = c.user_id
WHERE c.id = 'coach-id-here';

-- Get all coaches
SELECT
  c.id,
  up.full_name,
  c.specialization,
  c.years_experience,
  c.bio
FROM coaches c
INNER JOIN user_profiles up ON up.user_id = c.user_id
ORDER BY c.years_experience DESC;
```

---

## SKILLS SYSTEM TABLES

### 5. `skill_categories`

**Purpose:** Group skills into logical categories

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Category ID |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Category name |
| `description` | TEXT | NULL | Category description |
| `display_order` | INTEGER | DEFAULT 0 | Sort order for UI |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |

**Default Categories:**
1. **Serve** - Service techniques
2. **Volley** - Net play skills
3. **Groundstrokes** - Baseline shots
4. **Movement** - Court positioning & footwork
5. **Strategy** - Game intelligence

**Common Queries:**
```sql
-- Get all categories with skill count
SELECT
  sc.id,
  sc.name,
  sc.description,
  COUNT(s.id) AS skill_count
FROM skill_categories sc
LEFT JOIN skills s ON s.category_id = sc.id
GROUP BY sc.id, sc.name, sc.description
ORDER BY sc.display_order;
```

---

### 6. `skills`

**Purpose:** Individual skills to be assessed

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Skill ID |
| `category_id` | UUID | NOT NULL, FK → skill_categories.id | Parent category |
| `name` | VARCHAR(100) | NOT NULL | Skill name |
| `description` | TEXT | NULL | Skill description |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |

**Example Skills by Category:**

**Serve:**
- Serve power
- Serve placement
- Serve variety

**Volley:**
- Forehand volley
- Backhand volley
- Smash

**Groundstrokes:**
- Forehand drive
- Backhand drive
- Lob

**Movement:**
- Court positioning
- Footwork
- Reaction time

**Strategy:**
- Game reading
- Partner coordination
- Shot selection

**Common Queries:**
```sql
-- Get all skills with categories
SELECT
  s.id,
  s.name,
  s.description,
  sc.name AS category_name
FROM skills s
INNER JOIN skill_categories sc ON sc.id = s.category_id
ORDER BY sc.display_order, s.name;

-- Get skills by category
SELECT id, name, description
FROM skills
WHERE category_id = 'category-uuid-here'
ORDER BY name;
```

---

## SESSIONS & ASSESSMENTS TABLES

### 7. `coaching_sessions`

**Purpose:** Track coaching session schedule and details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Session ID |
| `coach_id` | UUID | NOT NULL, FK → coaches.id | Assigned coach |
| `session_date` | DATE | NOT NULL | Session date |
| `session_time` | TIME | NOT NULL | Session start time |
| `duration_minutes` | INTEGER | DEFAULT 60 | Session duration |
| `max_participants` | INTEGER | DEFAULT 4 | Maximum players allowed |
| `status` | VARCHAR(20) | DEFAULT 'scheduled' | Session status |
| `notes` | TEXT | NULL | Session notes |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Valid `status` values:**
- `'scheduled'` - Session planned, open for registration
- `'in_progress'` - Session currently happening
- `'completed'` - Session finished
- `'cancelled'` - Session cancelled

**Status Transitions:**
```
scheduled → in_progress → completed
scheduled → cancelled
in_progress → cancelled
```

**⚠️ Common Mistakes:**
- ❌ `coaching_sessions.date` → ✅ `coaching_sessions.session_date`
- ❌ `coaching_sessions.time` → ✅ `coaching_sessions.session_time`

**Common Queries:**
```sql
-- Get upcoming sessions with coach info
SELECT
  cs.*,
  up.full_name AS coach_name,
  COUNT(sp.id) AS current_participants
FROM coaching_sessions cs
INNER JOIN coaches c ON c.id = cs.coach_id
INNER JOIN user_profiles up ON up.user_id = c.user_id
LEFT JOIN session_participants sp ON sp.session_id = cs.id AND sp.status = 'approved'
WHERE cs.status = 'scheduled'
  AND cs.session_date >= CURRENT_DATE
GROUP BY cs.id, up.full_name
ORDER BY cs.session_date, cs.session_time;

-- Get session with participants
SELECT
  cs.*,
  json_agg(
    json_build_object(
      'player_id', p.id,
      'player_name', up.full_name,
      'status', sp.status
    )
  ) AS participants
FROM coaching_sessions cs
LEFT JOIN session_participants sp ON sp.session_id = cs.id
LEFT JOIN players p ON p.id = sp.player_id
LEFT JOIN user_profiles up ON up.user_id = p.user_id
WHERE cs.id = 'session-uuid-here'
GROUP BY cs.id;
```

---

### 8. `session_participants`

**Purpose:** Many-to-many junction table for players and sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Participation record ID |
| `session_id` | UUID | NOT NULL, FK → coaching_sessions.id | Session reference |
| `player_id` | UUID | NOT NULL, FK → players.id | Player reference |
| `status` | VARCHAR(20) | DEFAULT 'pending' | Participation status |
| `joined_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Request/join timestamp |
| `notes` | TEXT | NULL | Admin/coach notes |

**UNIQUE constraint:** `(session_id, player_id)` - Player can only join session once

**Valid `status` values:**
- `'pending'` - Player requested to join, awaiting approval
- `'approved'` - Player approved to attend
- `'rejected'` - Request rejected
- `'attended'` - Player attended the session
- `'no_show'` - Player approved but didn't attend

**Status Transitions:**
```
pending → approved → attended
pending → rejected
approved → no_show
```

**Common Queries:**
```sql
-- Get player's sessions
SELECT
  cs.session_date,
  cs.session_time,
  up.full_name AS coach_name,
  sp.status
FROM session_participants sp
INNER JOIN coaching_sessions cs ON cs.id = sp.session_id
INNER JOIN coaches c ON c.id = cs.coach_id
INNER JOIN user_profiles up ON up.user_id = c.user_id
WHERE sp.player_id = 'player-uuid-here'
ORDER BY cs.session_date DESC;

-- Get pending requests for a session
SELECT
  sp.*,
  up.full_name AS player_name,
  p.current_level
FROM session_participants sp
INNER JOIN players p ON p.id = sp.player_id
INNER JOIN user_profiles up ON up.user_id = p.user_id
WHERE sp.session_id = 'session-uuid-here'
  AND sp.status = 'pending'
ORDER BY sp.joined_at;
```

---

### 9. `skill_assessments`

**Purpose:** Core assessment data - coach scores player on specific skills

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Assessment ID |
| `player_id` | UUID | NOT NULL, FK → players.id | Player being assessed |
| `skill_id` | UUID | NOT NULL, FK → skills.id | Skill being assessed |
| `score` | INTEGER | NOT NULL, CHECK (1-10) | Score from 1 to 10 |
| `notes` | TEXT | NULL | Coach observations/feedback |
| `assessed_by` | UUID | NOT NULL, FK → coaches.id | Coach who made assessment |
| `assessed_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Assessment timestamp |
| `session_id` | UUID | NULL, FK → coaching_sessions.id | Optional session link |

**⚠️ CRITICAL VALIDATION:**
- Score MUST be integer between 1 and 10 (inclusive)
- Database has CHECK constraint: `CHECK (score >= 1 AND score <= 10)`

**Score Interpretation:**
- 1-3: Beginner level, needs significant development
- 4-6: Intermediate level, showing progress
- 7-8: Advanced level, consistent performance
- 9-10: Professional level, exceptional skill

**Common Queries:**
```sql
-- Get player's latest assessments per skill
SELECT DISTINCT ON (sa.skill_id)
  sa.*,
  s.name AS skill_name,
  sc.name AS category_name,
  up.full_name AS coach_name
FROM skill_assessments sa
INNER JOIN skills s ON s.id = sa.skill_id
INNER JOIN skill_categories sc ON sc.id = s.category_id
INNER JOIN coaches c ON c.id = sa.assessed_by
INNER JOIN user_profiles up ON up.user_id = c.user_id
WHERE sa.player_id = 'player-uuid-here'
ORDER BY sa.skill_id, sa.assessed_at DESC;

-- Get skill progress over time
SELECT
  sa.assessed_at,
  sa.score,
  up.full_name AS coach_name,
  sa.notes
FROM skill_assessments sa
INNER JOIN coaches c ON c.id = sa.assessed_by
INNER JOIN user_profiles up ON up.user_id = c.user_id
WHERE sa.player_id = 'player-uuid-here'
  AND sa.skill_id = 'skill-uuid-here'
ORDER BY sa.assessed_at DESC;

-- Get assessments by multiple coaches for comparison
SELECT
  s.name AS skill_name,
  sc.name AS category_name,
  up.full_name AS coach_name,
  sa.score,
  sa.assessed_at
FROM skill_assessments sa
INNER JOIN skills s ON s.id = sa.skill_id
INNER JOIN skill_categories sc ON sc.id = s.category_id
INNER JOIN coaches c ON c.id = sa.assessed_by
INNER JOIN user_profiles up ON up.user_id = c.user_id
WHERE sa.player_id = 'player-uuid-here'
  AND sa.assessed_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY sc.display_order, s.name, sa.assessed_at DESC;
```

---

### 10. `player_progress_snapshots`

**Purpose:** Periodic summary snapshots for historical comparison

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Snapshot ID |
| `player_id` | UUID | NOT NULL, FK → players.id | Player reference |
| `snapshot_date` | DATE | NOT NULL | Date of snapshot |
| `average_score` | DECIMAL(4,2) | NULL | Overall average score |
| `skill_scores_json` | JSONB | NULL | JSON of skill scores by category |
| `total_assessments` | INTEGER | DEFAULT 0 | Number of assessments at this point |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |

**UNIQUE constraint:** `(player_id, snapshot_date)` - One snapshot per player per date

**`skill_scores_json` structure:**
```json
{
  "Serve": {
    "average": 6.5,
    "skills": {
      "Serve power": 7,
      "Serve placement": 6,
      "Serve variety": 7
    }
  },
  "Volley": {
    "average": 5.0,
    "skills": {
      "Forehand volley": 5,
      "Backhand volley": 5,
      "Smash": 5
    }
  }
}
```

**Common Queries:**
```sql
-- Get player's progress over time
SELECT
  snapshot_date,
  average_score,
  total_assessments,
  skill_scores_json
FROM player_progress_snapshots
WHERE player_id = 'player-uuid-here'
ORDER BY snapshot_date DESC;

-- Compare two snapshots
SELECT
  'Current' AS period,
  average_score,
  snapshot_date
FROM player_progress_snapshots
WHERE player_id = 'player-uuid-here'
ORDER BY snapshot_date DESC
LIMIT 1

UNION ALL

SELECT
  'Previous' AS period,
  average_score,
  snapshot_date
FROM player_progress_snapshots
WHERE player_id = 'player-uuid-here'
  AND snapshot_date < (
    SELECT MAX(snapshot_date)
    FROM player_progress_snapshots
    WHERE player_id = 'player-uuid-here'
  )
ORDER BY snapshot_date DESC
LIMIT 1;
```

---

## 🔑 FOREIGN KEY RELATIONSHIPS

```
users (id)
  ├─→ user_profiles (user_id) [1:1]
  ├─→ players (user_id) [1:1]
  └─→ coaches (user_id) [1:1]

skill_categories (id)
  └─→ skills (category_id) [1:N]

coaches (id)
  ├─→ coaching_sessions (coach_id) [1:N]
  └─→ skill_assessments (assessed_by) [1:N]

players (id)
  ├─→ session_participants (player_id) [1:N]
  ├─→ skill_assessments (player_id) [1:N]
  └─→ player_progress_snapshots (player_id) [1:N]

coaching_sessions (id)
  ├─→ session_participants (session_id) [1:N]
  └─→ skill_assessments (session_id) [1:N]

skills (id)
  └─→ skill_assessments (skill_id) [1:N]
```

---

## 📝 QUICK REFERENCE - COLUMN NAME CHEATSHEET

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| `user_profiles.name` | `user_profiles.full_name` |
| `players.level` | `players.current_level` |
| `players.sessions` | `players.total_sessions` |
| `coaching_sessions.date` | `coaching_sessions.session_date` |
| `coaching_sessions.time` | `coaching_sessions.session_time` |
| `coaches.name` | Join with `user_profiles.full_name` |
| `coaches.email` | Join with `users.email` |
| `players.email` | Join with `users.email` |

---

## 🎯 COMMON QUERY PATTERNS

### Get User with Role-Specific Data
```sql
-- Get coach with profile
SELECT
  u.email,
  up.full_name,
  up.avatar_url,
  c.specialization,
  c.years_experience
FROM users u
INNER JOIN user_profiles up ON up.user_id = u.id
INNER JOIN coaches c ON c.user_id = u.id
WHERE u.id = 'user-uuid-here';

-- Get player with profile
SELECT
  u.email,
  up.full_name,
  up.avatar_url,
  p.current_level,
  p.total_sessions,
  p.joined_date
FROM users u
INNER JOIN user_profiles up ON up.user_id = u.id
INNER JOIN players p ON p.user_id = u.id
WHERE u.id = 'user-uuid-here';
```

### Get Player's Complete Report Card
```sql
SELECT
  sc.name AS category,
  s.name AS skill,
  sa.score,
  sa.assessed_at,
  up.full_name AS coach_name
FROM skill_assessments sa
INNER JOIN skills s ON s.id = sa.skill_id
INNER JOIN skill_categories sc ON sc.id = s.category_id
INNER JOIN coaches c ON c.id = sa.assessed_by
INNER JOIN user_profiles up ON up.user_id = c.user_id
WHERE sa.player_id = 'player-uuid-here'
  AND sa.id IN (
    -- Get only latest assessment per skill
    SELECT DISTINCT ON (skill_id) id
    FROM skill_assessments
    WHERE player_id = 'player-uuid-here'
    ORDER BY skill_id, assessed_at DESC
  )
ORDER BY sc.display_order, s.name;
```

---

**Last Updated:** 2026-02-21
