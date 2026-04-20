"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { RefreshCw, MapPin, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  venue: string | null;
  status: string;
  created_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLeads(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-dark">Leads & Enquiries</h1>
          <p className="text-sm text-brand-dark/60 mt-1">
            Manage incoming enquiries from website forms.
          </p>
        </div>
        <Button 
          onClick={fetchLeads} 
          variant="outline" 
          size="sm"
          className="border-brand-copper/20 text-brand-dark"
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border border-brand-green/10 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-brand-copper/50" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-brand-sand/50 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-brand-copper/60" />
            </div>
            <h3 className="text-lg font-medium text-brand-dark">No leads yet</h3>
            <p className="text-sm text-brand-dark/60 mt-1">When someone submits a form on your website, it will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F5EDE4]/30 text-[#B38B6D] text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Received</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Enquiry Source</th>
                  <th className="px-6 py-4">Message / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-green/5 text-brand-dark/80">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-brand-sand/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs text-brand-dark/60">
                        <Calendar className="mr-1.5 h-3 w-3" />
                        {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        <span className="block ml-1 opacity-70">
                          {new Date(lead.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-brand-dark whitespace-nowrap">
                      {lead.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {lead.email && (
                          <div className="flex items-center text-xs">
                            <Mail className="mr-2 h-3.5 w-3.5 text-brand-copper/60" />
                            <a href={`mailto:${lead.email}`} className="hover:text-brand-copper hover:underline">{lead.email}</a>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center text-xs">
                            <Phone className="mr-2 h-3.5 w-3.5 text-brand-copper/60" />
                            <a href={`tel:${lead.phone}`} className="hover:text-brand-copper hover:underline">{lead.phone}</a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.venue ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#7A8F5B]/10 text-[#7A8F5B]">
                          <MapPin className="mr-1 h-3 w-3" />
                          {lead.venue}
                        </span>
                      ) : (
                        <span className="text-brand-dark/40 italic">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="line-clamp-2 text-xs opacity-80 max-w-sm">
                        {lead.message || <span className="italic opacity-50">No additional details provided.</span>}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
