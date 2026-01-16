'use client'

import Link from 'next/link'
import { FacebookIcon } from '@/app/components/FacebookIcon'

export default function ContactPage() {
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
                        <Link href="/about" className="hover:text-emerald-400 text-slate-300">من نحن</Link>
                        <Link href="/contact" className="hover:text-emerald-400 text-white">اتصل بنا</Link>
                    </nav>
                </div>
             </header>

            <main>
                 {/* Hero Section */}
                 <div className="bg-slate-900 py-20 md:py-28 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                    <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                         <span className="text-emerald-400 font-bold tracking-[0.2em] text-sm uppercase mb-4 block">تواصل معنا</span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">نحن هنا <span className="text-emerald-400">لمساعدتك</span></h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            لديك استفسار؟ تريد عرض عقارك؟ أو تبحث عن منزل أحلامك؟ فريقنا جاهز للإجابة على جميع تساؤلاتك.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-16 -mt-20 relative z-20">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Contact Info Cards */}
                        <div className="lg:col-span-1 space-y-4">
                             <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:border-emerald-200 transition-all group">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">قم بزيارتنا</h3>
                                <p className="text-slate-500 leading-relaxed">القاهرة، التجمع الخامس<br/>شارع التسعين، مبنى الرواد، الدور 3</p>
                             </div>

                             <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:border-emerald-200 transition-all group">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">اتصل بنا</h3>
                                <div className="space-y-1">
                                    <p className="text-slate-500 dir-ltr text-right font-medium hover:text-emerald-600 transition-colors cursor-pointer">+20 100 277 8090</p>
                                    <p className="text-slate-500 dir-ltr text-right font-medium hover:text-emerald-600 transition-colors cursor-pointer">+20 123 456 7890</p>
                                </div>
                             </div>

                             <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:border-emerald-200 transition-all group">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">راسلنا</h3>
                                <p className="text-slate-500 font-medium hover:text-emerald-600 transition-colors cursor-pointer">info@alrowad-realestate.com</p>
                                <p className="text-slate-500 font-medium hover:text-emerald-600 transition-colors cursor-pointer">sales@alrowad-realestate.com</p>
                             </div>
                        </div>

                        {/* Form & Map */}
                        <div className="lg:col-span-2 space-y-8">
                             {/* Form */}
                            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">اترك رسالتك</h2>
                                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">الاسم بالكامل</label>
                                        <input type="text" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400" placeholder="الاسم" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف</label>
                                        <input type="tel" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400" placeholder="01xxxxxxxxx" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                                        <input type="email" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400" placeholder="example@mail.com" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">الرسالة</label>
                                        <textarea rows={5} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400" placeholder="كيف يمكننا مساعدتك؟"></textarea>
                                    </div>
                                    <div className="md:col-span-2">
                                        <button type="button" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-600/20 text-lg">
                                            إرسال
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Map Placeholder */}
                            <div className="h-80 bg-slate-200 rounded-3xl overflow-hidden shadow-lg relative group">
                                <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-slate-500">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span className="font-bold">خريطة الموقع</span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors cursor-pointer" title="Open in Google Maps"></div>
                            </div>
                        </div>
                    </div>
          