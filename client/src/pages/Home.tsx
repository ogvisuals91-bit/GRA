import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { PackageCard } from "@/components/ui/PackageCard";
import { Button } from "@/components/ui/button";
import { useNominees } from "@/hooks/use-nominees";
import { useSponsors } from "@/hooks/use-sponsors";
import { TrophyCube3D } from "@/components/ui/TrophyCube3D";
import { ArrowRight, Trophy, Star, Users, List, Vote, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import dlaImg from "@assets/IMG-20260324-WA0101_1774339020122.jpg";
import doublogImg from "@assets/IMG-20260324-WA0088_1774339020174.jpg";
import ogMediaImg from "@assets/1767315883316_1774339088792.jpg";
import lyricalCruzImg from "@assets/file_0000000017f47246994ac8fc6c5cccb1_1774339089079.png";

const DEFAULT_SPONSORS = [
  { id: "dla", name: "DLA Entertainment", imageUrl: dlaImg },
  { id: "dou", name: "Dou Blog", imageUrl: doublogImg },
  { id: "og", name: "OG Media", imageUrl: ogMediaImg },
  { id: "lyrical", name: "Lyrical Cruz", imageUrl: lyricalCruzImg },
];

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

const AWARDS_DATE = new Date("2026-05-30T00:00:00");

function SponsorSlideshow({ dbSponsors }: { dbSponsors: { id: number; name: string; imageUrl: string }[] }) {
  const allSlides = [
    ...DEFAULT_SPONSORS,
    ...dbSponsors.map(s => ({ id: String(s.id), name: s.name, imageUrl: s.imageUrl })),
  ];

  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % allSlides.length);
    }, 3500);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [allSlides.length]);

  const goTo = (index: number) => {
    setCurrent(index);
    startTimer();
  };

  const prev = () => goTo((current - 1 + allSlides.length) % allSlides.length);
  const next = () => goTo((current + 1) % allSlides.length);

  if (allSlides.length === 0) return null;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl aspect-video bg-secondary/20 border border-primary/20 shadow-[0_0_60px_rgba(168,85,247,0.15)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={allSlides[current].id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={allSlides[current].imageUrl}
              alt={allSlides[current].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              <span className="text-white font-bold text-lg tracking-wide drop-shadow-lg px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                {allSlides[current].name}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          data-testid="sponsor-slide-prev"
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 border border-white/10 text-white rounded-full p-2 backdrop-blur-sm transition-all z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          data-testid="sponsor-slide-next"
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 border border-white/10 text-white rounded-full p-2 backdrop-blur-sm transition-all z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 justify-center mt-5">
        {allSlides.map((_, i) => (
          <button
            key={i}
            data-testid={`sponsor-dot-${i}`}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "bg-primary w-8" : "bg-white/20 w-2 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: nominees } = useNominees();
  const { data: dbSponsors = [] } = useSponsors();
  const countdown = useCountdown(AWARDS_DATE);

  const featured = nominees?.sort((a, b) => b.votes - a.votes).slice(0, 3) || [];

  return (
    <div className="min-h-full bg-background selection:bg-primary/30">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-8">
              <Star className="w-3 h-3 fill-primary" />
              The 2026 Official Awards
              <Star className="w-3 h-3 fill-primary" />
            </div>
            <h1 className="font-serif text-5xl md:text-8xl font-bold mb-8 leading-tight">
              THE <span className="text-gradient-gold">GHOST</span> <br/>
              AWARDS
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
              Celebrating digital excellence. Support the creators, artists, and visionaries shaping our future.
            </p>

            {/* Countdown Timer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-10"
            >
              <div className="inline-flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Awards Night — May 30, 2026
                </div>
                <div className="flex gap-3 sm:gap-5">
                  {[
                    { label: "Days", value: countdown.days },
                    { label: "Hours", value: countdown.hours },
                    { label: "Mins", value: countdown.minutes },
                    { label: "Secs", value: countdown.seconds },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center bg-secondary/60 border border-primary/20 rounded-2xl px-4 py-3 min-w-[64px] backdrop-blur-sm"
                    >
                      <span className="text-3xl sm:text-4xl font-mono font-bold text-primary leading-none tabular-nums">
                        {String(value).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground mt-1">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vote">
                <Button size="lg" className="gold-gradient text-white hover-elevate active-elevate-2 text-lg px-10 py-7 h-auto font-bold tracking-wider rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  VOTE NOW
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline" size="lg" className="border-primary/50 text-primary hover-elevate active-elevate-2 text-lg px-10 py-7 h-auto rounded-full backdrop-blur-sm">
                  VIEW NOMINEES
                </Button>
              </Link>
            </div>

            {/* 3D Trophy Cube */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              className="mt-16 flex justify-center"
            >
              <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] drop-shadow-[0_0_80px_rgba(168,85,247,0.5)]">
                <TrophyCube3D />
                <div className="absolute inset-0 pointer-events-none rounded-full bg-primary/5 blur-3xl" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sponsors / Partners Slideshow */}
      <section className="py-24 relative overflow-hidden bg-secondary/10 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4">
              <Star className="w-3 h-3 fill-primary" />
              Our Sponsors & Partners
              <Star className="w-3 h-3 fill-primary" />
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">
              Proud <span className="text-gradient-gold">Sponsors</span>
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">Brands powering the Ghost Awards 2026</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <SponsorSlideshow dbSponsors={dbSponsors} />
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 border-y border-border/40 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <List className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">1. Explore Categories</h3>
              <p className="text-muted-foreground">Browse through our curated selection of categories and nominees.</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <Vote className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">2. Cast Your Vote</h3>
              <p className="text-muted-foreground">Select your favorites and choose a voting package to support them.</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">3. Crown the Winners</h3>
              <p className="text-muted-foreground">Watch the leaderboard as we count down to the grand finale.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Nominees */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-16"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Top Contenders</h2>
              <p className="text-muted-foreground">The most supported nominees across all categories</p>
            </div>
            <Link href="/leaderboard" className="hidden sm:block">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                View Full Leaderboard <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((nominee, i) => (
              <motion.div
                key={nominee.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] hover-elevate"
              >
                <img 
                  src={nominee.imageUrl || "/placeholder-nominee.png"} 
                  alt={nominee.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                
                <div className="absolute bottom-0 left-0 p-8 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="text-primary font-bold text-xs tracking-widest mb-2 uppercase opacity-80">{nominee.categoryName}</div>
                  <h3 className="text-3xl font-bold text-white mb-4 leading-tight">{nominee.name}</h3>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                    <span className="text-gray-300 text-sm font-medium tracking-wider">{nominee.votes.toLocaleString()} VOTES</span>
                    <Link href={`/vote?nominee=${nominee.id}`}>
                      <Button size="sm" className="rounded-full bg-white text-black hover:bg-primary font-bold shadow-xl">
                        VOTE
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
