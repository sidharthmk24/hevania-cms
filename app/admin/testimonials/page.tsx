"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Testimonial = {
  id: string;
  name: string;
  comment: string;
  rating: number;
  created_at: string;
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function loadTestimonials() {
    setLoading(true);
    const res = await fetch("/api/testimonials", { cache: "no-store" });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(`Failed to load testimonials: ${json.error}`);
      return;
    }
    if (json.data) {
      setTestimonials(json.data);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    setError(null);
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), comment: comment.trim(), rating }),
    });

    setIsSubmitting(false);
    if (res.ok) {
      setName("");
      setComment("");
      setRating(5);
      setOpen(false);
      loadTestimonials();
    } else {
      const json = await res.json();
      setError(`Failed to create: ${json.error}`);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    
    // Optimistic UI updates
    setTestimonials(testimonials.filter((t) => t.id !== id));
    
    const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Failed to delete testimonial.");
      loadTestimonials();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-medium text-brand-dark tracking-tight">Testimonials Dashboard</h1>
          <p className="text-sm text-brand-dark/60 mt-1">Manage what your clients say about you.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gold text-white hover:bg-brand-gold/90 h-11 px-6 text-base font-medium shadow-warm-lg transition-all hover:scale-105 active:scale-95 border-none">
              <Plus className="mr-2 h-5 w-5" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="border-brand-copper/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Rating (1-5)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star className={`h-6 w-6 ${rating >= num ? "fill-brand-gold text-brand-gold" : "text-brand-dark/20"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Testimonial Detail Focus</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="The client's comment..."
                  className="min-h-[100px] border-brand-copper/20"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive bg-destructive/5 p-2 rounded border border-destructive/10">{error}</p>}
              <Button type="submit" disabled={isSubmitting} className="w-full bg-brand-gold text-white hover:bg-brand-gold/90 h-12 text-lg font-semibold shadow-md transition-all hover:translate-y-[-1px] active:translate-y-[0px]">
                {isSubmitting ? "Creating..." : "Create Testimonial"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && testimonials.length === 0 ? (
        <p className="text-sm text-brand-dark/60">Loading testimonials...</p>
      ) : testimonials.length === 0 ? (
        <Card className="border-dashed border-brand-copper/30 bg-brand-sand/10 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-brand-sand p-3 text-brand-copper">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-lg font-serif text-brand-dark">No Testimonials</p>
            <p className="mt-2 text-sm text-brand-dark/60">Upload your first feedback via the Add button above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.id} className="relative border-brand-copper/20 bg-white shadow-warm-sm overflow-hidden flex flex-col group transition-all hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-copper opacity-80" />
              <CardHeader className="pl-6 pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-serif text-brand-dark">{t.name}</CardTitle>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < t.rating ? "fill-brand-gold text-brand-gold" : "text-brand-dark/20"}`} />
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(t.id)}
                    title="Delete Testimonial"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pl-6 flex-1">
                <p className="text-sm text-brand-dark/70 italic line-clamp-4">"{t.comment}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
