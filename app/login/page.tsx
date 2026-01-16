'use client'

import { useState, FormEvent, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Icons
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const LockIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
)
const EmailIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [configError, setConfigError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConfigError(true)
      setError('Supabase is not configured. Please set up your environment variables.')
    }
  }, [])

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    if (configError) return
    
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        setMessage('تم تسجيل الدخول بنجاح')
        router.push('/dashboard')
      }
    } catch (error: any) {
      setError(error.message || 'فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden" dir="rtl">
        {/* Background matching Homepage Hero */}
        <div className="absolute inset-0 bg-slate-900 z-0">
             <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-900/90 z-10"></div>
             <div 
               className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay"
               style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-22b5c12752f9?q=80&w=2666&auto=format&fit=crop')" }}
             ></div>
        </div>

        <div className="relative z-20 w-full max-w-md px-4">
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-emerald-700 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg border border-emerald-600 mb-4">
                        R
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">تسجيل الدخول</h1>
                    <p className="text-slate-500 mt-1">أهلاً بك في لوحة تحكم الرواد العقارية</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}
                
                {message && (
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-sm border border-emerald-100 flex items-center gap-2">
                         <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 mr-1">البريد الإلكتروني</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                <EmailIcon className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-xl border-slate-200 bg-slate-50 py-3.5 pr-11 pl-4 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm transition-all shadow-sm"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 mr-1">كلمة المرور</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                <LockIcon className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border-slate-200 bg-slate-50 py-3.5 pr-11 pl-4 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm transition-all shadow-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || configError}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                    >
                        {loading && (
                           <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        )}
                        تسجيل الدخول
                    </button>
                    
                    <div className="text-center mt-4 text-sm">
                        <Link href="/" className="text-slate-400 hover:text-emerald-600 transition-colors">
                            العودة للرئيسية
                        </Link>
                    </div>
                </form>
            </div>
            
            <div className="text-center mt-8">
                 <p className="text-emerald-100/60 text-xs">© 2026 Al Rowad Real Estate. All rights reserved.</p>
            </div>
        </div>
    </div>
  )
}
