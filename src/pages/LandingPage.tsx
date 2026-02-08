import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, ArrowRight, ArrowUpRight, Zap, Brain, Users } from "lucide-react";
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
  user_email: string;
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
      .from("community_posts")
      .select("id, user_email, content, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setPosts(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden selection:bg-foreground selection:text-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-14">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            <span className="text-sm font-bold tracking-tight uppercase">ApplyMate</span>
          </div>
          <Link to="/auth">
            <Button size="sm" className="rounded-full h-8 px-5 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90">
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
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-end">
            <div className="lg:col-span-8">
              <motion.div
                initial="hidden" animate="visible" custom={0} variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/50 mb-8"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                  Application Intelligence
                </span>
              </motion.div>

              <motion.h1
                initial="hidden" animate="visible" custom={1} variants={fadeUp}
                className="text-[clamp(2.8rem,9vw,8rem)] font-bold leading-[0.85] tracking-tighter"
              >
                Track.
                <br />
                <span className="font-serif-display italic font-normal text-muted-foreground">Apply.</span>
                <br />
                Win.
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
                <Button size="lg" className="rounded-full h-13 px-10 text-sm font-semibold group bg-foreground text-background hover:bg-foreground/90 shadow-2xl shadow-foreground/10">
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
          className="absolute bottom-0 left-0 right-0 h-px bg-border origin-left"
        />
      </motion.section>

      {/* Capabilities — bold icons */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              { icon: Zap, title: "Organize", desc: "Every scholarship in one place. Deadlines, statuses, notes — all tracked automatically." },
              { icon: Brain, title: "AI-Powered", desc: "Paste a URL. AI extracts details, writes essay drafts, and analyzes your match score." },
              { icon: Users, title: "Community", desc: "Share applications, discuss strategies, and learn from others who've won." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                custom={i} variants={fadeUp}
                className="group p-8 md:p-10 border border-border/50 md:first:rounded-l-3xl md:last:rounded-r-3xl hover:bg-muted/30 transition-colors duration-500"
              >
                <div className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community preview */}
      <section className="py-20 sm:py-28 px-5 sm:px-8 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            custom={0} variants={fadeUp}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 font-semibold">Live Feed</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                What people are<br />
                <span className="font-serif-display italic font-normal text-muted-foreground">talking about.</span>
              </h2>
            </div>
            <Link to="/auth">
              <Button variant="outline" className="rounded-full h-9 px-5 text-xs font-semibold group">
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
                  className="rounded-2xl border border-border/50 bg-card/50 p-6 hover:bg-card hover:shadow-lg hover:shadow-foreground/[0.03] transition-all duration-500 group"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold">
                      {post.user_email[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold block truncate">{post.user_email.split("@")[0]}</span>
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
        {/* Gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-foreground/[0.02] blur-3xl pointer-events-none" />

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          custom={0} variants={fadeUp}
          className="max-w-2xl mx-auto text-center relative"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-6 leading-[0.95]">
            Stop losing<br />
            <span className="font-serif-display italic font-normal text-muted-foreground">scholarships.</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-10 max-w-sm mx-auto">
            Free forever. No credit card. Start tracking in seconds.
          </p>
          <Link to="/auth">
            <Button size="lg" className="rounded-full h-14 px-12 text-sm font-semibold group bg-foreground text-background hover:bg-foreground/90 shadow-2xl shadow-foreground/10">
              Start Now
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Rocket className="h-3.5 w-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">ApplyMate</span>
          </div>
          <p className="text-[10px] text-muted-foreground tracking-wider">© {new Date().getFullYear()} ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
}
