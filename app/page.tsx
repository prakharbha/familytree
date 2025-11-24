import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Elegant Blurred Gradient Background - Inspired by soft floral gradients */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 15% 25%, rgba(255, 245, 250, 0.8) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 85% 75%, rgba(240, 248, 255, 0.7) 0%, transparent 60%),
            radial-gradient(ellipse 60% 70% at 50% 50%, rgba(255, 250, 240, 0.6) 0%, transparent 65%),
            radial-gradient(ellipse 50% 60% at 25% 80%, rgba(255, 240, 245, 0.5) 0%, transparent 55%),
            radial-gradient(ellipse 55% 65% at 75% 15%, rgba(245, 245, 255, 0.6) 0%, transparent 60%),
            radial-gradient(ellipse 45% 50% at 60% 40%, rgba(250, 240, 255, 0.4) 0%, transparent 50%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 250, 0.9) 50%, rgba(250, 250, 255, 0.95) 100%)
          `,
          filter: 'blur(120px)',
          transform: 'scale(1.4)',
        }}
      ></div>
      
      {/* Soft overlay for seamless blending */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/30"></div>
      
      {/* Very subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='texture' x='0' y='0' width='300' height='300' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='150' cy='150' r='80' fill='%23000000' opacity='0.03'/%3E%3Ccircle cx='100' cy='100' r='50' fill='%23000000' opacity='0.02'/%3E%3Ccircle cx='200' cy='200' r='60' fill='%23000000' opacity='0.025'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23texture)'/%3E%3C/svg%3E")`,
          backgroundSize: '800px 800px',
          filter: 'blur(4px)',
        }}
      ></div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-mix font-semibold text-black">Family Legacy</h1>
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="/login" 
            className="text-gray-700 hover:text-black transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-mix font-normal mb-6 leading-tight text-black">
            <span className="block">Preserve Your</span>
            <span className="block">Family Legacy</span>
          </h2>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-sans">
            Capture the stories, memories, and connections that define your family. 
            Build a living timeline that future generations will treasure.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 py-6 h-auto">
                Start Your Legacy Journey
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-base px-8 py-6 h-auto">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left">
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl hover:bg-white/75 transition-all duration-300 animate-fade-in">
              <div className="text-3xl mb-3">🌳</div>
              <h3 className="font-mix text-xl mb-2">Family Tree</h3>
              <p className="text-gray-600 text-sm">
                Visualize and connect your family relationships in an interactive tree
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl hover:bg-white/75 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl mb-3">📖</div>
              <h3 className="font-mix text-xl mb-2">Legacy Timeline</h3>
              <p className="text-gray-600 text-sm">
                Chronicle life's milestones, stories, and memories in chronological order
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl hover:bg-white/75 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-mix text-xl mb-2">Family Connections</h3>
              <p className="text-gray-600 text-sm">
                Share updates, chat, and stay connected with your family members
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
