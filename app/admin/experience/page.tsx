"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, Upload, Check, Save } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ExperienceAdminPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const [image1File, setImage1File] = useState<File | null>(null);
    const [image1Preview, setImage1Preview] = useState("");
    const image1Ref = useRef<HTMLInputElement>(null);

    const [image2File, setImage2File] = useState<File | null>(null);
    const [image2Preview, setImage2Preview] = useState("");
    const image2Ref = useRef<HTMLInputElement>(null);

    const [content, setContent] = useState({
        subheading: "",
        description: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const res = await fetch("/api/section-content?section=experience");
            const json = await res.json();
            const entries = json.data || [];

            const img1Entry = entries.find((e: any) => e.key === "image_1");
            if (img1Entry?.content_json?.image_url) setImage1Preview(img1Entry.content_json.image_url);

            const img2Entry = entries.find((e: any) => e.key === "image_2");
            if (img2Entry?.content_json?.image_url) setImage2Preview(img2Entry.content_json.image_url);

            const contentEntry = entries.find((e: any) => e.key === "content");
            if (contentEntry?.content_json) {
                setContent({
                    subheading: contentEntry.content_json.subheading || "",
                    description: contentEntry.content_json.description || "",
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function uploadImage(file: File) {
        const ext = file.name.split(".").pop();
        const path = `experience/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("gallery").upload(path, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(path);
        return publicUrl;
    }

    async function handleSave() {
        setSaving(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            let img1Url = image1Preview;
            if (image1File) {
                img1Url = await uploadImage(image1File);
            }

            let img2Url = image2Preview;
            if (image2File) {
                img2Url = await uploadImage(image2File);
            }

            const payloadImg1 = { section: "experience", key: "image_1", content_json: { image_url: img1Url } };
            const payloadImg2 = { section: "experience", key: "image_2", content_json: { image_url: img2Url } };
            const payloadContent = { 
                section: "experience", 
                key: "content", 
                content_json: { ...content } 
            };

            const promises = [
                fetch("/api/section-content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadContent) })
            ];
            
            if (img1Url) promises.push(fetch("/api/section-content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadImg1) }));
            if (img2Url) promises.push(fetch("/api/section-content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadImg2) }));

            const results = await Promise.all(promises);
            for (const res of results) {
                if (!res.ok) {
                    const json = await res.json();
                    throw new Error(json.error || "Save failed");
                }
            }

            setSuccessMsg("Experience section saved successfully!");
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-forest" /></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-4xl">
            <div className="flex flex-col gap-2 border-b border-brand-green/10 pb-6">
                <h1 className="text-3xl font-serif text-brand-forest tracking-tight underline decoration-brand-gold/30 underline-offset-8">
                    Experience Section
                </h1>
                <p className="text-brand-forest/60 mt-2 italic font-light">
                    Manage the content and images for the Experience section shown on the homepage.
                </p>
            </div>

            <div className="space-y-6">
                {/* Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Image 1</Label>
                        <div
                            className="relative h-48 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-brand-green/50 group bg-gray-50 flex items-center justify-center"
                            onClick={() => image1Ref.current?.click()}
                        >
                            {image1Preview ? (
                                <img src={image1Preview} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Upload className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                    <span className="text-sm">Upload Image 1</span>
                                </div>
                            )}
                            {image1Preview && (
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Upload className="w-6 h-6 text-white" />
                                    <span className="text-white text-xs ml-2">Change Image</span>
                                </div>
                            )}
                        </div>
                        <input type="file" accept="image/*" className="hidden" ref={image1Ref} onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) { setImage1File(f); setImage1Preview(URL.createObjectURL(f)); }
                        }} />
                    </div>

                    <div className="space-y-2">
                        <Label>Image 2</Label>
                        <div
                            className="relative h-48 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-brand-green/50 group bg-gray-50 flex items-center justify-center"
                            onClick={() => image2Ref.current?.click()}
                        >
                            {image2Preview ? (
                                <img src={image2Preview} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Upload className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                    <span className="text-sm">Upload Image 2</span>
                                </div>
                            )}
                            {image2Preview && (
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Upload className="w-6 h-6 text-white" />
                                    <span className="text-white text-xs ml-2">Change Image</span>
                                </div>
                            )}
                        </div>
                        <input type="file" accept="image/*" className="hidden" ref={image2Ref} onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) { setImage2File(f); setImage2Preview(URL.createObjectURL(f)); }
                        }} />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Text Content</h3>
                    
                    <div className="space-y-2">
                        <Label>Subheading</Label>
                        <textarea
                            value={content.subheading}
                            onChange={(e) => setContent({...content, subheading: e.target.value})}
                            placeholder="Where Exceptional Experiences Take Shape..."
                            className="w-full px-3 py-2 border rounded-lg h-24 text-sm"
                        />
                        <p className="text-xs text-gray-400">Use \n or press Enter for new lines</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <textarea
                            value={content.description}
                            onChange={(e) => setContent({...content, description: e.target.value})}
                            placeholder="At HEVANIYA, we believe a venue is more than just a location..."
                            className="w-full px-3 py-2 border rounded-lg h-32 text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button onClick={handleSave} disabled={saving} className="bg-[#7A8F5B] hover:bg-[#2D2D2D] text-white">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                    {successMsg && <span className="text-green-600 text-sm flex items-center gap-1"><Check className="w-4 h-4" />{successMsg}</span>}
                    {errorMsg && <span className="text-red-600 text-sm">{errorMsg}</span>}
                </div>
            </div>
        </div>
    );
}
