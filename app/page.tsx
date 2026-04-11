"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Play } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container min-h-screen flex items-center justify-center py-16 px-4 bg-brand-cream">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-10">
          <div className="mx-auto w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-warm-md border border-brand-green/20 overflow-hidden">
            <img src="/logo.png" alt="HEVANIYA Logo" className="w-full h-full object-contain p-2" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-normal text-brand-forest mb-4 tracking-tight">HEVANIYA</h1>
          <p className="text-lg text-brand-forest/70 font-light max-w-lg mx-auto italic">
            Content management system for HEVANIYA.
          </p>
        </div>

        <Card className="mx-auto border-brand-green/20 bg-white/80 backdrop-blur-md shadow-warm-lg overflow-hidden">
          <div className="h-2 w-full bg-brand-forest" />
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-2xl font-serif text-brand-forest tracking-wide">Welcome back</CardTitle>
            <CardDescription className="text-base text-brand-forest/60 uppercase text-[10px] tracking-widest font-bold">Admin Console</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 p-8">
            <Link href="/admin" className="flex-1">
              <Button className="w-full h-14 text-base bg-brand-forest text-white hover:bg-brand-dark shadow-warm-md group transition-all rounded-none uppercase tracking-widest text-[12px] font-bold">
                <Settings className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
                Open Dashboard
              </Button>
            </Link>
          </CardContent>
          <div className="bg-brand-sage/10 p-4 border-t border-brand-green/10 text-center">
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-forest/40">HEVANIYA &copy; {new Date().getFullYear()}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
