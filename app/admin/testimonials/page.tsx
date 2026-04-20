"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, MessageSquare, Star, Upload, Image as ImageIcon, Loader2, X, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase";
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
  image_url?: string;
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
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const supabase = createClient();

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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop();
      const path = `testimonials/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(path);

      setImageUrl(publicUrl);
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    setError(null);
    
    const url = editingId ? `/api/testimonials/${editingId}` : "/api/testimonials";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: name.trim(), 
        comment: comment.trim(), 
        rating,
        image_url: imageUrl 
      }),
    });

    setIsSubmitting(false);
    if (res.ok) {
      resetForm();
      setOpen(false);
      loadTestimonials();
    } else {
      const json = await res.json();
      setError(`Failed to ${editingId ? "update" : "create"}: ${json.error}`);
    }
  }

  function resetForm() {
    setName("");
    setComment("");
    setRating(5);
    setImageUrl("");
    setEditingId(null);
  }

  function handleEdit(t: Testimonial) {
    setName(t.name);
    setComment(t.comment);
    setRating(t.rating);
    setImageUrl(t.image_url || "");
    setEditingId(t.id);
    setOpen(true);
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
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gold text-white hover:bg-brand-gold/90 h-11 px-6 text-base font-medium shadow-warm-lg transition-all hover:scale-105 active:scale-95 border-none">
              <Plus className="mr-2 h-5 w-5" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
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

              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="h-16 w-16 rounded-full border-2 border-dashed border-brand-copper/20 overflow-hidden bg-brand-sand/10 flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-brand-dark/20" />
                      )}
                    </div>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      id="photo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-brand-copper/20"
                      onClick={() => document.getElementById("photo-upload")?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload className="mr-2 h-4 w-4" /> {imageUrl ? "Change Photo" : "Upload Photo"}</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-destructive bg-destructive/5 p-2 rounded border border-destructive/10">{error}</p>}
              <Button type="submit" disabled={isSubmitting} className="w-full bg-brand-gold text-white hover:bg-brand-gold/90 h-12 text-lg font-semibold shadow-md transition-all hover:translate-y-[-1px] active:translate-y-[0px]">
                {isSubmitting ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update Testimonial" : "Create Testimonial")}
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
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-brand-sand/30 shrink-0 border border-brand-copper/10">
                      {t.image_url ? (
                        <img src={t.image_url} alt={t.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-brand-copper/40 font-bold bg-brand-sand/10">
                          {t.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base font-serif text-brand-dark">{t.name}</CardTitle>
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < t.rating ? "fill-brand-gold text-brand-gold" : "text-brand-dark/20"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-brand-dark/60 hover:text-brand-dark hover:bg-brand-dark/10"
                      onClick={() => handleEdit(t)}
                      title="Edit Testimonial"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
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
