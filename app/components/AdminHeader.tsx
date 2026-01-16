'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  user?: any;
  title?: string;
}

export default function AdminHeader({ user, title = 'GetLeads' }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname?.startsWith(path)) return true;
    return false;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'الرئيسية', path: '/dashboard' },
    { name: 'العملاء المحتملين', path: '/leads' },
    { name: 'العقارات', path: '/properties' },
    { name: 'جهات الاتصال', path: '/contacts' },
    { name: 'الشركات', path: '/organizations' },
    { name: 'استيراد', path: '/import' },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-4">
             {/* Mobile Menu Button */}
             <button 
               className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 {mobileMenuOpen ? (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 ) : (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                 )}
               </svg>
             </button>

             {/* Logo */}
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner border border-emerald-600">R</div>
               <div className="hidden sm:block">
                  <h1 className="font-bold text-xl leading-none">{title}</h1>
                  <span className="text-xs text-slate-400">الرواد العقارية</span>
               </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1 bg-slate-800/50 p-1 rounded-xl">
             {navItems.map((item) => (
                <Link 
                  key={item.path}
                  href={item.path} 
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    isActive(item.path) 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {item.name}
                </Link>
             ))}
             <Link href="/" className="px-3 py-2 text-emerald-400 hover:bg-emerald-900/30 rounded-lg font-medium text-sm transition-all flex items-center gap-1">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                 الموقع
             </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-2">
               <span className="text-sm font-bold text-slate-200">{user?.email?.split('@')[0]}</span>
               <span className="text-xs text-slate-400">مدير النظام</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all text-sm font-bold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {navItems.map((item) => (
                <Link 
                  key={item.path}
                  href={item.path} 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path) 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
             ))}
             <Link 
               href="/" 
               className="block px-3 py-2 rounded-md text-base font-medium text-emerald-400 hover:bg-slate-700"
               onClick={() => setMobileMenuOpen(false)}
             >
               الموقع العام
             </Link>
             
             <div className="border-t border-slate-700 mt-4 pt-4 px-3">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                   </div>
                   <div>
                      <div className="text-sm font-medium text-white">{user?.email}</div>
                      <div className="text-xs text-slate-400">مدير النظام</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </header>
  );
}