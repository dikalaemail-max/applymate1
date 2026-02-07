import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Rocket, ArrowRight, Sparkles, Shield, Share2, 
  FolderOpen, Clock, BrainCircuit, CheckCircle2, 
  ChevronRight, Zap, Star
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const }
  })
};

const features = [
  {
    icon: FolderOpen,
    title: "Track Everything",
    description: "Organize all your scholarship applications in one place with smart status tracking.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Insights",
    description: "Get personalized advice and auto-fill applications using intelligent extraction.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Clock,
    title: "Never Miss Deadlines",
    description: "Visual deadline tracking with urgency indicators keeps you on schedule.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Share2,
    title: "Share & Collaborate",
    description: "Share scholarships with friends and discover opportunities through the community.",
    gradient: "from-emerald-500 to-green-500",
  },
];

const steps = [
  { step: "01", title: "Add Applications", description: "Paste a URL or text — AI extracts the details instantly." },
  { step: "02", title: "Stay Organized", description: "Track status, deadlines, and requirements in one dashboard." },
  { step: "03", title: "Win More", description: "Get AI-driven strategy tips to maximize your success rate." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="gradient-primary p-1.5 rounded-lg">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ApplyMate
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gradient-primary border-0 text-white rounded-xl shadow-lg shadow-primary/20 text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 mesh-gradient opacity-70" />
        <div className="absolute top-20 -left-32 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-[hsl(var(--gradient-start))] opacity-20 blur-[100px]" />
        <div className="absolute bottom-0 -right-32 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-[hsl(var(--gradient-end))] opacity-15 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(var(--gradient-accent))] opacity-[0.06] blur-[120px]" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden" animate="visible" custom={0} variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-semibold text-primary mb-6"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Application Tracker
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" custom={1} variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Stop losing track of{" "}
            <span className="gradient-text">scholarships.</span>
          </motion.h1>

          <motion.p
            initial="hidden" animate="visible" custom={2} variants={fadeUp}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            ApplyMate is the modern way to organize, track, and win more scholarship applications — 
            powered by AI that does the heavy lifting.
          </motion.p>

          <motion.div
            initial="hidden" animate="visible" custom={3} variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/auth">
              <Button size="lg" className="gradient-primary border-0 text-white rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-110 transition-all h-12 px-8 text-base w-full sm:w-auto">
                Start for Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="rounded-xl h-12 px-8 text-base w-full sm:w-auto glass">
                See Features
              </Button>
            </a>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial="hidden" animate="visible" custom={5} variants={fadeUp}
            className="mt-16 sm:mt-20 relative"
          >
            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl shadow-primary/10">
              <div className="bg-sidebar rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
                {/* Mock dashboard header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-3 w-24 sm:w-32 rounded-full bg-sidebar-foreground/20" />
                    <div className="h-2 w-16 sm:w-20 rounded-full bg-sidebar-foreground/10 mt-2" />
                  </div>
                  <div className="h-8 w-24 sm:w-28 rounded-lg gradient-primary opacity-80" />
                </div>
                {/* Mock stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { label: "Total", value: "12", color: "from-violet-500 to-purple-600" },
                    { label: "Upcoming", value: "4", color: "from-amber-400 to-orange-500" },
                    { label: "Submitted", value: "6", color: "from-blue-400 to-indigo-500" },
                    { label: "Awarded", value: "2", color: "from-emerald-400 to-green-500" },
                  ].map((s) => (
                    <div key={s.label} className="bg-sidebar-accent/50 rounded-lg sm:rounded-xl p-3">
                      <div className={`bg-gradient-to-br ${s.color} h-6 w-6 rounded-lg mb-2`} />
                      <p className="text-lg sm:text-xl font-bold text-sidebar-foreground">{s.value}</p>
                      <p className="text-[10px] sm:text-xs text-sidebar-foreground/50">{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Mock list */}
                <div className="space-y-2">
                  {["Gates Scholarship — $20,000", "Fulbright Award — $15,000", "Rhodes Scholarship — $30,000"].map((item) => (
                    <div key={item} className="flex items-center justify-between bg-sidebar-accent/30 rounded-lg p-2.5 sm:p-3">
                      <span className="text-xs sm:text-sm text-sidebar-foreground/70 truncate">{item}</span>
                      <div className="h-5 w-14 sm:w-16 rounded-full bg-emerald-500/20 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-2 sm:-right-4 glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl animate-float hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-1.5 rounded-lg">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Application Submitted!</p>
                  <p className="text-[10px] text-muted-foreground">Gates Scholarship</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 -left-2 sm:-left-4 glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl animate-float hidden sm:block" style={{ animationDelay: "1.5s" }}>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-1.5 rounded-lg">
                  <BrainCircuit className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold">AI Tip Available</p>
                  <p className="text-[10px] text-muted-foreground">Optimize your essay</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 relative">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            custom={0} variants={fadeUp}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Everything you need to{" "}
              <span className="gradient-text">win more.</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              Powerful tools designed to give you an unfair advantage in the scholarship game.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                custom={i + 1} variants={fadeUp}
                className="glass-card rounded-2xl p-6 sm:p-8 hover-lift group"
              >
                <div className={`bg-gradient-to-br ${feature.gradient} p-3 rounded-xl w-fit mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative">
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            custom={0} variants={fadeUp}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Three steps to{" "}
              <span className="gradient-text">scholarship success.</span>
            </h2>
          </motion.div>

          <div className="space-y-6 sm:space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                custom={i + 1} variants={fadeUp}
                className="glass-card rounded-2xl p-6 sm:p-8 flex items-start gap-4 sm:gap-6 hover-lift"
              >
                <div className="gradient-primary text-white text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            custom={0} variants={fadeUp}
            className="glass-card rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center"
          >
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <blockquote className="text-lg sm:text-xl md:text-2xl font-medium leading-relaxed mb-6 max-w-2xl mx-auto" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              "ApplyMate completely transformed how I manage scholarship applications. The AI features alone saved me dozens of hours."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white">
                JD
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Jane Doe</p>
                <p className="text-xs text-muted-foreground">Graduate Student, MIT</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-[0.08]" />
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-[hsl(var(--gradient-end))] opacity-20 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[hsl(var(--gradient-start))] opacity-20 blur-[100px]" />
        
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          custom={0} variants={fadeUp}
          className="relative max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-semibold text-primary mb-6">
            <Zap className="h-3.5 w-3.5" />
            Free to Use
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Ready to take control of your{" "}
            <span className="gradient-text">applications?</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join students who are winning more scholarships with less stress. No credit card required.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gradient-primary border-0 text-white rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-110 transition-all h-14 px-10 text-base">
              Get Started — It's Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="gradient-primary p-1.5 rounded-lg">
              <Rocket className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>ApplyMate</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ApplyMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
