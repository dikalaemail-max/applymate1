import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { ApplyMateLogo } from "@/components/ApplyMateLogo";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const ADMIN_CHALLENGES = [
  "What is the boiling point of water in Fahrenheit minus 154?",
  "How many cards are in a standard deck minus the number of suits plus 6?",
  "If a cat has 9 lives and a dog has 1, multiply them and subtract the number of continents plus 51?",
  "What is a baker's dozen multiplied by 4, plus 6?",
  "How many hours in a day times 2, plus 10?",
];

const CORRECT_ANSWER = '"58"';

export default function Auth() {
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeQuestion, setChallengeQuestion] = useState("");
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [pendingAdmin, setPendingAdmin] = useState(false);

  useEffect(() => {
    if (user && isAdmin && !pendingAdmin) {
      const q = ADMIN_CHALLENGES[Math.floor(Math.random() * ADMIN_CHALLENGES.length)];
      setChallengeQuestion(q);
      setShowChallenge(true);
      setPendingAdmin(true);
    }
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (user && isAdmin && !showChallenge && pendingAdmin) return <Navigate to="/admin" replace />;
  if (user && isAdmin && !showChallenge && !pendingAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) { toast({ title: "Invalid email", description: emailResult.error.errors[0].message, variant: "destructive" }); return; }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) { toast({ title: "Invalid password", description: passwordResult.error.errors[0].message, variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/` } });
        if (error) {
          if (error.message.includes("already registered")) { toast({ title: "Account exists", description: "This email is already registered. Try logging in instead.", variant: "destructive" }); return; }
          throw error;
        }
        toast({ title: "Check your email", description: "We sent you a confirmation link to verify your account." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (challengeAnswer.trim() === CORRECT_ANSWER) {
      setShowChallenge(false);
    } else {
      toast({ title: "Wrong answer", description: "Access denied. Try again.", variant: "destructive" });
      const q = ADMIN_CHALLENGES[Math.floor(Math.random() * ADMIN_CHALLENGES.length)];
      setChallengeQuestion(q);
      setChallengeAnswer("");
    }
  };

  const authBg = (
    <>
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl animate-float"
        style={{ background: 'linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-mid)))' }} />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full opacity-15 blur-3xl animate-float"
        style={{ background: 'linear-gradient(135deg, hsl(var(--gradient-mid)), hsl(var(--gradient-end)))', animationDelay: '1.5s' }} />
    </>
  );

  if (showChallenge && user && isAdmin) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        {authBg}
        <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-up">
          <div className="flex flex-col items-center gap-3">
            <ApplyMateLogo size="lg" className="text-primary" />
            <h1 className="text-2xl font-bold tracking-tight gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Admin Verification
            </h1>
          </div>
          <div className="glass-card rounded-2xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Security Question</h2>
              <p className="text-sm text-muted-foreground">{challengeQuestion}</p>
            </div>
            <form onSubmit={handleChallengeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="challenge" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Answer</Label>
                <Input id="challenge" type="text" placeholder="Type your answer..." value={challengeAnswer} onChange={(e) => setChallengeAnswer(e.target.value)} required
                  className="h-12 rounded-xl bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all" autoFocus />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl gradient-primary border-0 text-white font-semibold text-sm glow">
                Verify <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
            <button type="button" onClick={async () => { await supabase.auth.signOut(); setShowChallenge(false); setPendingAdmin(false); }}
              className="text-sm text-muted-foreground hover:underline w-full text-center">Sign out instead</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {authBg}
      <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-up">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <ApplyMateLogo size="lg" className="text-primary" />
            <h1 className="text-4xl font-bold tracking-tight gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ApplyMate
            </h1>
          </div>
          <p className="text-muted-foreground text-center text-sm">Track applications, never miss a deadline</p>
        </div>
        <div className="glass-card rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {isLogin ? "Welcome back" : "Get started"}
            </h2>
            <p className="text-sm text-muted-foreground">{isLogin ? "Sign in to your account" : "Create your free account"}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="h-12 rounded-xl bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="h-12 rounded-xl bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all" />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl gradient-primary border-0 text-white font-semibold text-sm glow" disabled={submitting}>
              {isLogin ? "Sign In" : "Create Account"} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">{isLogin ? "Don't have an account?" : "Already have an account?"} </span>
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
