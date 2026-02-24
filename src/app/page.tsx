import Link from 'next/link'
import { TrendingUp, ClipboardCheck, Users, BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1a1f36]">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-20 pb-16">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
          <span className="text-2xl font-bold text-primary-foreground">P</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
          Padel Coach Pro
        </h1>
        <p className="mt-4 text-lg text-gray-400 text-center max-w-md">
          Player Development System — Diagnostic, Prescription & Progress Tracking
        </p>
        <div className="flex gap-4 mt-10">
          <Link
            href="/login"
            className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-8 py-3.5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors min-h-[44px]"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <ClipboardCheck className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-white font-semibold mb-1">5-Parameter Assessment</h3>
            <p className="text-gray-400 text-sm">
              Diagnose player skills across Reaction, Swing Size, Spacing, Recovery & Decision Making
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <BarChart3 className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-white font-semibold mb-1">Auto Grading & Archetypes</h3>
            <p className="text-gray-400 text-sm">
              Automatically calculate Grade 1-5 and player archetype from assessment data
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <TrendingUp className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-white font-semibold mb-1">Progress Tracking</h3>
            <p className="text-gray-400 text-sm">
              Radar charts, line charts and curriculum progress to visualize player development
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-white font-semibold mb-1">Multi-Coach Support</h3>
            <p className="text-gray-400 text-sm">
              Different coaches can assess the same player. Full history with coach attribution
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
