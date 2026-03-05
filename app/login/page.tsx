"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-10 px-4 bg-gradient-to-br from-brand-sand/40 via-white to-brand-sand/20">
      <div className="w-full max-w-md animate-fade-in relative z-10">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-brand-dark mb-2">SoulWealth CMS</h1>
          <p className="text-brand-dark/60">Secure admin access</p>
        </div>

        <Card className="border-brand-copper/20 bg-white/90 backdrop-blur-md shadow-warm-lg overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-olive to-brand-green" />
          <CardHeader className="pt-8 pb-4 text-center">
            <div className="mx-auto w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-5 border border-brand-copper/20 shadow-warm-sm overflow-hidden">
              <img src="/logo.png" alt="SoulWealth Logo" className="w-full h-full object-contain p-1.5" />
            </div>
            <CardTitle className="text-xl font-serif text-brand-dark">Sign In</CardTitle>
            <CardDescription className="text-brand-dark/60 mt-1">Enter your details to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand-dark font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-brand-copper/20 focus-visible:ring-brand-olive bg-white h-11"
                  placeholder="admin@soulwealth.studio"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-brand-dark font-medium">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-brand-copper/20 focus-visible:ring-brand-olive bg-white h-11"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error ? (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-[13px] rounded-md animate-fade-in text-center">
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="w-full h-11 bg-brand-dark hover:bg-brand-dark/90 text-white font-medium text-[15px] shadow-warm-sm transition-all" disabled={loading}>
                {loading ? "Authenticating..." : "Sign In to Console"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Decorative background blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-olive/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-copper/5 blur-3xl pointer-events-none" />
    </div>
  );
}
