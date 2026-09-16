"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
    Upload, Image as ImageIcon, Loader2, X, Plus, Check,
    Type, AlignLeft, Star, Layers, Leaf, Trash2,
    Home as HomeIcon, Info, PhoneCall, Award, Calendar,
    Heart, Target, Users, MapPin, ExternalLink, Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ——— Types ———
export type SectionField = {
    key: string;
    label: string;
    type: "text" | "textarea" | "select";
    placeholder?: string;
    options?: string[];
};

export type SectionConfig = {
    id: string;
    page: "home" | "about" | "contact";
    label: string;
    icon: any;
    color: string;
    iconColor: string;
    borderColor: string;
    description: string;
    fields: SectionField[];
    hasImage: boolean;
    imageLabel?: string;
    keyPrefix: string;
    maxEntries: number;
    hideCount?: boolean;
};

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

// ——— Section Configs by Page ———
export const SECTION_CARDS: SectionConfig[] = [
    // ═══════════════ HOME PAGE ═══════════════
    {
        id: "hero",
        page: "home",
        label: "Hero Carousel",
        icon: Star,
        color: "from-amber-50 to-amber-100",
        iconColor: "text-amber-600",
        borderColor: "border-amber-200",
        description: "Homepage full-screen hero slides with headings, subtitles & buttons",
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
        id: "experience",
        page: "home",
        label: "Experience Showcase",
        icon: Sparkles,
        color: "from-emerald-50 to-emerald-100",
        iconColor: "text-emerald-700",
        borderColor: "border-emerald-200",
        description: "Main narrative story section with dual imagery and description",
        fields: [
            { key: "subheading", label: "Experience Subheading", type: "text", placeholder: "Where Exceptional Experiences Take Shape..." },
            { key: "description", label: "Full Narrative Description", type: "textarea", placeholder: "Hevaniya is crafted for those who value elegance..." },
        ],
        hasImage: true,
        imageLabel: "Primary Experience Image",
        keyPrefix: "content",
        maxEntries: 1,
        hideCount: true,
    },
    {
        id: "scroll_section",
        page: "home",
        label: "Scroll Section",
        icon: Layers,
        color: "from-blue-50 to-blue-100",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200",
        description: "Pinned scroll items highlighting location, spaces, and features",
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
        page: "home",
        label: "Events Carousel",
        icon: ImageIcon,
        color: "from-purple-50 to-purple-100",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200",
        description: "Event type showcase cards (Weddings, Corporate, Private Parties)",
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
        page: "home",
        label: "Sustainability",
        icon: Leaf,
        color: "from-green-50 to-green-100",
        iconColor: "text-green-600",
        borderColor: "border-green-200",
        description: "Eco-commitment initiatives with imagery and details",
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
        id: "logoloop",
        page: "home",
        label: "Gallery Marquee",
        icon: ImageIcon,
        color: "from-rose-50 to-rose-100",
        iconColor: "text-rose-600",
        borderColor: "border-rose-200",
        description: "Smooth infinite-loop gallery images on the homepage",
        fields: [],
        hasImage: true,
        imageLabel: "Marquee Image",
        keyPrefix: "image",
        maxEntries: 12,
        hideCount: true,
    },

    // ═══════════════ ABOUT PAGE ═══════════════
    {
        id: "about_hero",
        page: "about",
        label: "About Hero Banner",
        icon: Star,
        color: "from-amber-50 to-amber-100",
        iconColor: "text-amber-700",
        borderColor: "border-amber-200",
        description: "Top introductory banner with story title, legacy header & backdrop",
        fields: [
            { key: "subtitle", label: "Eyebrow Subtitle", type: "text", placeholder: "The Hevaniya Story" },
            { key: "heading", label: "Main Headline", type: "text", placeholder: "Our Legacy" },
            { key: "description", label: "Intro Description", type: "textarea", placeholder: "Crafting extraordinary experiences in nature's most majestic settings for over two decades." },
            { key: "side_text", label: "Side Decorative Text", type: "text", placeholder: "Excellence In Every Detail • Since 1999" },
        ],
        hasImage: true,
        imageLabel: "Hero Background Image",
        keyPrefix: "content",
        maxEntries: 1,
        hideCount: true,
    },
    {
        id: "about_philosophy",
        page: "about",
        label: "Philosophy & Heritage",
        icon: Leaf,
        color: "from-emerald-50 to-emerald-100",
        iconColor: "text-emerald-700",
        borderColor: "border-emerald-200",
        description: "Brand vision, floating quote card, paragraphs & key pillars",
        fields: [
            { key: "tag", label: "Section Tag", type: "text", placeholder: "Our Philosophy" },
            { key: "heading", label: "Main Title", type: "text", placeholder: "Nature Meets Artistry" },
            { key: "quote", label: "Highlight Quote", type: "textarea", placeholder: "We don't just find locations; we discover the soul of a celebration." },
            { key: "mantra", label: "Quote Label", type: "text", placeholder: "Our Mantra" },
            { key: "paragraph_1", label: "Lead Paragraph", type: "textarea", placeholder: "At HEVANIYA, we believe that a venue is more than just a location..." },
            { key: "paragraph_2", label: "Secondary Paragraph", type: "textarea", placeholder: "Founded with a vision to redefine luxury celebrations..." },
            { key: "feature_1_title", label: "Pillar 1 Title", type: "text", placeholder: "Artistic Vision" },
            { key: "feature_1_desc", label: "Pillar 1 Description", type: "textarea", placeholder: "Every detail is curated to create a visually stunning experience." },
            { key: "feature_2_title", label: "Pillar 2 Title", type: "text", placeholder: "Heritage" },
            { key: "feature_2_desc", label: "Pillar 2 Description", type: "textarea", placeholder: "Decades of expertise in managing high-end destination events." },
        ],
        hasImage: true,
        imageLabel: "Philosophy Showcase Image",
        keyPrefix: "content",
        maxEntries: 1,
        hideCount: true,
    },
    {
        id: "about_stats",
        page: "about",
        label: "Impact Stats",
        icon: Award,
        color: "from-indigo-50 to-indigo-100",
        iconColor: "text-indigo-600",
        borderColor: "border-indigo-200",
        description: "Milestones and statistics (e.g. Years of Experience, Events Hosted)",
        fields: [
            { key: "value", label: "Statistic Value", type: "text", placeholder: "25+" },
            { key: "label", label: "Label / Metric", type: "text", placeholder: "Years of Experience" },
            { key: "icon_name", label: "Icon", type: "select", options: ["Award", "Calendar", "Star", "Heart", "Users", "Target"] },
        ],
        hasImage: false,
        keyPrefix: "stat",
        maxEntries: 6,
        hideCount: false,
    },
    {
        id: "about_values",
        page: "about",
        label: "Core Values",
        icon: Heart,
        color: "from-rose-50 to-rose-100",
        iconColor: "text-rose-600",
        borderColor: "border-rose-200",
        description: "The core values and pillars defining the Hevaniya experience",
        fields: [
            { key: "title", label: "Value Title", type: "text", placeholder: "Uncompromising Quality" },
            { key: "description", label: "Description", type: "textarea", placeholder: "We set the highest standards for every event, ensuring excellence in every detail." },
            { key: "icon_name", label: "Icon", type: "select", options: ["Target", "Leaf", "Heart", "Star", "Award", "Users"] },
        ],
        hasImage: false,
        keyPrefix: "value",
        maxEntries: 6,
        hideCount: false,
    },
    {
        id: "about_team",
        page: "about",
        label: "Visionaries & Team",
        icon: Users,
        color: "from-violet-50 to-violet-100",
        iconColor: "text-violet-600",
        borderColor: "border-violet-200",
        description: "Profiles of curators, planners, and founders behind Hevaniya",
        fields: [
            { key: "name", label: "Full Name", type: "text", placeholder: "Mukund Sharma" },
            { key: "role", label: "Role / Title", type: "text", placeholder: "Founder & Creative Director" },
            { key: "bio", label: "Biography", type: "textarea", placeholder: "With over 20 years in luxury event management..." },
        ],
        hasImage: true,
        imageLabel: "Member Portrait",
        keyPrefix: "member",
        maxEntries: 6,
        hideCount: false,
    },
    {
        id: "about_cta",
        page: "about",
        label: "Bottom CTA Banner",
        icon: Sparkles,
        color: "from-teal-50 to-teal-100",
        iconColor: "text-teal-700",
        borderColor: "border-teal-200",
        description: "'Ready to Create Your Legacy?' bottom conversion section",
        fields: [
            { key: "tag", label: "Eyebrow Tag", type: "text", placeholder: "Start Your Story" },
            { key: "heading", label: "Main Headline", type: "text", placeholder: "Ready to Create Your Legacy?" },
            { key: "button_primary", label: "Primary Button Text", type: "text", placeholder: "Enquire Now" },
            { key: "button_secondary", label: "Secondary Button Text", type: "text", placeholder: "View Portfolios" },
        ],
        hasImage: true,
        imageLabel: "CTA Background Image",
        keyPrefix: "content",
        maxEntries: 1,
        hideCount: true,
    },

    // ═══════════════ CONTACT PAGE ═══════════════
    {
        id: "contact_info",
        page: "contact",
        label: "Contact Info & Header",
        icon: PhoneCall,
        color: "from-blue-50 to-blue-100",
        iconColor: "text-blue-700",
        borderColor: "border-blue-200",
        description: "Main header, welcoming description, direct phone numbers & inquiry email",
        fields: [
            { key: "heading", label: "Main Page Title", type: "text", placeholder: "Reach Out to HEVANIYA" },
            { key: "description", label: "Intro Description", type: "textarea", placeholder: "Whether it's a new brief or a quick question, we'd love to hear from you." },
            { key: "query_label", label: "Query Section Subtitle", type: "text", placeholder: "Alternatively for your Queries contact" },
            { key: "phone", label: "Display Phone Number", type: "text", placeholder: "+91 98765 43210" },
            { key: "phone_tel", label: "Dial Link Number (tel:)", type: "text", placeholder: "+917990933700" },
            { key: "email", label: "Contact Email", type: "text", placeholder: "HEVANIYA@gmail.com" },
        ],
        hasImage: false,
        keyPrefix: "content",
        maxEntries: 1,
        hideCount: true,
    },
    {
        id: "contact_map",
        page: "contact",
        label: "Map & Coordinates",
        icon: MapPin,
        color: "from-amber-50 to-amber-100",
        iconColor: "text-amber-700",
        borderColor: "border-amber-200",
        description: "Google Maps embed iframe URL and venue location settings",
        fields: [
            { key: "map_title", label: "Location Title", type: "text", placeholder: "HEVANIYA Estate" },
            { key: "embed_url", label: "Google Maps Embed URL (iframe src)", type: "textarea", placeholder: "https://www.google.com/maps/embed?pb=..." },
        ],
        hasImage: false,
        keyPrefix: "content",
        maxEntries: 1,
        hideCount: true,
    }
];

