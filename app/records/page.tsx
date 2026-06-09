"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

const NAVY = "#1f4e79";
const DARK = "#1a1a2e";
const SOFT_BG = "#f4f6f9";
const WHITE = "#ffffff";
const MUTED = "#6b7280";
const BORDER = "#d1d5db";
const TEXT = "#1a1a2e";

interface CallOff {
  id: string;
  officer_name: string;
  employee_number: string;
  post: string;
  shift_date: string;
  shift_start: string;
  shift_end: string;
  notice_type: string;
  reason: string;
  coverage_found: boolean;
  coverage_name: string;
  comments: string;
  signature: string;
  document_url: string;
  submitted_at: string;
}

export default function CallOffRecords() {
  const [records, setRecords] = useState<CallOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    supabase
      .from("calloff_submissions")
      .select("*")
      .order("submitted_at", { ascending: false })
      .then(({ data }) => {
        setRecords(data || []);
        setLoading(false);
      });
  }, []);

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = iso.split("T")[0];
    const [y, m, day] = d.split("-");
    return `${m}/${day}/${y}`;
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-US", {
      month: "numeric", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  };

  const filtered = records.filter((r) => {
    const matchesSearch = !search ||
      r.officer_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.post?.toLowerCase().includes(search.toLowerCase()) ||
      r.reason?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "less4" && r.notice_type?.includes("Less than")) ||
      (filter === "4plus" && r.notice_type?.includes("4+")) ||
      (filter === "docs" && !!r.document_url);
    return matchesSearch && matchesFilter;
  });

  const less4 = records.filter((r) => r.notice_type?.includes("Less than")).length;
  const withDocs = records.filter((r) => !!r.document_url).length;

  return (
    <div style={{ minHeight: "100vh", background: SOFT_BG, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: NAVY, padding: "1.25rem 2rem", borderRadius: "4px 4px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: WHITE, fontSize: "1rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Allied<span style={{ fontWeight: 300 }}>Universal</span><sup style={{ fontSize: "0.5rem", fontWeight: 300, marginLeft: 1 }}>™</sup>
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.68rem", marginTop: 2 }}>Security Services · Supervisor Portal</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: WHITE, fontSize: "0.95rem", fontWeight: 700 }}>Call-Off Records</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>Washington University</div>
          </div>
        </div>

        {/* Summary bar */}
        <div style={{ background: DARK, padding: "0.75rem 2rem", display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
          {[
            ["Total", records.length],
            ["< 4 Hour Notice", less4],
            ["With Documentation", withDocs],
          ].map(([label, val]) => (
            <div key={label as string}>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
              <div style={{ color: WHITE, fontSize: "1.1rem", fontWeight: 700 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: "none", padding: "1rem 2rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by officer, post, or reason..."
            style={{ flex: 1, minWidth: 200, padding: "0.45rem 0.75rem", border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: "0.85rem", color: TEXT, background: "#fafbfc", outline: "none", fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {[
              ["all", "All"],
              ["4plus", "4+ Hour Notice"],
              ["less4", "< 4 Hour Notice"],
              ["docs", "With Docs"],
            ].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                padding: "0.4rem 0.9rem", borderRadius: 4, fontSize: "0.78rem", fontWeight: 700,
                border: `1px solid ${filter === val ? NAVY : BORDER}`,
                background: filter === val ? NAVY : WHITE,
                color: filter === val ? WHITE : MUTED,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Records */}
        {loading ? (
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: "none", padding: "2rem", textAlign: "center", color: MUTED, fontSize: "0.85rem" }}>
            Loading records...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: "none", padding: "2rem", textAlign: "center", color: MUTED, fontSize: "0.85rem" }}>
            No call-off records found.
          </div>
        ) : (
          filtered.map((r, i) => {
            const isLess4 = r.notice_type?.includes("Less than");
            const isExpanded = expanded === r.id;

            return (
              <div key={r.id} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: "none" }}>
                <div
                  onClick={() => setExpanded(isExpanded ? null : r.id)}
                  style={{ padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", cursor: "pointer" }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.92rem", color: TEXT }}>{r.officer_name}</span>
                      <span style={{
                        fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                        background: isLess4 ? "#fef2f2" : "#e8f5e9",
                        color: isLess4 ? "#b91c1c" : "#2f6b3a",
                        border: `1px solid ${isLess4 ? "#fca5a5" : "#a5d6a7"}`,
                        textTransform: "uppercase" as const, letterSpacing: "0.04em",
                      }}>
                        {isLess4 ? "< 4hr Notice" : "4+ hr Notice"}
                      </span>
                      {r.document_url && (
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#eef3f8", color: NAVY, border: `1px solid #c3d4e8`, textTransform: "uppercase" as const }}>
                          Doc Attached
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: MUTED }}>
                      {r.post} &nbsp;·&nbsp; {formatDate(r.shift_date)} {r.shift_start && `@ ${r.shift_start}`}{r.shift_end && ` – ${r.shift_end}`} &nbsp;·&nbsp; {r.reason}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: MUTED, marginTop: 2 }}>
                      Submitted: {formatDateTime(r.submitted_at)}
                    </div>
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ padding: "0 2rem 1.25rem", borderTop: `1px solid ${BORDER}`, background: SOFT_BG }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 2rem", paddingTop: "1rem" }}>
                      {[
                        ["Officer", r.officer_name],
                        ["Employee #", r.employee_number],
                        ["Post", r.post],
                        ["Shift Date", formatDate(r.shift_date)],
                        ["Shift Start", r.shift_start],
                        ["Shift End", r.shift_end],
                        ["Notice Type", r.notice_type],
                        ["Reason", r.reason],
                        ["Coverage Found", r.coverage_found ? "Yes" : "No"],
                        ["Coverage Officer", r.coverage_name],
                        ["Signature", r.signature],
                        ["Submitted", formatDateTime(r.submitted_at)],
                      ].map(([label, val]) => val ? (
                        <div key={label}>
                          <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: MUTED, marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: "0.85rem", color: TEXT }}>{val}</div>
                        </div>
                      ) : null)}
                    </div>
                    {r.comments && (
                      <div style={{ marginTop: "0.75rem" }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: MUTED, marginBottom: 2 }}>Comments</div>
                        <div style={{ fontSize: "0.85rem", color: TEXT, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 3, padding: "0.5rem 0.75rem" }}>{r.comments}</div>
                      </div>
                    )}
                    {r.document_url && (
                      <div style={{ marginTop: "0.75rem" }}>
                        <a href={r.document_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: NAVY, color: WHITE, borderRadius: 4, padding: "0.45rem 1rem", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          View Documentation
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        <div style={{ marginTop: "1rem", fontSize: "0.72rem", color: MUTED, textAlign: "center" }}>
          Allied Universal Security Services &nbsp;·&nbsp; Washington University &nbsp;·&nbsp; Keep all completed forms on file for audit purposes.
        </div>
      </div>
    </div>
  );
}
