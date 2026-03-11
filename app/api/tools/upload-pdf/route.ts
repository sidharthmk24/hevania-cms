import { NextResponse } from "next/server";
import { createApiSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const bucket = formData.get("bucket") as string;

        if (!file || !bucket) {
            return NextResponse.json({ error: "File and bucket are required" }, { status: 400 });
        }

        const supabase = createApiSupabaseClient();
        const ext = file.name.split(".").pop();
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(filename, file, { upsert: false });

        if (error) {
            return NextResponse.json({ error: `File upload failed: ${error.message}` }, { status: 500 });
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filename);

        return NextResponse.json({ url: data.publicUrl }, { status: 201 });
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message || "Something went wrong" }, { status: 500 });
    }
}