// ——— Modal Component ———
function SectionModal({
    sectionConfig,
    existingEntries,
    onClose,
    onSaved,
}: {
    sectionConfig: SectionConfig;
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
    const [entryIndex, setEntryIndex] = useState<number>(0);

    const isSingleEntry = sectionConfig.maxEntries === 1;

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
            sectionConfig.fields.forEach(f => { 
                emptyFields[f.key] = f.type === "select" && f.options ? f.options[0] : ""; 
            });
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
    }, [existingEntries, loadEntry]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        setImageFile(f);
        if (f) setImagePreview(URL.createObjectURL(f));
    };

    async function uploadImage(): Promise<string | null> {
        if (!imageFile) return (editingEntry?.content_json.image_url as string) || null;
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

            // Key generation: for single entry sections use keyPrefix directly, for multiple use prefix_index
            const key = isSingleEntry
                ? sectionConfig.keyPrefix
                : `${sectionConfig.keyPrefix}_${entryIndex + 1}`;

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
            setTimeout(() => setSuccessMsg(""), 3000);
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
            if (editingEntry?.id === entry.id) {
                loadEntry(null, Math.max(0, existingEntries.length - 2));
            }
        } catch (err: unknown) {
            setErrorMsg((err as Error).message);
        }
    }

    const Icon = sectionConfig.icon;
    const canAddMore = !isSingleEntry && existingEntries.length < sectionConfig.maxEntries;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white border border-brand-green/20 animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`bg-gradient-to-r ${sectionConfig.color} border-b ${sectionConfig.borderColor} px-6 py-4 flex items-center justify-between shrink-0 rounded-t-2xl`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 bg-white/80 rounded-xl shadow-sm ${sectionConfig.iconColor}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-serif font-semibold text-gray-800">{sectionConfig.label}</h2>
                                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/70 text-gray-600">
                                    {sectionConfig.page} page
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{sectionConfig.description}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden bg-white rounded-b-2xl">
                    {/* Left: Entry List (only for multi-entry sections) */}
                    {!isSingleEntry && (
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
                                        className={`group flex items-center justify-between px-3 py-2 mx-1.5 rounded-lg cursor-pointer transition-all ${editingEntry?.id === entry.id ? "bg-white shadow-sm font-medium border border-gray-200" : "hover:bg-white/70 text-gray-600"}`}
                                        onClick={() => loadEntry(entry, i)}
                                    >
                                        <span className="text-xs truncate">
                                            {String(entry.content_json.heading || entry.content_json.title || entry.content_json.name || entry.content_json.value || entry.content_json.top_desc || `Item ${i + 1}`).slice(0, 18)}
                                        </span>
                                        <button
                                            className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                            onClick={e => { e.stopPropagation(); handleDelete(entry); }}
                                            title="Delete entry"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {canAddMore && (
                                <div className="p-2 border-t border-gray-200">
                                    <button
                                        onClick={() => loadEntry(null, existingEntries.length)}
                                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-dashed border-gray-300 hover:border-brand-green/50 hover:bg-brand-green/5 rounded-lg text-xs font-medium text-gray-600 hover:text-brand-forest transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add New
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Right: Form */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-5">
                            {/* Entry Indicator */}
                            {!isSingleEntry && (
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest">
                                        {editingEntry ? `Editing Entry #${entryIndex + 1}` : `Creating New Entry #${entryIndex + 1}`}
                                    </span>
                                </div>
                            )}

                            {/* Fields */}
                            {sectionConfig.fields.map(field => (
                                <div key={field.key} className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                                        {field.type === "textarea" ? <AlignLeft className="w-3 h-3 text-gray-400" /> : <Type className="w-3 h-3 text-gray-400" />}
                                        {field.label}
                                    </Label>
                                    {field.type === "textarea" ? (
                                        <textarea
                                            value={fields[field.key] || ""}
                                            onChange={e => setFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            placeholder={field.placeholder}
                                            rows={3}
                                            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 resize-none bg-gray-50 focus:bg-white transition-all shadow-xs"
                                        />
                                    ) : field.type === "select" ? (
                                        <select
                                            value={fields[field.key] || (field.options ? field.options[0] : "")}
                                            onChange={e => setFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 bg-gray-50 focus:bg-white transition-all shadow-xs cursor-pointer"
                                        >
                                            {field.options?.map(opt => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={fields[field.key] || ""}
                                            onChange={e => setFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            placeholder={field.placeholder}
                                            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 bg-gray-50 focus:bg-white transition-all shadow-xs"
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Image Upload */}
                            {sectionConfig.hasImage && (
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5 text-gray-400" /> {sectionConfig.imageLabel || "Image"}
                                    </Label>
                                    <div
                                        className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-brand-forest/50 transition-colors group bg-gray-50/50"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <div className="relative h-44 bg-gray-100 flex items-center justify-center">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Upload className="w-5 h-5 text-white mr-2" />
                                                    <span className="text-white text-xs font-medium">Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-gray-400 group-hover:text-gray-600 transition-colors">
                                                <Upload className="w-7 h-7 mb-2 opacity-50" />
                                                <p className="text-xs font-medium">Click or tap to upload photo</p>
                                                <p className="text-[10px] mt-0.5 opacity-60">PNG, JPG, WEBP, AVIF up to 10MB</p>
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
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading image to storage...
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Feedback Messages */}
                            {successMsg && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium animate-in fade-in">
                                    <Check className="w-4 h-4 shrink-0 text-emerald-600" /> {successMsg}
                                </div>
                            )}
                            {errorMsg && (
                                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            {/* Save Button */}
                            <Button
                                onClick={handleSave}
                                disabled={saving || uploadingImage}
                                className="w-full bg-brand-forest hover:bg-brand-dark text-white h-11 rounded-xl uppercase text-[11px] tracking-widest font-bold shadow-md hover:shadow-lg transition-all"
                            >
                                {saving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving Content...</>
                                ) : (
                                    <><Check className="w-4 h-4 mr-2" /> Save Section Content</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ——— Main Pages & Sections Manager ———
export default function GalleryPage() {
    const [selectedPage, setSelectedPage] = useState<"home" | "about" | "contact">("home");
    const [entries, setEntries] = useState<Record<string, SectionEntry[]>>({});
    const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const supabase = createClient();

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/section-content");
            const json = await res.json();
            const allEntries: SectionEntry[] = json.data || [];

            const grouped: Record<string, SectionEntry[]> = {};
            SECTION_CARDS.forEach(s => { grouped[s.id] = []; });
            allEntries.forEach(e => {
                if (grouped[e.section]) grouped[e.section].push(e);
            });
            setEntries(grouped);

            const { data: imgs } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
            setGalleryImages(imgs || []);
        } catch (err) {
            console.error("Error fetching section content:", err);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const activeSectionConfig = SECTION_CARDS.find(s => s.id === activeModal);

    // Filter cards for the currently selected tab
    const currentSections = SECTION_CARDS.filter(s => s.page === selectedPage);

    // Count of sections configured per page
    const pageStats = {
        home: SECTION_CARDS.filter(s => s.page === "home" && (entries[s.id]?.length || 0) > 0).length,
        about: SECTION_CARDS.filter(s => s.page === "about" && (entries[s.id]?.length || 0) > 0).length,
        contact: SECTION_CARDS.filter(s => s.page === "contact" && (entries[s.id]?.length || 0) > 0).length,
    };

    const totalStats = {
        home: SECTION_CARDS.filter(s => s.page === "home").length,
        about: SECTION_CARDS.filter(s => s.page === "about").length,
        contact: SECTION_CARDS.filter(s => s.page === "contact").length,
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-6xl mx-auto">
            {/* Top Page Header */}
            <div className="flex flex-col gap-3 border-b border-brand-green/10 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif text-brand-forest tracking-tight underline decoration-brand-gold/30 underline-offset-8">
                            Website Pages & Sections
                        </h1>
                        <p className="text-brand-forest/60 mt-2 italic font-light">
                            Manage live content, text, and imagery across all pages of the Hevaniya website.
                        </p>
                    </div>

                    <a 
                        href="http://localhost:3000" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-brand-green/20 text-brand-forest hover:bg-brand-green/5 shadow-xs transition-all w-fit"
                    >
                        <span>Preview Website</span>
                        <ExternalLink className="w-3.5 h-3.5 text-brand-gold" />
                    </a>
                </div>
            </div>

            {/* ───── Page Switcher Tabs ───── */}
            <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-md rounded-2xl border border-brand-green/15 shadow-xs overflow-x-auto">
                <button
                    onClick={() => setSelectedPage("home")}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                        selectedPage === "home"
                            ? "bg-brand-forest text-white shadow-md"
                            : "text-brand-forest/70 hover:bg-brand-green/10 hover:text-brand-forest"
                    }`}
                >
                    <HomeIcon className="w-4 h-4" />
                    <span>Home Page</span>
                    <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selectedPage === "home" ? "bg-white/20 text-white" : "bg-brand-forest/10 text-brand-forest"
                    }`}>
                        {pageStats.home}/{totalStats.home}
                    </span>
                </button>

                <button
                    onClick={() => setSelectedPage("about")}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                        selectedPage === "about"
                            ? "bg-brand-forest text-white shadow-md"
                            : "text-brand-forest/70 hover:bg-brand-green/10 hover:text-brand-forest"
                    }`}
                >
                    <Info className="w-4 h-4" />
                    <span>About Page</span>
                    <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selectedPage === "about" ? "bg-white/20 text-white" : "bg-brand-forest/10 text-brand-forest"
                    }`}>
                        {pageStats.about}/{totalStats.about}
                    </span>
                </button>

                <button
                    onClick={() => setSelectedPage("contact")}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                        selectedPage === "contact"
                            ? "bg-brand-forest text-white shadow-md"
                            : "text-brand-forest/70 hover:bg-brand-green/10 hover:text-brand-forest"
                    }`}
                >
                    <PhoneCall className="w-4 h-4" />
                    <span>Contact Page</span>
                    <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selectedPage === "contact" ? "bg-white/20 text-white" : "bg-brand-forest/10 text-brand-forest"
                    }`}>
                        {pageStats.contact}/{totalStats.contact}
                    </span>
                </button>
            </div>

            {/* Loading Indicator */}
            {loading ? (
                <div className="py-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-forest mb-3" />
                    <p className="text-sm text-brand-forest/60 italic">Loading page sections...</p>
                </div>
            ) : (
                /* Section Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentSections.map(section => {
                        const Icon = section.icon;
                        const sectionEntries = entries[section.id] || [];
                        const hasContent = sectionEntries.length > 0;
                        const firstImage = sectionEntries.find(e => e.content_json.image_url)?.content_json.image_url as string | undefined;

                        return (
                            <div
                                key={section.id}
                                onClick={() => setActiveModal(section.id)}
                                className={`group relative bg-gradient-to-br ${section.color} border ${section.borderColor} rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 bg-white/80 rounded-xl shadow-xs ${section.iconColor}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                            hasContent
                                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                : "bg-gray-100 text-gray-500 border border-gray-200"
                                        }`}>
                                            {section.maxEntries === 1
                                                ? (hasContent ? "Configured" : "Default")
                                                : `${sectionEntries.length} / ${section.maxEntries} items`}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-serif font-semibold text-gray-900 group-hover:text-brand-forest transition-colors">
                                        {section.label}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                                        {section.description}
                                    </p>

                                    {/* Preview Snippet */}
                                    {hasContent && (
                                        <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-3">
                                            {firstImage && (
                                                <img
                                                    src={firstImage}
                                                    alt="Thumbnail"
                                                    className="w-10 h-10 rounded-lg object-cover border border-white shadow-xs shrink-0"
                                                />
                                            )}
                                            <div className="text-xs text-gray-700 truncate font-medium">
                                                {String(
                                                    sectionEntries[0]?.content_json.heading ||
                                                    sectionEntries[0]?.content_json.title ||
                                                    sectionEntries[0]?.content_json.name ||
                                                    sectionEntries[0]?.content_json.subheading ||
                                                    "Content customized"
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="px-6 py-3 bg-white/50 border-t border-black/5 flex items-center justify-between text-xs font-semibold text-brand-forest group-hover:bg-brand-forest group-hover:text-white transition-all">
                                    <span>Edit Section</span>
                                    <span className="text-brand-gold group-hover:text-white transition-colors">→</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Active Edit Modal */}
            {activeSectionConfig && (
                <SectionModal
                    sectionConfig={activeSectionConfig}
                    existingEntries={entries[activeSectionConfig.id] || []}
                    onClose={() => setActiveModal(null)}
                    onSaved={fetchAll}
                />
            )}
        </div>
    );
}
