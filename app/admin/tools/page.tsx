"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Wrench, Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, Upload, ImageIcon, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase";

const BUCKET = "tool-images";
const PDF_BUCKET = "tool-pdfs";

type Tool = {
  id: string;
  title: string;
  description: string;
  price_inr: number | null;
  price_usd: string | null;
  is_free: boolean;
  button_text: string;
  image_url: string | null;
  bg_color: string;
  text_color: string;
  is_bundle: boolean;
  pdf_key: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

const emptyForm = {
  title: "",
  description: "",
  price_inr: "",
  price_usd: "",
  is_free: false,
  image_url: "",
  is_bundle: false,
  pdf_key: "",
  display_order: "0",
  is_active: true,
};

export default function ToolsAdminPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  async function loadTools() {
    try {
      const res = await fetch("/api/tools");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load tools");
      setTools(json.data || []);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTools();
  }, []);

  function flash(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  function startAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    setPdfFile(null);
    setShowForm(true);
  }

  function startEdit(tool: Tool) {
    setForm({
      title: tool.title,
      description: tool.description || "",
      price_inr: tool.price_inr !== null ? String(tool.price_inr) : "",
      price_usd: tool.price_usd || "",
      is_free: tool.is_free,
      image_url: tool.image_url || "",
      is_bundle: tool.is_bundle,
      pdf_key: tool.pdf_key || "",
      display_order: String(tool.display_order),
      is_active: tool.is_active,
    });
    setEditingId(tool.id);
    setImageFile(null);
    setPdfFile(null);
    // Show existing image as preview
    setImagePreview(tool.image_url || null);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setPdfFile(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    // Clear the stored URL so we know a new file needs to be uploaded
    setForm(f => ({ ...f, image_url: "" }));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    setForm(f => ({ ...f, image_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", BUCKET);

    const res = await fetch("/api/tools/upload", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Image upload failed");

    return json.url;
  }

  function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    // Clear the stored key so we know a new file needs to be uploaded
    setForm(f => ({ ...f, pdf_key: "" }));
  }

  function clearPdf() {
    setPdfFile(null);
    setForm(f => ({ ...f, pdf_key: "" }));
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  }

  async function uploadPdfFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", PDF_BUCKET);

    const res = await fetch("/api/tools/upload-pdf", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "PDF upload failed");

    return json.url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);

    let finalImageUrl = form.image_url || null;
    let finalPdfKey = form.pdf_key || null;

    // Upload new image if one was selected
    if (imageFile) {
      try {
        setUploading(true);
        finalImageUrl = await uploadImage(imageFile);
      } catch (err: unknown) {
        setError((err as Error).message);
        setSaving(false);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Upload new PDF if one was selected
    if (pdfFile) {
      try {
        setUploadingPdf(true);
        finalPdfKey = await uploadPdfFile(pdfFile);
      } catch (err: unknown) {
        setError((err as Error).message);
        setSaving(false);
        setUploadingPdf(false);
        return;
      } finally {
        setUploadingPdf(false);
      }
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price_inr: form.price_inr !== "" ? Number(form.price_inr) : null,
      price_usd: form.price_usd.trim() || null,
      is_free: form.is_free,
      button_text: form.is_free ? "Download Free" : "Download",
      image_url: finalImageUrl,
      bg_color: form.is_free ? "bg-[#E2AA5F]" : "bg-white",
      text_color: form.is_free ? "text-white" : "text-[#1A1A1A]",
      is_bundle: form.is_bundle,
      pdf_key: finalPdfKey,
      display_order: Number(form.display_order) || 0,
      is_active: form.is_active,
    };

    try {
      let res: Response;
      if (editingId) {
        res = await fetch(`/api/tools/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/tools", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save tool");
      flash(editingId ? "Tool updated." : "Tool created.");
      cancelForm();
      await loadTools();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(tool: Tool) {
    try {
      const res = await fetch(`/api/tools/${tool.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !tool.is_active }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      flash(`Tool ${!tool.is_active ? "activated" : "deactivated"}.`);
      await loadTools();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }

  async function deleteTool(tool: Tool) {
    if (!confirm(`Delete "${tool.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/tools/${tool.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      flash("Tool deleted.");
      await loadTools();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault(); 
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLTableRowElement>, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newTools = [...tools];
    const draggedItem = newTools[draggedIndex];
    newTools.splice(draggedIndex, 1);
    newTools.splice(dropIndex, 0, draggedItem);
    
    const updatedTools = newTools.map((tool, index) => ({
      ...tool,
      display_order: index + 1
    }));

    setTools(updatedTools);
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    setIsUpdatingOrder(true);
    try {
      const payload = updatedTools.map(t => ({ id: t.id, display_order: t.display_order }));
      const res = await fetch("/api/tools/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update order");
      
      flash("Tool order updated.");
    } catch (err: unknown) {
      setError((err as Error).message);
      await loadTools();
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const isSavingOrUploading = saving || uploading || uploadingPdf;

  return (
    <div className="space-y-6 pb-12 w-full animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b border-brand-copper/10 pb-6 rounded-t-xl bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm px-6">
        <div>
          <h1 className="text-3xl font-serif text-brand-dark tracking-tight">Tools Manager</h1>
          <p className="text-brand-dark/60 mt-1">Add, edit, or deactivate money tools shown on the store.</p>
        </div>
        {!showForm && (
          <Button onClick={startAdd} className="bg-brand-copper hover:bg-brand-copper/90 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Tool
          </Button>
        )}
      </div>

      {/* Feedback */}
      {successMessage && (
        <div className="mx-6 px-4 py-3 rounded-lg bg-brand-green/10 border border-brand-green/20 text-brand-green text-sm font-medium flex items-center gap-2">
          <Check className="w-4 h-4" /> {successMessage}
        </div>
      )}
      {error && (
        <div className="mx-6 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
          <X className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="px-6">
          <Card className="border-brand-copper/20 shadow-warm-lg bg-white">
            <div className="h-1.5 w-full bg-gradient-to-r from-brand-copper via-brand-gold to-brand-olive" />
            <CardHeader className="bg-brand-sand/10 border-b border-brand-copper/10 pb-4">
              <div className="flex items-center gap-2 text-brand-dark">
                <Wrench className="w-5 h-5 text-brand-copper" />
                <CardTitle className="text-lg font-serif">
                  {editingId ? "Edit Tool" : "Add New Tool"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Title */}
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-brand-copper mb-1.5 block">
                    Title *
                  </Label>
                  <Input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Monthly Money Planner"
                    required
                    className="border-brand-copper/20"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-brand-copper mb-1.5 block">
                    Description
                  </Label>
                  <Input
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description shown on the card"
                    className="border-brand-copper/20"
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-brand-copper mb-1.5 block">
                    Tool Image
                  </Label>
                  <div className="flex gap-4 items-start">
                    {/* Preview */}
                    <div
                      className="w-32 h-24 rounded-lg border-2 border-dashed border-brand-copper/30 bg-brand-sand/20 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-brand-copper/60 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={128}
                          height={96}
                          className="w-full h-full object-cover rounded-lg"
                          unoptimized
                        />
                      ) : (
                        <div className="text-center text-brand-copper/40">
                          <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-[10px]">Click to upload</span>
                        </div>
                      )}
                    </div>

                    {/* Upload controls */}
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-brand-copper/20 text-brand-dark/70 hover:bg-brand-sand/40 w-fit"
                      >
                        <Upload className="w-3.5 h-3.5 mr-2" />
                        {imagePreview ? "Change Image" : "Upload Image"}
                      </Button>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={clearImage}
                          className="text-xs text-destructive/70 hover:text-destructive text-left transition-colors"
                        >
                          Remove image
                        </button>
                      )}
                      <p className="text-[11px] text-brand-dark/40">PNG, JPG, WEBP — max 5 MB</p>
                      {imageFile && (
                        <p className="text-[11px] text-brand-olive font-medium">{imageFile.name}</p>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {/* Price INR */}
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-widest text-brand-copper mb-1.5 block">
                    Price (INR)
                  </Label>
                  <Input
                    type="number"
                    value={form.price_inr}
                    onChange={e => setForm({ ...form, price_inr: e.target.value })}
                    placeholder="e.g. 49 (leave blank if free)"
                    className="border-brand-copper/20"
                  />
                </div>

                {/* Price USD */}
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-widest text-brand-copper mb-1.5 block">
                    Price Display (USD)
                  </Label>
                  <Input
                    value={form.price_usd}
                    onChange={e => setForm({ ...form, price_usd: e.target.value })}
                    placeholder="e.g. $1.99"
                    className="border-brand-copper/20"
                  />
                </div>



                {/* PDF File Upload */}
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-brand-copper mb-1.5 block">
                    PDF Document
                  </Label>
                  <div className="flex flex-col gap-2 p-4 border border-brand-copper/20 rounded-lg bg-brand-sand/10">
                    {/* Upload controls */}
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => pdfInputRef.current?.click()}
                        className="border-brand-copper/30 text-brand-dark/80 hover:bg-brand-sand/40"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {form.pdf_key || pdfFile ? "Change PDF" : "Upload PDF"}
                      </Button>

                      {pdfFile ? (
                        <div className="flex-1 flex items-center justify-between text-sm bg-white px-3 py-1.5 rounded border border-brand-copper/10">
                          <span className="text-brand-olive font-medium truncate max-w-[200px]">{pdfFile.name}</span>
                          <button type="button" onClick={clearPdf} className="text-destructive hover:underline text-xs">Remove</button>
                        </div>
                      ) : form.pdf_key ? (
                        <div className="flex-1 flex flex-col pt-1">
                          <span className="text-sm font-mono text-brand-dark/70 text-xs truncate max-w-full block">URL: {form.pdf_key}</span>
                          <button type="button" onClick={() => setForm(f => ({ ...f, pdf_key: "" }))} className="text-destructive hover:underline text-xs text-left w-max">Remove stored PDF</button>
                        </div>
                      ) : (
                        <p className="text-xs text-brand-dark/50 flex-1">PDF max 50 MB. Will be uploaded securely to Supabase.</p>
                      )}
                    </div>

                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handlePdfChange}
                    />
                  </div>
                </div>

                {/* Display Order */}
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-widest text-brand-copper mb-1.5 block">
                    Display Order
                  </Label>
                  <Input
                    type="number"
                    value={form.display_order}
                    onChange={e => setForm({ ...form, display_order: e.target.value })}
                    placeholder="0"
                    className="border-brand-copper/20"
                  />
                </div>



                {/* Toggles */}
                <div className="md:col-span-2 flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.is_free}
                      onChange={e => setForm({ ...form, is_free: e.target.checked })}
                      className="accent-brand-olive w-4 h-4"
                    />
                    <span className="text-sm font-medium text-brand-dark">Free tool</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.is_bundle}
                      onChange={e => setForm({ ...form, is_bundle: e.target.checked })}
                      className="accent-brand-olive w-4 h-4"
                    />
                    <span className="text-sm font-medium text-brand-dark">Bundle</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={e => setForm({ ...form, is_active: e.target.checked })}
                      className="accent-brand-olive w-4 h-4"
                    />
                    <span className="text-sm font-medium text-brand-dark">Active (visible on store)</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isSavingOrUploading}
                    className="bg-brand-copper hover:bg-brand-copper/90 text-white"
                  >
                    {uploading || uploadingPdf ? "Uploading files…" : saving ? "Saving…" : editingId ? "Update Tool" : "Create Tool"}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelForm} className="border-brand-copper/20">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tools Table */}
      <div className="px-6">
        <Card className="border-brand-copper/20 shadow-warm-lg bg-white overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-copper via-brand-gold to-brand-olive" />
          <CardHeader className="bg-brand-sand/10 border-b border-brand-copper/10 pb-4">
            <div className="flex items-center gap-2 text-brand-dark">
              <Wrench className="w-5 h-5 text-brand-copper" />
              <CardTitle className="text-lg font-serif">All Tools ({tools.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-brand-dark/50">Loading tools…</div>
            ) : tools.length === 0 ? (
              <div className="p-16 text-center text-brand-dark/50 flex flex-col items-center">
                <Wrench className="w-8 h-8 opacity-40 mb-3" />
                <p>No tools yet. Click "Add Tool" to create one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-[11px] uppercase tracking-widest text-brand-copper bg-brand-sand/20 border-b border-brand-copper/10">
                    <tr>
                      <th className="font-semibold w-10"></th>
                      <th className="px-6 py-4 font-semibold">Order</th>
                      <th className="px-6 py-4 font-semibold">Image</th>
                      <th className="px-6 py-4 font-semibold">Title</th>
                      <th className="px-6 py-4 font-semibold">Price</th>
                      <th className="px-6 py-4 font-semibold">PDF File</th>
                      <th className="px-6 py-4 font-semibold">Bundle</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-brand-copper/10 text-brand-dark/80 ${isUpdatingOrder ? "opacity-50 pointer-events-none" : ""}`}>
                    {tools.map((tool, index) => (
                      <tr 
                        key={tool.id} 
                        className={`hover:bg-brand-sand/10 transition-all bg-white ${draggedIndex === index ? "opacity-40 scale-[0.99] shadow-inner" : ""} ${dragOverIndex === index ? "border-t-2 border-brand-copper shadow-[0_-2px_6px_rgba(0,0,0,0.05)]" : ""}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragOver={handleDragOver}
                        onDragEnd={() => {
                          setDraggedIndex(null);
                          setDragOverIndex(null);
                        }}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <td className="px-3 py-4 text-brand-dark/30 cursor-grab hover:text-brand-copper active:cursor-grabbing text-center">
                          <GripVertical className="w-5 h-5 mx-auto" />
                        </td>
                        <td className="px-6 py-4 text-brand-dark/40 font-mono text-xs">{tool.display_order}</td>
                        <td className="px-6 py-4">
                          {tool.image_url ? (
                            <Image
                              src={tool.image_url}
                              alt={tool.title}
                              width={48}
                              height={36}
                              className="w-12 h-9 object-cover rounded-md border border-brand-copper/10"
                              unoptimized
                            />
                          ) : (
                            <div className="w-12 h-9 rounded-md bg-brand-sand/40 border border-brand-copper/10 flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-brand-copper/30" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium max-w-[180px] truncate text-brand-dark">
                          {tool.title}
                          {tool.is_free && (
                            <span className="ml-2 text-[10px] uppercase tracking-widest font-bold text-brand-olive bg-brand-olive/10 px-1.5 py-0.5 rounded">
                              Free
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {tool.is_free ? "—" : (
                            <span>
                              {tool.price_inr ? `₹${tool.price_inr}` : ""}
                              {tool.price_usd ? ` / ${tool.price_usd}` : ""}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs opacity-70 truncate max-w-[120px]" title={tool.pdf_key || ""}>
                          {tool.pdf_key ? (
                            <a href={tool.pdf_key} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View PDF</a>
                          ) : "—"}
                        </td>
                        <td className="px-6 py-4">
                          {tool.is_bundle ? (
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-copper bg-brand-copper/10 px-2 py-0.5 rounded border border-brand-copper/20">
                              Bundle
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleActive(tool)}
                            title={tool.is_active ? "Click to deactivate" : "Click to activate"}
                            className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                          >
                            {tool.is_active ? (
                              <>
                                <ToggleRight className="w-5 h-5 text-brand-green" />
                                <span className="text-brand-green">Active</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-5 h-5 text-brand-dark/30" />
                                <span className="text-brand-dark/40">Inactive</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(tool)}
                              className="p-1.5 rounded hover:bg-brand-sand/60 text-brand-dark/50 hover:text-brand-copper transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteTool(tool)}
                              className="p-1.5 rounded hover:bg-destructive/10 text-brand-dark/50 hover:text-destructive transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
