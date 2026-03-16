import { RegisterForm } from './register-form'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const supabase = await createServerSupabaseClient()
  const { data: logoSetting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'logo_url')
    .single()

  const logoUrl = logoSetting?.value ?? null

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          {logoUrl ? (
            <img src={logoUrl} alt="Loop Padel Club" className="h-14 w-auto object-contain mx-auto mb-4" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-primary-foreground">L</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Loop Padel Club
          </p>
        </div>
        <RegisterForm />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
