"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
    Upload, Image as ImageIcon, Loader2, X, Plus, Check,
    Type, AlignLeft, Star, Layers, Leaf, ChevronDown, Trash2
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ——— Types ———
type SectionEntry = {
    id: string;
    section: string;
    key: string;
    content_json: Record<string, unknown>;
    created_at: string;
};

type GalleryItem = {
    id: string;
    title: string;
    image_url: string;
    section: string;
    created_at: string;
};

// ——— Section Config ———
const SECTION_CARDS = [
    {
        id: "hero",
        label: "Hero",
        icon: Star,
        color: "from-amber-50 to-amber-100",
        iconColor: "text-amber-600",
        borderColor: "border-amber-200",
        description: "Carousel slides with headings, subtitles & buttons",
        fields: [
            { key: "top_desc", label: "Top Description (Subtitle)", type: "text", placeholder: "Where Refined Celebrations Find Their Perfect Space" },
            { key: "heading", label: "Main Heading", type: "text", placeholder: "HEVANIYA" },
            { key: "bottom_subtitle", label: "Bottom Subtitle", type: "text", placeholder: "A breathtaking destination for premium events" },
            { key: "button_primary", label: "Primary Button Text", type: "text", placeholder: "Schedule a Tour" },
            { key: "button_secondary", label: "Secondary Button Text", type: "text", placeholder: "Submit Inquiry" },
        ],
        hasImage: true,
        imageLabel: "Slide Background Image",
        keyPrefix: "slide",
        maxEntries: 3,
        hideCount: false,
    },
    {
        id: "scroll_section",
        label: "Scroll Section",
        icon: Layers,
        color: "from-blue-50 to-blue-100",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200",
        description: "Pinned scroll items with image, heading & description",
        fields: [
            { key: "heading", label: "Heading / Label", type: "text", placeholder: "Prime Location" },
            { key: "description", label: "Description", type: "textarea", placeholder: "Conveniently located with smooth road access..." },
        ],
        hasImage: true,
        imageLabel: "Section Image",
        keyPrefix: "item",
        maxEntries: 4,
        hideCount: false,
    },
    {
        id: "carousel",
        label: "Carousel",
        icon: ImageIcon,
        color: "from-purple-50 to-purple-100",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200",
        description: "Event type cards with title, description & image",
        fields: [
            { key: "title", label: "Title", type: "text", placeholder: "Weddings" },
            { key: "description", label: "Description", type: "textarea", placeholder: "Elegant ceremony spaces and reception areas..." },
        ],
        hasImage: true,
        imageLabel: "Card Image",
        keyPrefix: "card",
        maxEntries: 6,
        hideCount: false,
    },
    {
        id: "sustainability",
        label: "Sustainability",
        icon: Leaf,
        color: "from-green-50 to-green-100",
        iconColor: "text-green-600",
        borderColor: "border-green-200",
        description: "Eco commitment cards with image & description",
        fields: [
            { key: "title", label: "Card Title", type: "text", placeholder: "Water Conservation" },
            { key: "description", label: "Description", type: "textarea", placeholder: "Implementing advanced rainwater harvesting..." },
        ],
        hasImage: true,
        imageLabel: "Card Image",
        keyPrefix: "card",
        maxEntries: 3,
        hideCount: false,
    },
    {
        id: "experience",
        label: "Experience",
        icon: Star,
        color: "from-indigo-50 to-indigo-100",
        iconColor: "text-indigo-600",
        borderColor: "border-indigo-200",
        description: "Two parallax images for the experience section",
        fields: [
            { key: "alt", label: "Alt Text", type: "text", placeholder: "Luxury Interior" },
        ],
        hasImage: true,
        imageLabel: "Section Image",
        keyPrefix: "image",
        maxEntries: 2,
        hideCount: false,
    },
    {
        id: "logoloop",
        label: "Gallery (Loop)",
        icon: ImageIcon,
        color: "from-rose-50 to-rose-100",
        iconColor: "text-rose-600",
        borderColor: "border-rose-200",
        description: "Infinite scrolling gallery images",
        fields: [],
        hasImage: true,
        imageLabel: "Gallery Image",
        keyPrefix: "image",
        maxEntries: 12,
        hideCount: true,
    },
];

