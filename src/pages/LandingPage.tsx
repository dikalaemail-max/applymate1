import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, Zap, Brain, Users, Sparkles } from "lucide-react";
import { ApplyMateLogo } from "@/components/ApplyMateLogo";
import { motion, useScroll, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
  })
};

interface PublicPost {
  id: string;
  display_name: string;
  content: string;
  created_at: string;
}

export default function LandingPage() {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.6]);

  useEffect(() => {
    supabase
      .rpc("get_recent_public_posts")
      .then(({ data }) => setPosts((data as PublicPost[]) || []));
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground">
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[hsl(var(--gradient-start)/0.08)] blur-[120px]" />
        <div className="absolute top-[30%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[hsl(var(--gradient-end)/0.06)] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-[hsl(var(--gradient-accent)/0.05)] blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/40 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-14">
          <div className="flex items-center gap-2">
            <ApplyMateLogo size="sm" className="text-primary" />
            <span className="text-sm font-bold tracking-tight uppercase">ApplyMate</span>
          </div>
          <Link to="/auth">
            <Button size="sm" className="rounded-full h-8 px-5 text-xs font-semibold gradient-primary border-0 text-white hover:opacity-90 glow-sm">
              Enter
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="relative pt-28 sm:pt-40 pb-20 sm:pb-32 px-5 sm:px-8"
      >
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-end">
            <div className="lg:col-span-8">
              <motion.div
                initial="hidden" animate="visible" custom={0} variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8"
              >
                <div className="accent-dot animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary/70">
                  Application Intelligence
                </span>
              </motion.div>

              <motion.h1
                initial="hidden" animate="visible" custom={1} variants={fadeUp}
                className="text-[clamp(2.8rem,9vw,8rem)] font-bold leading-[0.85] tracking-tighter"
              >
                <span className="gradient-text">Track.</span>
                <br />
                <span className="font-serif-display italic font-normal text-muted-foreground">Apply.</span>
                <br />
                <span className="gradient-text">Win.</span>
              </motion.h1>
            </div>

            <motion.div
              initial="hidden" animate="visible" custom={3} variants={fadeUp}
              className="lg:col-span-4 lg:pb-6"
            >
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-8">
                The workspace for organizing scholarship applications. AI does the heavy lifting — you collect the awards.
              </p>
              <Link to="/auth">
                <Button size="lg" className="rounded-full h-13 px-10 text-sm font-semibold group gradient-primary border-0 text-white glow shadow-2xl">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-0 right-0 h-px origin-left"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent)' }}
        />
      </motion.section>

      {/* Capabilities */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              { icon: Zap, title: "Organize", desc: "Every scholarship in one place. Deadlines, statuses, notes — all tracked automatically.", color: "var(--gradient-start)" },
              { icon: Brain, title: "AI-Powered", desc: "Paste a URL. AI extracts details, writes essay drafts, and analyzes your match score.", color: "var(--gradient-mid)" },
              { icon: Users, title: "Community", desc: "Share applications, discuss strategies, and learn from others who've won.", color: "var(--gradient-end)" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                custom={i} variants={fadeUp}
                className="group p-8 md:p-10 border border-border/50 md:first:rounded-l-3xl md:last:rounded-r-3xl hover:bg-white/[0.02] transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, hsl(${item.color} / 0.08) 0%, transparent 70%)` }} />
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500"
                    style={{ background: `linear-gradient(135deg, hsl(${item.color} / 0.15), hsl(${item.color} / 0.05))` }}>
                    <item.icon className="h-5 w-5" style={{ color: `hsl(${item.color})` }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community preview */}
      <section className="py-20 sm:py-28 px-5 sm:px-8 border-t border-border/30 relative">
        <div className="absolute inset-0 mesh-gradient pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            custom={0} variants={fadeUp}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary/50 mb-3 font-semibold">Live Feed</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                What people are<br />
                <span className="font-serif-display italic font-normal text-muted-foreground">talking about.</span>
              </h2>
            </div>
            <Link to="/auth">
              <Button variant="outline" className="rounded-full h-9 px-5 text-xs font-semibold group border-primary/20 hover:bg-primary/5 hover:border-primary/40">
                Join the conversation
                <ArrowUpRight className="h-3 w-3 ml-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">Community posts will appear here.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-30px" }}
                  custom={i} variants={fadeUp}
                  className="glass-card rounded-2xl p-6 hover:border-primary/20 transition-all duration-500 group"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                     <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-white">
                       {post.display_name[0]?.toUpperCase()}
                     </div>
                     <div className="flex-1 min-w-0">
                       <span className="text-xs font-semibold block truncate">{post.display_name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-3 text-muted-foreground group-hover:text-foreground transition-colors">{post.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-36 px-5 sm:px-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(var(--gradient-start) / 0.08) 0%, hsl(var(--gradient-end) / 0.04) 40%, transparent 70%)' }} />

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          custom={0} variants={fadeUp}
          className="max-w-2xl mx-auto text-center relative"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary/70">Free Forever</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-6 leading-[0.95]">
            Stop losing<br />
            <span className="font-serif-display italic font-normal gradient-text">scholarships.</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-10 max-w-sm mx-auto">
            No credit card. Start tracking in seconds.
          </p>
          <Link to="/auth">
            <Button size="lg" className="rounded-full h-14 px-12 text-sm font-semibold group gradient-primary border-0 text-white glow shadow-2xl">
              Start Now
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ApplyMateLogo size="sm" className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">ApplyMate</span>
          </div>
          <p className="text-[10px] text-muted-foreground tracking-wider">© {new Date().getFullYear()} ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
}
