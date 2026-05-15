"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, FileText, Upload, Image as ImageIcon, Loader2, X, Pencil, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  author: string;
  date: string;
  created_at: string;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Inspiration");
  const [author, setAuthor] = useState("Mukund Sharma");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('blogs')
      .select('*')
      .order('date', { ascending: false });
    
    setLoading(false);
    if (fetchError) {
      setError(`Failed to load blogs: ${fetchError.message}`);
      return;
    }
    setBlogs(data || []);
  }

  // Auto-generate slug from title
  useEffect(() => {
    if (!editingId && title) {
      setSlug(title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  }, [title, editingId]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop();
      const path = `blogs/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      
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
    if (!title.trim() || !slug.trim()) return;

    setIsSubmitting(true);
    setError(null);
    
    const blogData = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category,
      author,
      image_url: imageUrl,
      date: new Date().toISOString(),
    };

    let result;
    if (editingId) {
      result = await supabase.from('blogs').update(blogData).eq('id', editingId);
    } else {
      result = await supabase.from('blogs').insert([blogData]);
    }

    setIsSubmitting(false);
    if (!result.error) {
      resetForm();
      setOpen(false);
      loadBlogs();
    } else {
      setError(`Failed to save: ${result.error.message}`);
    }
  }

  function resetForm() {
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCategory("Inspiration");
    setAuthor("Mukund Sharma");
    setImageUrl("");
    setEditingId(null);
  }

  function handleEdit(b: Blog) {
    setTitle(b.title);
    setSlug(b.slug);
    setExcerpt(b.excerpt || "");
    setContent(b.content || "");
    setCategory(b.category || "Inspiration");
    setAuthor(b.author || "Mukund Sharma");
    setImageUrl(b.image_url || "");
    setEditingId(b.id);
    setOpen(true);
  }

  async function onDelete(id: string) {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    
    const { error: deleteError } = await supabase.from('blogs').delete().eq('id', id);
    if (deleteError) {
      alert(`Failed to delete: ${deleteError.message}`);
    } else {
      loadBlogs();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-medium text-brand-dark tracking-tight">Event Journal CMS</h1>
          <p className="text-sm text-brand-dark/60 mt-1">Create and manage your luxury event articles.</p>
        </div>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gold text-white hover:bg-brand-gold/90 h-11 px-6 text-base font-medium shadow-warm-lg transition-all hover:scale-105 active:scale-95 border-none">
              <Plus className="mr-2 h-5 w-5" /> New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Article" : "Write New Article"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Article Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 10 Trends for 2025"
                    className="border-brand-copper/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e-g-trends-2025"
                    className="border-brand-copper/20 bg-brand-sand/5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-brand-copper/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  >
                    <option>Inspiration</option>
                    <option>Weddings</option>
                    <option>Corporate</option>
                    <option>Sustainability</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="border-brand-copper/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Short Excerpt (Teaser)</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A brief summary for the grid view..."
                  className="min-h-[80px] border-brand-copper/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Full Article Content (HTML allowed)</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<p>Start writing your story...</p>"
                  className="min-h-[200px] font-mono text-sm border-brand-copper/20"
                />
              </div>

              <div className="space-y-2">
                <Label>Feature Image</Label>
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <div className="h-24 w-32 rounded-lg border-2 border-dashed border-brand-copper/20 overflow-hidden bg-brand-sand/10 flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-brand-dark/20" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      id="blog-image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-brand-copper/20"
                      onClick={() => document.getElementById("blog-image-upload")?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload className="mr-2 h-4 w-4" /> {imageUrl ? "Change Image" : "Upload Feature Image"}</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-destructive bg-destructive/5 p-2 rounded border border-destructive/10">{error}</p>}
              
              <Button type="submit" disabled={isSubmitting} className="w-full bg-brand-gold text-white hover:bg-brand-gold/90 h-12 text-lg font-semibold shadow-md">
                {isSubmitting ? "Publishing..." : (editingId ? "Update Article" : "Publish Article")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && blogs.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-brand-gold" />
        </div>
      ) : blogs.length === 0 ? (
        <Card className="border-dashed border-brand-copper/30 bg-brand-sand/10 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-brand-copper/30 mb-4" />
            <p className="text-lg font-serif text-brand-dark">The Journal is Empty</p>
            <p className="mt-2 text-sm text-brand-dark/60">Start by sharing your first event story.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {blogs.map((blog) => (
            <Card key={blog.id} className="group border-brand-copper/20 bg-white overflow-hidden hover:shadow-lg transition-all">
              <div className="flex h-full">
                <div className="relative w-1/3 shrink-0">
                  <img 
                    src={blog.image_url || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80"} 
                    alt={blog.title} 
                    className="h-full w-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="flex-1 p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-gold bg-brand-gold/5 px-2 py-0.5 rounded">
                      {blog.category}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-brand-dark/60 hover:text-brand-dark"
                        onClick={() => handleEdit(blog)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive/60 hover:text-destructive"
                        onClick={() => onDelete(blog.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-lg font-serif text-brand-dark leading-tight mb-2 line-clamp-1">{blog.title}</h3>
                  <p className="text-xs text-brand-dark/60 mb-4 line-clamp-2 italic">"{blog.excerpt}"</p>
                  <div className="mt-auto flex items-center justify-between">
                    <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest">{new Date(blog.date).toLocaleDateString()}</p>
                    <a 
                      href={`https://hevaniya.vercel.app/blog/${blog.slug}`} 
                      target="_blank" 
                      className="text-[10px] font-bold text-brand-gold flex items-center gap-1 hover:underline"
                    >
                      View Live <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