// ——— Modal Component ———
function SectionModal({
    sectionConfig,
    existingEntries,
    onClose,
    onSaved,
}: {
    sectionConfig: typeof SECTION_CARDS[0];
    existingEntries: SectionEntry[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Form state
    const [fields, setFields] = useState<Record<string, string>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [editingEntry, setEditingEntry] = useState<SectionEntry | null>(null);
    const [entryIndex, setEntryIndex] = useState<number>(existingEntries.length);

    // Load entry for editing
    const loadEntry = useCallback((entry: SectionEntry | null, index: number) => {
        setEditingEntry(entry);
        setEntryIndex(index);
        setImagePreview("");
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        if (entry) {
            const loadedFields: Record<string, string> = {};
            sectionConfig.fields.forEach(f => {
                loadedFields[f.key] = String(entry.content_json[f.key] || "");
            });
            setFields(loadedFields);
            if (entry.content_json.image_url) {
                setImagePreview(String(entry.content_json.image_url));
            }
        } else {
            const emptyFields: Record<string, string> = {};
            sectionConfig.fields.forEach(f => { emptyFields[f.key] = ""; });
            setFields(emptyFields);
        }
        setSuccessMsg("");
        setErrorMsg("");
    }, [sectionConfig]);

    // Init
    useEffect(() => {
        if (existingEntries.length > 0) {
            loadEntry(existingEntries[0], 0);
        } else {
            loadEntry(null, 0);
        }
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        setImageFile(f);
        if (f) setImagePreview(URL.createObjectURL(f));
    };

    async function uploadImage(): Promise<string | null> {
        if (!imageFile) return editingEntry?.content_json.image_url as string || null;
        setUploadingImage(true);
        try {
            const ext = imageFile.name.split(".").pop();
            const path = `${sectionConfig.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: uploadErr } = await supabase.storage.from("gallery").upload(path, imageFile);
            if (uploadErr) throw uploadErr;
            const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(path);
            return publicUrl;
        } finally {
            setUploadingImage(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            let imageUrl: string | null = null;
            if (sectionConfig.hasImage) {
                imageUrl = await uploadImage();
            }

            const contentJson: Record<string, unknown> = { ...fields };
            if (imageUrl) contentJson.image_url = imageUrl;

            const key = `${sectionConfig.keyPrefix}_${entryIndex + 1}`;

            const res = await fetch("/api/section-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    section: sectionConfig.id,
                    key,
                    content_json: contentJson,
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Save failed");

            setSuccessMsg("Saved successfully!");
            onSaved();
        } catch (err: unknown) {
            setErrorMsg((err as Error).message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(entry: SectionEntry) {
        if (!confirm(`Delete this entry?`)) return;
        try {
            const res = await fetch(`/api/section-content?id=${entry.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            onSaved();
            // If we deleted the currently edited one, reset
            if (editingEntry?.id === entry.id) {
                loadEntry(null, existingEntries.length - 1);
            }
        } catch (err: unknown) {
            setErrorMsg((err as Error).message);
        }
    }

    const Icon = sectionConfig.icon;
    const canAddMore = existingEntries.length < sectionConfig.maxEntries;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4  backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] outline-none border-0"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`bg-gradient-to-r ${sectionConfig.color} border-b ${sectionConfig.borderColor} px-6 py-5 flex items-center justify-between shrink-0 rounded-t-2xl`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 bg-white/70 rounded-xl ${sectionConfig.iconColor}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">{sectionConfig.label} Section</h2>
                            <p className="text-xs text-gray-500">{sectionConfig.description}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden bg-white rounded-b-2xl">
                    {/* Left: Entry List */}
                    <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
                        <div className="px-3 py-3 border-b border-gray-200">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                {sectionConfig.hideCount ? "Entries" : `Entries (${existingEntries.length}/${sectionConfig.maxEntries})`}
                            </p>
                        </div>
                        <div className="flex-1 overflow-y-auto py-2">
                            {existingEntries.map((entry, i) => (
                                <div
                                    key={entry.id}
                                    className={`group flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer transition-all ${editingEntry?.id === entry.id ? "bg-white shadow-sm" : "hover:bg-white/70"}`}
                                    onClick={() => loadEntry(entry, i)}
                                >
                                    <span className="text-xs font-medium text-gray-700 truncate">
                                        {String(entry.content_json.heading || entry.content_json.title || entry.content_json.top_desc || `Entry ${i + 1}`).slice(0, 20)}
                                    </span>
                                    <button
                                        className="opacity-0 group-hover:opacity-100 p-0.5 text-red-400 hover:text-red-600 transition-all"
                                        onClick={e => { e.stopPropagation(); handleDelete(entry); }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {canAddMore && (
                            <div className="p-2 border-t border-gray-200">
                                <button
                                    onClick={() => loadEntry(null, existingEntries.length)}
                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg text-xs text-gray-500 hover:text-gray-700 transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add New
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Form */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {editingEntry === null && existingEntries.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <Plus className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No entries yet. Fill in the form below to add your first one.</p>
                            </div>
                        ) : null}

                        <div className="space-y-5">
                            {/* Entry Index Indicator */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    {editingEntry ? `Editing Entry ${entryIndex + 1}` : `New Entry ${entryIndex + 1}`}
                                </span>
                            </div>

                            {/* Text Fields */}
                            {sectionConfig.fields.map(field => (
                                <div key={field.key} className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                                        {field.type === "textarea" ? <AlignLeft className="w-3 h-3" /> : <Type className="w-3 h-3" />}
                                        {field.label}
                                    </Label>
                                    {field.type === "textarea" ? (
                                        <textarea
                                            value={fields[field.key] || ""}
                                            onChange={e => setFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            placeholder={field.placeholder}
                                            rows={3}
                                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 resize-none bg-gray-50 focus:bg-white transition-all"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={fields[field.key] || ""}
                                            onChange={e => setFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            placeholder={field.placeholder}
                                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 bg-gray-50 focus:bg-white transition-all"
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Image Upload */}
                            {sectionConfig.hasImage && (
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                                        <ImageIcon className="w-3 h-3" /> {sectionConfig.imageLabel}
                                    </Label>
                                    <div
                                        className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-brand-green/50 transition-colors group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <div className="relative h-40 bg-gray-100">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Upload className="w-6 h-6 text-white" />
                                                    <span className="text-white text-xs ml-2">Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-gray-400 group-hover:text-gray-500 transition-colors">
                                                <Upload className="w-8 h-8 mb-2 opacity-50" />
                                                <p className="text-sm font-medium">Click to upload image</p>
                                                <p className="text-xs mt-1 opacity-60">PNG, JPG, WEBP up to 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                    {uploadingImage && (
                                        <div className="flex items-center gap-2 text-xs text-brand-forest">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Uploading image...
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Status Messages */}
                            {successMsg && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                                    <Check className="w-4 h-4 shrink-0" /> {successMsg}
                                </div>
                            )}
                            {errorMsg && (
                                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    {errorMsg}
                                </div>
                            )}

                            {/* Save Button */}
                            <Button
                                onClick={handleSave}
                                disabled={saving || uploadingImage}
                                className="w-full bg-brand-forest hover:bg-brand-dark text-white h-11 rounded-xl uppercase text-[11px] tracking-widest font-bold shadow-sm hover:shadow-md transition-all"
                            >
                                {saving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                                ) : (
                                    <><Check className="w-4 h-4 mr-2" /> {editingEntry ? "Update Entry" : "Save Entry"}</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ——— Main Gallery Page ———
export default function GalleryPage() {
    const [entries, setEntries] = useState<Record<string, SectionEntry[]>>({});
    const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);

    const supabase = createClient();

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch section content entries
            const res = await fetch("/api/section-content");
            const json = await res.json();
            const allEntries: SectionEntry[] = json.data || [];

            const grouped: Record<string, SectionEntry[]> = {};
            SECTION_CARDS.forEach(s => { grouped[s.id] = []; });
            allEntries.forEach(e => {
                if (grouped[e.section]) grouped[e.section].push(e);
            });
            setEntries(grouped);

            // Also fetch raw gallery images for display
            const { data: imgs } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
            setGalleryImages(imgs || []);
        } catch (err) {
            console.error("Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const activeSectionConfig = SECTION_CARDS.find(s => s.id === activeModal);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-brand-green/10 pb-6">
                <h1 className="text-3xl font-serif text-brand-forest tracking-tight underline decoration-brand-gold/30 underline-offset-8">
                    Media Gallery
                </h1>
                <p className="text-brand-forest/60 mt-2 italic font-light">
                    Manage content & images for each section of the website.
                </p>
            </div>

            {/* Section Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {SECTION_CARDS.map(section => {
                    const Icon = section.icon;
                    const sectionEntries = entries[section.id] || [];
                    const hasContent = sectionEntries.length > 0;

                    return (
                        <div
                            key={section.id}
                            className={`group relative bg-gradient-to-br ${section.color} border ${section.borderColor} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer`}
                            onClick={() => setActiveModal(section.id)}
                        >
                            {/* Card content */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 bg-white/70 rounded-xl ${section.iconColor} shadow-sm`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasContent && !section.hideCount && (
                                            <span className="px-2 py-0.5 bg-white/80 border border-white/60 rounded-full text-[10px] font-bold text-gray-600 shadow-sm">
                                                {sectionEntries.length}/{section.maxEntries}
                                            </span>
                                        )}
                                        <div className={`w-2 h-2 rounded-full ${hasContent ? "bg-green-500" : "bg-gray-300"}`} />
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-800 mb-1">{section.label}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{section.description}</p>

                                {/* Preview of entries */}
                                {hasContent && (
                                    <div className="mt-4 space-y-1.5">
                                        {sectionEntries.slice(0, 2).map((entry, i) => (
                                            <div key={entry.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-white/60 rounded-lg">
                                                {!!entry.content_json.image_url && (
                                                    <img
                                                        src={String(entry.content_json.image_url)}
                                                        alt=""
                                                        className="w-6 h-6 rounded object-cover shrink-0"
                                                    />


                                                )}
                                                <span className="text-xs text-gray-600 truncate">
                                                    {String(
                                                        entry.content_json.heading ||
                                                        entry.content_json.title ||
                                                        entry.content_json.top_desc ||
                                                        `Entry ${i + 1}`
                                                    ).slice(0, 30)}
                                                </span>
                                            </div>
                                        ))}
                                        {sectionEntries.length > 2 && (
                                            <p className="text-[10px] text-gray-400 pl-2">+{sectionEntries.length - 2} more entries</p>
                                        )}
                                    </div>
                                )}

                                {!hasContent && (
                                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 italic">
                                        <Plus className="w-3.5 h-3.5" /> Click to add content
                                    </div>
                                )}
                            </div>

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none rounded-2xl" />
                            <div className="absolute bottom-0 inset-x-0 h-0 group-hover:h-[3px] bg-brand-forest/30 transition-all duration-300 rounded-b-2xl" />
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {activeModal && activeSectionConfig && (
                <SectionModal
                    sectionConfig={activeSectionConfig}
                    existingEntries={entries[activeModal] || []}
                    onClose={() => setActiveModal(null)}
                    onSaved={() => {
                        fetchAll();
                        setActiveModal(null);
                    }}
                />
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-forest/40" />
                </div>
            )}
        </div>
    );
}
