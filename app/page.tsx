"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Play } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-10">
          <div className="mx-auto w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-warm-md border border-brand-copper/20 overflow-hidden">
            <img src="/logo.png" alt="SoulWealth Logo" className="w-full h-full object-contain p-2" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-normal text-brand-dark mb-4 tracking-tight">SoulWealth Studio</h1>
          <p className="text-lg text-brand-dark/70 font-light max-w-lg mx-auto">
            Content management system for managing quizzes, topics, and dynamic website elements.
          </p>
        </div>

        <Card className="mx-auto border-brand-copper/20 bg-white/80 backdrop-blur-md shadow-warm-lg overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-brand-copper to-brand-gold" />
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-2xl font-serif text-brand-dark">Welcome back</CardTitle>
            <CardDescription className="text-base text-brand-dark/60">Choose a workspace to continue</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 p-8">
            <Link href="/admin" className="flex-1">
              <Button className="w-full h-14 text-base bg-brand-dark text-white hover:bg-brand-dark/90 shadow-warm-md group transition-all">
                <Settings className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
                Open Admin Console
              </Button>
            </Link>
            <Link href="/quiz" className="flex-1">
              <Button variant="outline" className="w-full h-14 text-base border-brand-copper/30 text-brand-dark hover:bg-brand-sand/50 hover:border-brand-copper transition-all group">
                <Play className="mr-2 h-5 w-5 opacity-60 transition-transform group-hover:scale-110 group-hover:text-brand-copper" />
                Test Quiz Player
              </Button>
            </Link>
          </CardContent>
          <div className="bg-brand-sand/20 p-4 border-t border-brand-copper/10 text-center">
            <p className="text-xs text-brand-dark/50">SoulWealth Studio &copy; {new Date().getFullYear()}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
