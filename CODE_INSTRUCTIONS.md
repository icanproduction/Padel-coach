# Padel Coach Pro - Code Instructions

> Development guidelines to prevent bugs and maintain consistency

---

## 🎯 CORE PRINCIPLES

1. **Type Safety First** - Use TypeScript strictly, no `any` types
2. **Database-Driven** - Always check DATABASE_SCHEMA.md before queries
3. **RLS Security** - Never bypass Row Level Security policies
4. **Mobile-First** - Design for mobile, enhance for desktop
5. **Error Handling** - Always return `{data, error}` pattern from server actions

---

## 📋 NAMING CONVENTIONS

### Database
- **Tables**: `snake_case` plural (e.g., `skill_assessments`)
- **Columns**: `snake_case` (e.g., `assessed_at`, `player_id`)
- **Foreign Keys**: `{table_singular}_id` (e.g., `player_id`, `coach_id`)

### TypeScript/React
- **Components**: `PascalCase.tsx` (e.g., `AssessmentForm.tsx`)
- **Files**: `kebab-case.ts` (e.g., `skill-assessments.ts`)
- **Functions**: `camelCase` (e.g., `getPlayerProgress`)
- **Types/Interfaces**: `PascalCase` (e.g., `SkillAssessment`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_SCORE`)

---

## 🗄 DATABASE RULES

### CRITICAL - Always Verify Column Names

Before writing ANY database query:
1. Open `DATABASE_SCHEMA.md`
2. Find the exact table and column names
3. Copy column names from schema (don't guess!)

### Common Mistakes to Avoid

❌ **DON'T:**
```typescript
// Wrong - guessing column names
const { data } = await supabase
  .from('players')
  .select('name, email, level')  // WRONG!
```

✅ **DO:**
```typescript
// Correct - verified from schema
const { data } = await supabase
  .from('players')
  .select('full_name, current_level, total_sessions')
```

### Query Patterns

**Get Player with User Info:**
```typescript
const { data } = await supabase
  .from('players')
  .select(`
    *,
    user:user_profiles!inner(full_name, avatar_url, email)
  `)
  .eq('id', playerId)
  .single()
```

**Get Assessments with Relations:**
```typescript
const { data } = await supabase
  .from('skill_assessments')
  .select(`
    *,
    skill:skills(name, category:skill_categories(name)),
    coach:coaches(full_name)
  `)
  .eq('player_id', playerId)
  .order('assessed_at', { ascending: false })
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Server Action Template

```typescript
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAssessment(data: AssessmentInput) {
  try {
    const supabase = await createServerSupabaseClient()

    // 1. Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Get user profile & role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    // 3. Check authorization
    if (profile?.role !== 'coach' && profile?.role !== 'admin') {
      return { error: 'Only coaches can create assessments' }
    }

    // 4. Perform operation
    const { data: result, error } = await supabase
      .from('skill_assessments')
      .insert({
        ...data,
        assessed_by: user.id,
        assessed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // 5. Revalidate relevant paths
    revalidatePath(`/player/${data.player_id}`)
    revalidatePath(`/coach/assessments`)

    return { data: result }
  } catch (error: any) {
    console.error('Create assessment error:', error)
    return { error: error.message || 'Failed to create assessment' }
  }
}
```

---

## ⚠️ VALIDATION RULES

### Skill Assessment Scores

```typescript
const SCORE_MIN = 1
const SCORE_MAX = 10

function validateScore(score: number): boolean {
  return Number.isInteger(score) && score >= SCORE_MIN && score <= SCORE_MAX
}
```

### Session Status

```typescript
type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

const VALID_STATUS_TRANSITIONS = {
  'scheduled': ['in_progress', 'cancelled'],
  'in_progress': ['completed', 'cancelled'],
  'completed': [],
  'cancelled': []
}
```

---

## 🎨 UI COMPONENT PATTERNS

### Mobile-Responsive Cards

```typescript
<Card className="w-full max-w-md mx-auto">
  <CardHeader>
    <CardTitle className="text-lg md:text-xl">
      Skill Assessment
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content */}
  </CardContent>
</Card>
```

### Score Display

```typescript
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? 'green' : score >= 5 ? 'yellow' : 'red'
  return (
    <Badge variant={color} className="text-lg font-bold">
      {score}/10
    </Badge>
  )
}
```

---

## 🔄 STATE MANAGEMENT

Use TanStack Query for server state:

```typescript
import { useQuery } from '@tanstack/react-query'

function usePlayerProgress(playerId: string) {
  return useQuery({
    queryKey: ['player-progress', playerId],
    queryFn: () => getPlayerProgress(playerId),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
```

---

## 🚫 COMMON PITFALLS

### 1. Column Name Errors
❌ Using `user.name` instead of `user_profiles.full_name`
✅ Always verify column names in DATABASE_SCHEMA.md

### 2. Missing RLS Context
❌ Bypassing RLS with service role key
✅ Use authenticated client with proper policies

### 3. Hard-coded Skill IDs
❌ `if (skillId === '123-456')`
✅ Query skills table by name or category

### 4. Not Handling Loading States
❌ Assuming data is always available
✅ Handle loading, error, and empty states

### 5. Forgetting Revalidation
❌ Data not updating after mutations
✅ Always `revalidatePath()` after mutations

---

## ✅ CODE REVIEW CHECKLIST

Before committing:
- [ ] All column names verified against DATABASE_SCHEMA.md
- [ ] Server actions have proper auth checks
- [ ] Error handling with try/catch
- [ ] Loading & error states in UI
- [ ] Mobile-responsive styling
- [ ] TypeScript types (no `any`)
- [ ] Revalidation after mutations
- [ ] Console.log removed
- [ ] Comments for complex logic

---

## 📚 REFERENCES

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com)

---

**Last Updated:** 2026-02-21
