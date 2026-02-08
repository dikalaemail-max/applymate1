import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" as const }
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

  useEffect(() => {
    supabase
      .from("community_posts")
      .select("id, user_email, content, created_at")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setPosts(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden selection:bg-foreground selection:text-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-14">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            <span className="text-sm font-bold tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ApplyMate
            </span>
          </div>
          <Link to="/auth">
            <Button size="sm" className="rounded-full h-8 px-5 text-xs font-semibold">
              Enter
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero — editorial, asymmetric */}
      <section className="relative pt-32 sm:pt-44 pb-24 sm:pb-36 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-end">
            <div className="lg:col-span-8">
              <motion.p
                initial="hidden" animate="visible" custom={0} variants={fadeUp}
                className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 font-semibold"
              >
                Application Intelligence
              </motion.p>
              <motion.h1
                initial="hidden" animate="visible" custom={1} variants={fadeUp}
                className="text-[clamp(2.5rem,8vw,7rem)] font-bold leading-[0.9] tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Track.
                <br />
                <span className="font-serif-display italic font-normal">Apply.</span>
                <br />
                Win.
              </motion.h1>
            </div>

            <motion.div
              initial="hidden" animate="visible" custom={3} variants={fadeUp}
              className="lg:col-span-4 lg:pb-4"
            >
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
                The modern workspace for organizing scholarship applications. AI does the heavy lifting — you collect the awards.
              </p>
              <Link to="/auth">
                <Button size="lg" className="rounded-full h-12 px-8 text-sm font-semibold group">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-0 right-0 h-px bg-border origin-left"
        />
      </section>

      {/* Marquee stats strip */}
      <section className="border-b border-border py-5 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center justify-center gap-8 sm:gap-16 px-5 flex-wrap"
        >
          {[
            { label: "Applications Tracked", value: "∞" },
            { label: "AI-Powered", value: "Yes" },
            { label: "Price", value: "Free" },
            { label: "Setup Time", value: "30s" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>{stat.value}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Three capabilities — minimal, no cards */}
      <section className="py-20 sm:py-32 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            custom={0} variants={fadeUp}
            className="mb-16"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-semibold">What it does</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-lg" style={{ fontFamily: "'Space Grotesk'" }}>
              Three things,<br />
              <span className="font-serif-display italic font-normal">done right.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-border">
            {[
              { num: "01", title: "Organize", desc: "Every scholarship in one place. Deadlines, statuses, notes — all tracked." },
              { num: "02", title: "Automate", desc: "Paste a URL. AI extracts details, suggests strategies, writes drafts." },
              { num: "03", title: "Collaborate", desc: "Share applications with peers. Discuss in community threads." },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                custom={i + 1} variants={fadeUp}
                className="border-b md:border-b-0 md:border-r last:border-r-0 border-border py-8 md:px-8 first:md:pl-0 last:md:pr-0"
              >
                <span className="text-xs text-muted-foreground font-mono">{item.num}</span>
                <h3 className="text-xl font-bold mt-2 mb-3" style={{ fontFamily: "'Space Grotesk'" }}>{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community preview — live posts, read-only */}
      <section className="py-20 sm:py-32 px-5 sm:px-8 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            custom={0} variants={fadeUp}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-semibold">Community</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>
                What people are<br />
                <span className="font-serif-display italic font-normal">talking about.</span>
              </h2>
            </div>
            <Link to="/auth">
              <Button variant="outline" className="rounded-full h-9 px-5 text-xs font-semibold">
                Join the conversation
                <ArrowUpRight className="h-3 w-3 ml-1.5" />
              </Button>
            </Link>
          </motion.div>

          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">Community posts will appear here.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-30px" }}
                  custom={i} variants={fadeUp}
                  className="bg-background p-6 sm:p-8 group"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold">
                      {post.user_email[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold">{post.user_email.split("@")[0]}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-4">{post.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-36 px-5 sm:px-8 border-t border-border">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          custom={0} variants={fadeUp}
          className="max-w-3xl mx-auto text-center"
        >
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.05]"
            style={{ fontFamily: "'Space Grotesk'" }}
          >
            Stop losing<br />
            <span className="font-serif-display italic font-normal">scholarships.</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Free. No credit card. Start tracking in seconds.
          </p>
          <Link to="/auth">
            <Button size="lg" className="rounded-full h-14 px-10 text-sm font-semibold group">
              Start Now
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Rocket className="h-3.5 w-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk'" }}>ApplyMate</span>
          </div>
          <p className="text-[10px] text-muted-foreground tracking-wider">© {new Date().getFullYear()} ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
}
