import Link from "next/link";
import { Mail, Users, Send } from "lucide-react";

export default function NewsletterIndexPage() {
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col gap-1 p-4 md:px-6 border-b border-brand-copper/10 pb-6 bg-white/40 rounded-t-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm">
        <h1 className="text-3xl font-serif text-brand-dark tracking-tight">Newsletter</h1>
        <p className="text-brand-dark/60 mt-1">Manage subscribers and broadcast email campaigns.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 px-6">
        <Link href="/admin/newsletter/subscribers" className="group">
          <div className="flex items-center gap-5 p-6 bg-white border border-brand-copper/10 rounded-xl shadow-sm hover:shadow-warm-md hover:border-brand-copper/30 transition-all">
            <div className="p-3 bg-brand-sand/40 rounded-xl group-hover:bg-brand-copper/10 transition-colors">
              <Users className="w-6 h-6 text-brand-copper" />
            </div>
            <div>
              <p className="font-serif text-lg text-brand-dark">Subscribers</p>
              <p className="text-sm text-brand-dark/50 mt-0.5">View and manage all email subscribers</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/newsletter/campaigns" className="group">
          <div className="flex items-center gap-5 p-6 bg-white border border-brand-copper/10 rounded-xl shadow-sm hover:shadow-warm-md hover:border-brand-copper/30 transition-all">
            <div className="p-3 bg-brand-sand/40 rounded-xl group-hover:bg-brand-copper/10 transition-colors">
              <Send className="w-6 h-6 text-brand-copper" />
            </div>
            <div>
              <p className="font-serif text-lg text-brand-dark">Campaigns</p>
              <p className="text-sm text-brand-dark/50 mt-0.5">Compose and send newsletter campaigns</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
