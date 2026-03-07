import { useState, useEffect, useRef } from 'react';
import {
  Cloud,
  Chart,
  Book1,
  Message,
  Truck,
  Magicpen,
  Location,
  Notification,
  Drop,
  Danger,
  People,
  StatusUp,
  Map1,
  ArrowRight,
  Call,
  Sms,
  Star1,
  PlayCircle,
  ShieldTick,
  Timer1,
  Global,
  Menu as MenuIcon,
  CloseCircle,
  Crop,
  Sun1,
  MoneyRecive,
} from 'iconsax-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './ui/accordion';

/* ──────── Props ──────── */
interface LandingPageProps {
  onGetStarted: () => void;
}

/* ──────── Animated Counter ──────── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          let s = 0;
          const dur = 2000;
          const step = (t: number) => {
            if (!s) s = t;
            const p = Math.min((t - s) / dur, 1);
            setCount(Math.floor(p * target));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ──────── Reveal ──────── */
function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[800ms] ease-out ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileNav, setMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scroll = (id: string) => {
    setMobileNav(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const nav = [
    { label: 'Home', id: 'hero' },
    { label: 'Services', id: 'services' },
    { label: 'Features', id: 'features' },
    { label: 'About', id: 'about' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 overflow-x-hidden font-[Inter,system-ui,sans-serif]">
      {/* ════════════ NAVBAR ════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${scrolled
          ? 'bg-white/80 backdrop-blur-2xl shadow-[0_2px_40px_rgba(0,0,0,0.06)] border-b border-slate-100'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 flex items-center justify-between h-[72px]">
          {/* Logo */}
          <button onClick={() => scroll('hero')} className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="FarmIQ" className="h-9 w-auto" />
            <span
              className={`text-[1.15rem] font-extrabold tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-white'
                }`}
            >
              Farm<span className="text-green-500">IQ</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => scroll(n.id)}
                className={`px-4 py-2 rounded-full text-[0.82rem] font-semibold tracking-wide transition-colors ${scrolled
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={onGetStarted}
              className="hidden lg:inline-flex rounded-full bg-green-600 hover:bg-green-700 text-white px-7 h-10 text-[0.82rem] font-bold shadow-lg shadow-green-600/20 hover:shadow-green-600/40 transition-all hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight size={16} />
            </Button>
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="lg:hidden p-2 rounded-xl transition-colors"
            >
              {mobileNav ? (
                <CloseCircle size={26} color={scrolled ? '#1e293b' : '#fff'} />
              ) : (
                <MenuIcon size={26} color={scrolled ? '#1e293b' : '#fff'} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileNav && (
          <div className="lg:hidden bg-white shadow-2xl border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
            <div className="px-5 py-5 space-y-1">
              {nav.map((n) => (
                <button
                  key={n.id}
                  onClick={() => scroll(n.id)}
                  className="block w-full text-left px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  {n.label}
                </button>
              ))}
              <Button
                onClick={onGetStarted}
                className="w-full mt-3 rounded-xl bg-green-600 hover:bg-green-700 text-white h-12 font-bold"
              >
                Get Started <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ════════════ HERO — FULL-SCREEN CINEMATIC ════════════ */}
      <section
        id="hero"
        className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden"
      >
        {/* BG Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=85&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          {/* green tint */}
          <div className="absolute inset-0 bg-gradient-to-tr from-green-950/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 w-full">
          <div className="max-w-3xl">
            <Reveal>
              <Badge className="rounded-full bg-white/10 text-white/90 backdrop-blur-lg border-white/20 px-5 py-2 text-[0.78rem] font-semibold tracking-wide mb-8 gap-2">
                <Magicpen size={14} variant="Bold" />
                AI-Powered Agriculture Platform
              </Badge>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="text-[3.2rem] sm:text-[4rem] lg:text-[5rem] font-black leading-[1.05] tracking-tight text-white mb-6">
                Grow Smarter.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-400 to-green-300">
                  Harvest Better.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-base sm:text-lg text-white/70 max-w-xl leading-relaxed mb-10">
                Real-time mandi prices, AI crop advisory, live weather
                intelligence, and India's largest farming community — all in one
                powerful platform.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={onGetStarted}
                  className="rounded-full bg-green-500 hover:bg-green-400 text-white h-14 px-10 text-base font-bold shadow-2xl shadow-green-500/30 hover:shadow-green-400/40 transition-all hover:-translate-y-0.5 active:translate-y-0 gap-2.5"
                >
                  Get Started — It's Free
                  <ArrowRight size={18} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => scroll('services')}
                  className="rounded-full border-white/30 bg-white/15 text-white hover:bg-white/25 h-14 px-10 text-base font-bold backdrop-blur-xl gap-2.5 hover:text-white shadow-lg"
                >
                  <PlayCircle size={18} />
                  See How It Works
                </Button>
              </div>
            </Reveal>

            {/* Trust strip */}
            <Reveal delay={450}>
              <div className="flex items-center gap-5 mt-14">
                <div className="flex -space-x-3">
                  {[
                    'photo-1595956481935-a9e254951d49',
                    'photo-1507003211169-0a1dd7228f2d',
                    'photo-1438761681033-6461ffad8d80',
                    'photo-1500648767791-00dcc994a43e',
                  ].map((id, i) => (
                    <Avatar key={i} className="w-10 h-10 border-2 border-white/30">
                      <AvatarImage
                        src={`https://images.unsplash.com/${id}?w=80&h=80&fit=crop&crop=face`}
                      />
                      <AvatarFallback>F</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star1 key={i} size={14} variant="Bold" color="#facc15" />
                    ))}
                  </div>
                  <p className="text-xs text-white/50 font-medium">
                    Trusted by 50,000+ farmers across India
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ════════════ STATS ════════════ */}
      <section className="relative -mt-20 z-20 max-w-[1320px] mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-black/20 p-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { val: 50000, suf: '+', label: 'Active Farmers', icon: People, grad: 'from-green-400 to-emerald-500', glow: 'shadow-green-500/20' },
                { val: 120, suf: '+', label: 'Crops Tracked', icon: Crop, grad: 'from-amber-400 to-orange-500', glow: 'shadow-amber-500/20' },
                { val: 500, suf: '+', label: 'Mandis Monitored', icon: StatusUp, grad: 'from-blue-400 to-cyan-500', glow: 'shadow-blue-500/20' },
                { val: 28, suf: '', label: 'States Covered', icon: Map1, grad: 'from-purple-400 to-violet-500', glow: 'shadow-purple-500/20' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="group relative flex flex-col items-center py-8 md:py-10 gap-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-lg ${s.glow} transition-transform group-hover:scale-110 group-hover:-translate-y-1`}>
                    <s.icon size={22} variant="Bold" color="#fff" />
                  </div>
                  <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    <Counter target={s.val} suffix={s.suf} />
                  </p>
                  <p className="text-[0.68rem] text-slate-400 font-bold tracking-[0.15em] uppercase">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════════ SERVICES ════════════ */}
      <section id="services" className="py-24 md:py-32">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="rounded-full px-4 py-1.5 text-green-700 border-green-200 bg-green-50 text-xs font-bold tracking-widest uppercase mb-4">
                Our Solutions
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold text-slate-900 tracking-tight mb-4">
                Everything You Need to Farm Smarter
              </h2>
              <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Six powerful modules designed for the modern Indian farmer — from
                seed to sale.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Magicpen,
                title: 'AI Crop Insights',
                desc: 'Personalized crop recommendations, pest alerts, and yield predictions powered by Google Gemini AI.',
                grad: 'from-green-500 to-emerald-400',
              },
              {
                icon: Chart,
                title: 'Live Mandi Prices',
                desc: 'Real-time crop prices across 500+ Indian mandis with 6-month trend analysis and district-wise data.',
                grad: 'from-blue-500 to-cyan-400',
              },
              {
                icon: Cloud,
                title: 'Weather Intelligence',
                desc: 'GPS-based live weather with temperature, humidity, wind, and condition forecasts for your exact location.',
                grad: 'from-amber-500 to-orange-400',
              },
              {
                icon: Book1,
                title: 'Crop Library',
                desc: 'Database of 120+ crops with soil requirements, fertilizer & irrigation guides, and pest management plans.',
                grad: 'from-purple-500 to-violet-400',
              },
              {
                icon: Message,
                title: 'Community Forum',
                desc: 'Connect with fellow farmers, share knowledge, and get expert advice on crop management challenges.',
                grad: 'from-pink-500 to-rose-400',
              },
              {
                icon: Truck,
                title: 'Transport Booking',
                desc: 'Book crop transportation in minutes — specify pickup, quantity, schedule, and track your shipment.',
                grad: 'from-teal-500 to-green-400',
              },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 70}>
                <Card className="group relative border-slate-200/70 bg-white hover:shadow-xl hover:shadow-slate-900/[0.04] hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden h-full">
                  {/* top gradient line */}
                  <div className={`h-1 bg-gradient-to-r ${s.grad} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <CardContent className="p-7 pt-6 flex flex-col h-full">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <s.icon size={22} variant="Bold" color="#fff" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed flex-1">
                      {s.desc}
                    </p>
                    <button
                      onClick={onGetStarted}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-700 mt-5 group/btn transition-colors"
                    >
                      Explore
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES — WHY CHOOSE US ════════════ */}
      <section id="features" className="py-24 md:py-32 bg-slate-950 text-white overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left — Image */}
            <Reveal>
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-[2.5rem] blur-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=700&h=500&fit=crop"
                  alt="Farmer using technology in the field"
                  className="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/3] ring-1 ring-white/10"
                />
                {/* Floating badge */}
                <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-green-500 rounded-2xl px-6 py-4 shadow-xl shadow-green-500/30 flex items-center gap-3">
                  <ShieldTick size={24} variant="Bold" color="#fff" />
                  <div>
                    <p className="text-lg font-extrabold text-white">98%</p>
                    <p className="text-[0.7rem] text-green-100 font-semibold">Farmer Satisfaction</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right — Content */}
            <div>
              <Reveal>
                <Badge variant="outline" className="rounded-full px-4 py-1.5 text-green-400 border-green-500/30 bg-green-500/10 text-xs font-bold tracking-widest uppercase mb-5">
                  Why Choose Us
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5 leading-[1.15]">
                  Built for Real Farmers,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                    Powered by AI
                  </span>
                </h2>
                <p className="text-base text-slate-400 leading-relaxed mb-10">
                  We built FarmIQ from the ground up with input from thousands of
                  Indian farmers — solving real challenges in crop management,
                  price discovery, and community support.
                </p>
              </Reveal>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: Location, title: 'Region-Aware', desc: 'Auto-detects your location for local weather data and nearby mandi prices.' },
                  { icon: Notification, title: 'Instant Alerts', desc: 'Price spikes, weather changes, and pest outbreak notifications in real-time.' },
                  { icon: Drop, title: 'Water Smart', desc: 'AI-calculated irrigation schedules that optimize water usage for your specific crops.' },
                  { icon: Danger, title: 'Pest Defense', desc: 'Proactive pest warnings with treatment recommendations tailored to your farm.' },
                ].map((f, i) => (
                  <Reveal key={i} delay={i * 80}>
                    <div className="flex gap-4 group">
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                        <f.icon size={20} variant="Bold" color="#4ade80" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1 text-[0.95rem]">{f.title}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white via-green-50/30 to-white overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="text-center mb-20">
              <Badge variant="outline" className="rounded-full px-4 py-1.5 text-green-700 border-green-200 bg-green-50 text-xs font-bold tracking-widest uppercase mb-4">
                How It Works
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold text-slate-900 tracking-tight mb-4">
                Start in 3 Simple Steps
              </h2>
              <p className="text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
                From sign-up to smarter harvests — it takes less than 2 minutes to get started.
              </p>
            </div>
          </Reveal>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical connector (desktop) */}
            <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-green-300 via-green-400 to-green-300" />

            {[
              {
                step: '01',
                icon: Global,
                title: 'Create Your Free Account',
                desc: 'Sign up in under 30 seconds with just your name and email. Set your farm location and our AI will automatically configure your regional data feeds — local weather, nearby mandis, and crop suggestions.',
                highlights: ['Instant setup', 'GPS auto-detect', 'No credit card needed'],
                img: '/step1.png',
              },
              {
                step: '02',
                icon: StatusUp,
                title: 'Explore Your Smart Dashboard',
                desc: 'Access a single powerful dashboard with real-time mandi prices across 500+ markets, live weather intelligence, AI-powered crop insights, and a comprehensive library of 120+ crops with growing guides.',
                highlights: ['6 powerful modules', 'Real-time data', 'AI recommendations'],
                img: '/step2.png',
              },
              {
                step: '03',
                icon: MoneyRecive,
                title: 'Grow Smarter, Earn More',
                desc: 'Make data-driven decisions on what to plant, when to irrigate, and where to sell. Farmers on FarmIQ report up to 25% higher returns by timing their sales using our mandi trend analysis and AI advisory.',
                highlights: ['25% higher returns', 'Optimal sell timing', 'Community support'],
                img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
              },
            ].map((s, i) => {
              const isEven = i % 2 === 0;
              return (
                <div key={i} className="relative mb-16 last:mb-0">
                  {/* Timeline dot (desktop) */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-12 z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 items-center justify-center shadow-xl shadow-green-500/25 ring-4 ring-white">
                    <s.icon size={24} variant="Bold" color="#fff" />
                  </div>

                  <div className={`grid lg:grid-cols-2 gap-8 lg:gap-20 items-center ${!isEven ? 'lg:direction-rtl' : ''}`}>
                    {/* Content side */}
                    <Reveal delay={i * 100}>
                      <div className={`${!isEven ? 'lg:col-start-2 lg:text-left' : ''}`}>
                        {/* Mobile icon */}
                        <div className="lg:hidden w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-xl shadow-green-500/25 mb-6">
                          <s.icon size={24} variant="Bold" color="#fff" />
                        </div>

                        <span className="text-[5rem] font-black text-green-100 leading-none block -mb-4 select-none">
                          {s.step}
                        </span>
                        <h3 className="text-2xl sm:text-[1.7rem] font-extrabold text-slate-900 mb-4 tracking-tight">
                          {s.title}
                        </h3>
                        <p className="text-[0.92rem] text-slate-500 leading-relaxed mb-6">
                          {s.desc}
                        </p>

                        {/* Highlight chips */}
                        <div className="flex flex-wrap gap-2">
                          {s.highlights.map((h, j) => (
                            <Badge
                              key={j}
                              variant="outline"
                              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-green-700 border-green-200 bg-green-50/80"
                            >
                              {h}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Reveal>

                    {/* Image side */}
                    <Reveal delay={i * 100 + 150}>
                      <div className={`${!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                        <Card className="overflow-hidden rounded-2xl border-slate-200/60 shadow-lg hover:shadow-xl transition-shadow group gap-0">
                          <CardContent className="p-0">
                            <div className="relative overflow-hidden aspect-[3/2]">
                              <img
                                src={s.img}
                                alt={s.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                              {/* Step badge on image */}
                              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                                  <s.icon size={16} variant="Bold" color="#fff" />
                                </div>
                                <span className="text-xs font-bold text-slate-900">Step {s.step}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </Reveal>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <Reveal delay={100}>
            <div className="text-center mt-16">
              <Button
                onClick={onGetStarted}
                className="rounded-full bg-green-600 hover:bg-green-700 text-white h-13 px-10 text-[0.92rem] font-bold shadow-lg shadow-green-600/20 hover:shadow-green-600/40 transition-all hover:-translate-y-0.5 gap-2"
              >
                Get Started Now — It's Free
                <ArrowRight size={16} />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════ ABOUT — FULL-WIDTH IMAGE ════════════ */}
      <section id="about" className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        </div>

        <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8">
          <div className="max-w-xl">
            <Reveal>
              <Badge variant="outline" className="rounded-full px-4 py-1.5 text-green-300 border-green-400/30 bg-green-500/10 text-xs font-bold tracking-widest uppercase mb-5">
                Modern Agriculture
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5 leading-[1.15]">
                Transforming Indian Farming with Technology
              </h2>
              <p className="text-base text-white/60 leading-relaxed mb-8">
                India's agricultural sector feeds 1.4 billion people. FarmIQ empowers
                the backbone of this ecosystem — the farmer — with cutting-edge AI,
                real-time market intelligence, and community-driven knowledge sharing.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Timer1, label: 'Real-Time Data' },
                  { icon: ShieldTick, label: 'Verified Sources' },
                  { icon: Sun1, label: 'Weather Accuracy' },
                  { icon: People, label: 'Community Driven' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                    <t.icon size={18} variant="Bold" color="#4ade80" />
                    <span className="text-sm font-semibold text-white/80">{t.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="rounded-full px-4 py-1.5 text-green-700 border-green-200 bg-green-50 text-xs font-bold tracking-widest uppercase mb-4">
                Testimonials
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold text-slate-900 tracking-tight mb-4">
                Hear From Our Farmers
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Rajesh Patel',
                role: 'Wheat Farmer • Gujarat',
                img: 'photo-1595956481935-a9e254951d49',
                text: 'The live mandi prices feature saved me lakhs this season. I now know exactly which mandi to sell at and when the prices peak.',
              },
              {
                name: 'Priya Sharma',
                role: 'Rice Farmer • Tamil Nadu',
                img: 'photo-1438761681033-6461ffad8d80',
                text: 'The community forum connected me with experienced farmers who helped me identify and treat brown planthoppers on my crop. Incredible platform.',
              },
              {
                name: 'Sunil Kumar',
                role: 'Vegetable Farmer • Maharashtra',
                img: 'photo-1507003211169-0a1dd7228f2d',
                text: 'Weather alerts have been a game-changer for my irrigation planning. My water costs have dropped by 40% this year using this platform.',
              },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <Card className="border-slate-200/70 bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-900/[0.04] transition-all h-full">
                  <CardContent className="p-7 flex flex-col h-full">
                    <div className="flex gap-0.5 mb-5">
                      {[...Array(5)].map((_, j) => (
                        <Star1 key={j} size={16} variant="Bold" color="#facc15" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed flex-1 italic">
                      "{t.text}"
                    </p>
                    <Separator className="my-5" />
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={`https://images.unsplash.com/${t.img}?w=80&h=80&fit=crop&crop=face`}
                        />
                        <AvatarFallback>{t.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FAQ ════════════ */}
      <section id="faq" className="py-24 md:py-32 bg-slate-50 border-y border-slate-100">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <Badge variant="outline" className="rounded-full px-4 py-1.5 text-green-700 border-green-200 bg-green-50 text-xs font-bold tracking-widest uppercase mb-4">
                FAQ
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <Accordion type="single" collapsible className="space-y-3">
              {[
                { q: 'Is FarmIQ free to use?', a: 'Yes! FarmIQ is completely free for individual farmers. We offer premium plans for agricultural businesses and cooperatives that need advanced analytics and bulk data exports.' },
                { q: 'Which crops does the platform support?', a: 'Our crop library covers 120+ crops including wheat, rice, tomato, cotton, sugarcane, onion, soybean, and all major Indian crops. We continuously add more based on farmer requests.' },
                { q: 'How accurate are the mandi prices?', a: 'Our mandi prices are sourced from official APMC data and updated in real-time across 500+ mandis. We also provide 6-month trend analysis to help you time your sales optimally.' },
                { q: 'Do I need a smartphone to use it?', a: 'FarmIQ works on any device with a web browser — smartphones, tablets, or desktops. Our interface is optimized for mobile use in the field with minimal data consumption.' },
                { q: 'How does the AI crop advisory work?', a: 'Our AI engine (powered by Google Gemini) analyzes your location, soil type, current weather, and market trends to provide personalized recommendations on planting, irrigation, pest management, and selling timing.' },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-xl border border-slate-200 px-6 shadow-sm">
                  <AccordionTrigger className="text-[0.95rem] font-bold text-slate-900 hover:no-underline py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-500 leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 rounded-3xl p-10 md:p-16 lg:p-20 text-center">
              {/* decorative */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.07] rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/[0.07] rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
                  Start Growing Smarter Today
                </h2>
                <p className="text-green-100 text-base md:text-lg max-w-xl mx-auto mb-10">
                  Join 50,000+ Indian farmers making data-driven decisions every
                  day with FarmIQ.
                </p>
                <Button
                  onClick={onGetStarted}
                  className="rounded-full bg-white text-green-700 hover:bg-green-50 h-14 px-12 text-base font-extrabold shadow-2xl shadow-green-900/30 hover:-translate-y-0.5 transition-all gap-2.5"
                >
                  Get Started — It's Free
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-8">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <img src="/logo.png" alt="FarmIQ" className="h-8 w-auto brightness-200" />
                <span className="text-lg font-extrabold text-white tracking-tight">
                  Farm<span className="text-green-400">IQ</span>
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                Empowering Indian farmers with AI-driven insights, live market
                data, and a supportive community platform.
              </p>
              <div className="flex gap-2">
                {['F', 'T', 'I', 'L'].map((letter, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-green-600 flex items-center justify-center transition-colors text-xs font-bold text-slate-400 hover:text-white"
                  >
                    {letter}
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm">Platform</h4>
              <ul className="space-y-3 text-sm">
                {['Dashboard', 'Crop Library', 'Mandi Prices', 'Weather', 'Community', 'Transport'].map(
                  (link) => (
                    <li key={link}>
                      <button onClick={onGetStarted} className="hover:text-green-400 transition-colors">
                        {link}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm">Company</h4>
              <ul className="space-y-3 text-sm">
                {['About Us', 'Careers', 'Blog', 'Press Kit', 'Privacy Policy', 'Terms of Service'].map(
                  (link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-green-400 transition-colors">{link}</a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm">Contact</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <Sms size={16} variant="Bold" color="#4ade80" />
                  support@farmiq.in
                </li>
                <li className="flex items-center gap-3">
                  <Call size={16} variant="Bold" color="#4ade80" />
                  +91 98765 43210
                </li>
                <li className="flex items-start gap-3">
                  <Location size={16} variant="Bold" color="#4ade80" className="mt-0.5 flex-shrink-0" />
                  AgriTech Hub, Nagpur,<br />Maharashtra, India
                </li>
              </ul>
            </div>
          </div>

          <Separator className="bg-slate-800 mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} FarmIQ. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">
              Made with 🌱 for Indian Farmers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
