import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isOnboardingPage = pathname === '/onboarding'
  const isPendingApprovalPage = pathname === '/pending-approval'
  const isPublicPage = pathname === '/'

  // Protected routes
  const isAdminPage = pathname.startsWith('/admin')
  const isCoachPage = pathname.startsWith('/coach')
  const isPlayerPage = pathname.startsWith('/player')
  const isProfilePage = pathname.startsWith('/profile')
  const isProtected = isAdminPage || isCoachPage || isPlayerPage || isProfilePage

  // Not logged in → redirect to login
  if (!user && (isProtected || isOnboardingPage || isPendingApprovalPage)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Logged in → check coach approval + redirect from auth pages
  if (user) {
    // Coach accessing /coach/* → check if approved
    if (isCoachPage) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_approved')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'coach' && !profile.is_approved) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/pending-approval'
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Redirect from auth pages to dashboard
    if (isAuthPage) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_approved')
        .eq('id', user.id)
        .single()

      const redirectUrl = request.nextUrl.clone()
      if (profile?.role === 'admin') {
        redirectUrl.pathname = '/admin'
      } else if (profile?.role === 'coach') {
        redirectUrl.pathname = profile.is_approved ? '/coach' : '/pending-approval'
      } else if (profile?.role === 'player') {
        redirectUrl.pathname = '/player'
      } else {
        redirectUrl.pathname = '/'
      }
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
