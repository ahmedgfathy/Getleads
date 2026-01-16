'use client'

import Link from 'next/link'
import { FacebookIcon } from '@/app/components/FacebookIcon'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans" dir="rtl">
             {/* Header */}
             <header className="bg-slate-900 text-white py-4 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center font-bold">R</div>
                        <span className="font-bold text-xl">الرواد العقارية</span>
                    </Link>
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        <Link href="/" className="hover:text-emerald-400 text-slate-300">الرئيسية</Link>
                        <Link href="/all-properties?type=sale" className="hover:text-emerald-400 text-slate-300">بيع</Link>
                        <Link href="/all-properties?type=rent" className="hover:text-emerald-400 text-slate-300">إيجار</Link>
                        <Link href="/about" className="hover:text-emerald-400 text-white">من نحن</Link>
                        <Link href="/contact" className="hover:text-emerald-400 text-slate-300">اتصل بنا</Link>

                        <div className="flex items-center gap-3 mr-4 border-r border-slate-700 pr-4">
                            <a 
                                href="https://www.facebook.com/elrowadrealestates" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-[#1877F2] text-white transition-all duration-300"
                                aria-label="Facebook"
                            >
                                <FacebookIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </nav>
                </div>
             </header>

            <main>
                {/* Hero Section with Background */}
                <div className="relative bg-slate-900 py-24 md:py-32 overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/80"></div>
                    <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                         <span className="text-emerald-400 font-bold tracking-[0.2em] text-sm uppercase mb-4 block animate-fade-in-up">من نحن</span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight max-w-4xl mx-auto">
                            شريكك الموثوق في <br/><span className="text-emerald-400">رحلة الاستثمار العقاري</span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            نحن في "الرواد العقارية" نؤمن بأن العقار ليس مجرد جدران، بل هو استثمار لمستقبلك، ومساحة لأحلامك. نقدم لك الخبرة والمصداقية لتحقيق أهدافك.
                        </p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-emerald-600 text-white py-12 relative -mt-8 mx-4 md:mx-auto max-w-6xl rounded-3xl shadow-xl z-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-x-reverse divide-emerald-500/50">
                        <div className="p-4">
                            <div className="text-4xl font-bold mb-2">+10</div>
                            <div className="text-emerald-100 text-sm">سنوات خبرة</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl font-bold mb-2">+500</div>
                            <div className="text-emerald-100 text-sm">عقار مباع</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl font-bold mb-2">+1000</div>
                            <div className="text-emerald-100 text-sm">عميل سعيد</div>
                        </div>
                         <div className="p-4">
                            <div className="text-4xl font-bold mb-2">24/7</div>
                            <div className="text-emerald-100 text-sm">دعم متواصل</div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-24">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-emerald-100 rounded-3xl transform rotate-2 group-hover:rotate-1 transition-transform"></div>
                            <div className="relative h-[500px] bg-slate-200 rounded-2xl overflow-hidden shadow-2xl">
                                {/* Placeholder Image */}
                                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-400">
                                     <svg className="w-24 h-24 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white font-bold text-lg">فريق عمل محترف</p>
                                    <p className="text-slate-300 text-sm">نحن هنا لخدمتك في كل خطوة</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <h2 className="text-4xl font-bold text-slate-900 mb-6">لماذا تختار <span className="text-emerald-600">الرواد؟</span></h2>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    السوق العقاري مليء بالخيارات، ولكننا نتميز بالشفافية والاحترافية. نحن لا نبيع العقارات فقط، بل نقدم استشارات مبنية على دراسة وتحليل للسوق لضمان أفضل عائد لاستثمارك.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-5 items-start bg-slate-50 p-6 rounded-2xl border border-slate-100 transition-colors hover:border-emerald-200">
                                    <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-200">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">مصداقية تامة</h3>
                                        <p className="text-slate-500 leading-relaxed">جميع العقارات المعروضة لدينا تم التحقق من أوراقها القانونية ومواصفاتها لضمان أمانك.</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-5 items-start bg-slate-50 p-6 rounded-2xl border border-slate-100 transition-colors hover:border-emerald-200">
                                    <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-200">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">أسعار تنافسية</h3>
                                        <p className="text-slate-500 leading-relaxed">نمتلك علاقات قوية مع المطورين وأصحاب العقارات، مما يتيح لنا تقديم أفضل الأسعار والعروض الحصرية.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="bg-slate-900 py-24 text-center px-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                    
                    <div className="relative z-10 block">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">جاهز لبدء استثمارك؟</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/all-properties" className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-700/30">
                                تصفح العقارات
                            </Link>
                            <Link href="/contact" className="px-8 py-4 bg-white/10 text-white backdrop-blur-sm border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all">
                                تواصل معنا
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
