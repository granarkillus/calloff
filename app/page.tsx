"use client";

import { useState } from "react";
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
const GREEN = "#2f6b3a";

export default function CallOffForm() {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toTimeString().slice(0, 5);

  const [form, setForm] = useState({
    officerName: "",
    employeeNumber: "",
    post: "",
    shiftDate: today,
    shiftStart: "",
    shiftEnd: "",
    noticeType: "",
    reason: "",
    otherReason: "",
    coverageFound: "",
    coverageName: "",
    comments: "",
    signature: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    post: string;
    shiftDate: string;
    shiftStart: string;
    shiftEnd: string;
    noticeType: string;
    reason: string;
    timestamp: string;
  } | null>(null);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const setNoticeType = (val: string) => () =>
    setForm((f) => ({ ...f, noticeType: f.noticeType === val ? "" : val }));

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${m}/${d}/${y}`;
  };

  const required =
    form.officerName &&
    form.post &&
    form.shiftDate &&
    form.shiftStart &&
    form.noticeType &&
    form.reason &&
    form.signature;

  const handleSubmit = async () => {
    if (!required) return;
    setSubmitting(true);
    setError("");

    const supabase = getSupabase();
    const timestamp = new Date().toISOString();
    let docUrl = null;

    // Upload document if provided
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `calloff-${Date.now()}-${form.officerName.replace(/\s+/g, "-")}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("calloff-documents")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        // Non-fatal — continue without doc
        console.error("Upload error:", uploadError);
      } else if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("calloff-documents")
          .getPublicUrl(fileName);
        docUrl = urlData?.publicUrl || null;
      }
    }

    const reason = form.reason === "Other" ? form.otherReason : form.reason;

    const { error: dbError } = await supabase.from("calloff_submissions").insert([{
      officer_name: form.officerName,
      employee_number: form.employeeNumber || null,
      post: form.post,
      shift_date: form.shiftDate,
      shift_start: form.shiftStart,
      shift_end: form.shiftEnd || null,
      notice_type: form.noticeType,
      reason: reason,
      coverage_found: form.coverageFound === "yes",
      coverage_name: form.coverageName || null,
      comments: form.comments || null,
      signature: form.signature,
      document_url: docUrl,
      submitted_at: timestamp,
    }]);

    if (dbError) {
      setError("Submission failed. Please try again.");
      setSubmitting(false);
      return;
    }

    setSubmittedData({
      name: form.officerName,
      post: form.post,
      shiftDate: formatDate(form.shiftDate),
      shiftStart: form.shiftStart,
      shiftEnd: form.shiftEnd,
      noticeType: form.noticeType,
      reason: reason,
      timestamp: new Date(timestamp).toLocaleString("en-US", {
        month: "numeric", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
      }),
    });

    setSubmitted(true);
    setSubmitting(false);
  };

  const getCopyMessage = () => {
    if (!submittedData) return "";
    return `CALL-OFF NOTICE — ${submittedData.shiftDate}

Name: ${submittedData.name}
Post: ${submittedData.post}
Shift: ${submittedData.shiftStart}${submittedData.shiftEnd ? ` – ${submittedData.shiftEnd}` : ""}
Reason: ${submittedData.reason}
Notice Type: ${submittedData.noticeType}
Submitted: ${submittedData.timestamp}

This call-off was officially submitted via the AUS portal.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCopyMessage()).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  const handleReset = () => {
    setForm({
      officerName: "", employeeNumber: "", post: "", shiftDate: today,
      shiftStart: "", shiftEnd: "", noticeType: "", reason: "", otherReason: "",
      coverageFound: "", coverageName: "", comments: "", signature: "",
    });
    setFile(null);
    setSubmitted(false);
    setSubmittedData(null);
    setError("");
  };

  if (submitted && submittedData) {
    return (
      <div style={{ minHeight: "100vh", background: SOFT_BG, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "2rem 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 560, width: "100%", background: WHITE, borderRadius: 4, boxShadow: "0 2px 16px rgba(31,78,121,0.10)", overflow: "hidden" }}>
          <div style={{ background: NAVY, padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: WHITE, fontSize: "1rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Allied<span style={{ fontWeight: 300 }}>Universal</span><sup style={{ fontSize: "0.5rem", fontWeight: 300, marginLeft: 1 }}>™</sup>
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.68rem", marginTop: 2 }}>Security Services</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: WHITE, fontSize: "0.88rem", fontWeight: 700 }}>Call-Off Submitted</div>
            </div>
          </div>

          <div style={{ padding: "1.5rem 2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2f6b3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}>Call-off recorded</div>
                <div style={{ fontSize: "0.78rem", color: MUTED }}>{submittedData.timestamp}</div>
              </div>
            </div>

            {/* Message preview */}
            <div style={{ background: SOFT_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "1rem", marginBottom: "1rem", fontSize: "0.82rem", color: TEXT, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
              {getCopyMessage()}
            </div>

            <button
              onClick={handleCopy}
              style={{
                ...btnStyle(copySuccess ? GREEN : NAVY),
                marginBottom: "0.75rem",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {copySuccess ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy Message
                </>
              )}
            </button>

            <a
              href={`sms:${encodeURIComponent(getCopyMessage())}`}
              style={{ ...btnStyle("#374151"), display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", marginBottom: "0.75rem" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Open in Messages
            </a>

            <div style={{ fontSize: "0.75rem", color: MUTED, textAlign: "center", marginBottom: "1rem", lineHeight: 1.5 }}>
              Copy the message above and paste it to your supervisor in any chat app, or tap "Open in Messages" if you're on iPhone.
            </div>

            <button onClick={handleReset} style={{ ...btnStyle("transparent"), color: MUTED, border: `1px solid ${BORDER}`, fontSize: "0.78rem" }}>
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: SOFT_BG, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", background: WHITE, borderRadius: 4, boxShadow: "0 2px 16px rgba(31,78,121,0.10)", overflow: "hidden" }}>

        <div style={{ background: NAVY, padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: WHITE, fontSize: "1rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Allied<span style={{ fontWeight: 300 }}>Universal</span><sup style={{ fontSize: "0.5rem", fontWeight: 300, marginLeft: 1 }}>™</sup>
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.68rem", marginTop: 2 }}>Security Services</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: WHITE, fontSize: "0.9rem", fontWeight: 700 }}>Call-Off Notice</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>Washington University</div>
          </div>
        </div>

        <div style={{ padding: "0 0 2rem" }}>

          {/* Policy notice */}
          <div style={{ background: "#fef3c7", borderBottom: `1px solid #fcd34d`, padding: "0.75rem 2rem", fontSize: "0.78rem", color: "#92400e", fontWeight: 600, lineHeight: 1.5 }}>
            ⚠ Calls-off with less than 4 hours advance notice may result in disciplinary action per AUS Attendance Policy. Ensure this form is submitted as early as possible.
          </div>

          <SectionBar label="Officer Information" />
          <div style={{ padding: "1.25rem 2rem 0" }}>
            <Field label="Officer Name" value={form.officerName} onChange={set("officerName")} required />
            <Row>
              <Field label="Employee Number (optional)" value={form.employeeNumber} onChange={set("employeeNumber")} />
              <Field label="Assigned Post" value={form.post} onChange={set("post")} placeholder="e.g. Greenway Walk" required />
            </Row>
          </div>

          <SectionBar label="Shift Information" />
          <div style={{ padding: "1.25rem 2rem 0" }}>
            <Row>
              <Field label="Date of Absence" value={form.shiftDate} onChange={set("shiftDate")} type="date" required />
              <Field label="Shift Start Time" value={form.shiftStart} onChange={set("shiftStart")} type="time" required />
              <Field label="Shift End Time" value={form.shiftEnd} onChange={set("shiftEnd")} type="time" />
            </Row>

            <Label>Notice Type <span style={{ color: "#b3261e" }}>*</span></Label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", margin: "0.5rem 0 1.25rem" }}>
              {[
                ["4+ hours advance notice", "4+ hours in advance — standard call-off"],
                ["Less than 4 hours notice", "Less than 4 hours — may result in Final Written Warning"],
              ].map(([val, desc]) => (
                <label key={val} onClick={setNoticeType(val)} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", background: form.noticeType === val ? "#eef3f8" : SOFT_BG, border: `1.5px solid ${form.noticeType === val ? NAVY : BORDER}`, borderRadius: 4, padding: "0.65rem 1rem", userSelect: "none" }}>
                  <div style={{ width: 17, height: 17, border: `2px solid ${form.noticeType === val ? NAVY : BORDER}`, borderRadius: "50%", background: form.noticeType === val ? NAVY : WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                    {form.noticeType === val && <div style={{ width: 7, height: 7, borderRadius: "50%", background: WHITE }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: form.noticeType === val ? 700 : 400, color: TEXT }}>{val}</div>
                    <div style={{ fontSize: "0.72rem", color: MUTED, marginTop: 1 }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <SectionBar label="Reason for Absence" />
          <div style={{ padding: "1.25rem 2rem 0" }}>
            <Label>Reason <span style={{ color: "#b3261e" }}>*</span></Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", margin: "0.5rem 0 1.25rem" }}>
              {["Illness", "Family emergency", "Personal emergency", "Bereavement", "Medical appointment", "Other"].map((r) => (
                <label key={r} onClick={() => setForm((f) => ({ ...f, reason: f.reason === r ? "" : r }))} style={{
                  display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                  fontSize: "0.85rem", fontWeight: form.reason === r ? 700 : 400,
                  color: form.reason === r ? NAVY : TEXT, userSelect: "none",
                  background: form.reason === r ? "#eef3f8" : SOFT_BG,
                  border: `1.5px solid ${form.reason === r ? NAVY : BORDER}`,
                  borderRadius: 4, padding: "0.4rem 0.75rem",
                }}>
                  <div style={{ width: 14, height: 14, border: `2px solid ${form.reason === r ? NAVY : BORDER}`, borderRadius: 2, background: form.reason === r ? NAVY : WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                    {form.reason === r && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  {r}
                </label>
              ))}
            </div>
            {form.reason === "Other" && (
              <Field label="Please specify" value={form.otherReason} onChange={set("otherReason")} placeholder="Describe reason..." />
            )}

            {/* Coverage */}
            <Label>Were you able to find coverage?</Label>
            <div style={{ display: "flex", gap: "1rem", margin: "0.5rem 0 1rem" }}>
              {[["yes", "Yes"], ["no", "No"]].map(([val, label]) => (
                <label key={val} onClick={() => setForm((f) => ({ ...f, coverageFound: val }))} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.88rem", fontWeight: form.coverageFound === val ? 700 : 400, color: TEXT, userSelect: "none" }}>
                  <div style={{ width: 17, height: 17, border: `2px solid ${form.coverageFound === val ? NAVY : BORDER}`, borderRadius: "50%", background: form.coverageFound === val ? NAVY : WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                    {form.coverageFound === val && <div style={{ width: 7, height: 7, borderRadius: "50%", background: WHITE }} />}
                  </div>
                  {label}
                </label>
              ))}
            </div>
            {form.coverageFound === "yes" && (
              <Field label="Coverage Officer Name" value={form.coverageName} onChange={set("coverageName")} placeholder="Who is covering your shift?" />
            )}

            {/* Additional comments */}
            <Label>Additional Comments (optional)</Label>
            <textarea
              value={form.comments}
              onChange={set("comments")}
              placeholder="Any additional information..."
              rows={3}
              style={{ width: "100%", boxSizing: "border-box", padding: "0.6rem 0.75rem", border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: "0.88rem", color: TEXT, background: "#fafbfc", fontFamily: "inherit", resize: "vertical", marginTop: 4, marginBottom: "1.25rem" }}
            />

            {/* Document upload */}
            <Label>Supporting Documentation (optional)</Label>
            <div style={{ fontSize: "0.72rem", color: MUTED, marginBottom: "0.5rem" }}>
              Required for absences of 3+ consecutive days. Accepted: JPG, PNG, PDF.
            </div>
            <div
              style={{ border: `2px dashed ${file ? NAVY : BORDER}`, borderRadius: 4, padding: "1.25rem", textAlign: "center", background: file ? "#eef3f8" : "#fafbfc", cursor: "pointer", marginBottom: "1.25rem", transition: "all 0.15s" }}
              onClick={() => document.getElementById("doc-upload")?.click()}
            >
              <input
                id="doc-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <div style={{ fontSize: "0.85rem", color: NAVY, fontWeight: 600 }}>
                  📎 {file.name}
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", marginLeft: 8, fontSize: "0.78rem" }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: "0.82rem", color: MUTED }}>
                  Tap to upload a photo or document
                </div>
              )}
            </div>
          </div>

          <SectionBar label="Signature" />
          <div style={{ padding: "1.25rem 2rem 0" }}>
            <div style={{ fontSize: "0.82rem", color: TEXT, lineHeight: 1.6, marginBottom: "1rem", background: SOFT_BG, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${NAVY}`, borderRadius: 3, padding: "0.65rem 1rem" }}>
              By signing below, I confirm that the information provided is accurate and that I have notified my supervisor of this absence in accordance with AUS attendance policy.
            </div>
            <Field label="Signature (type full name)" value={form.signature} onChange={set("signature")} placeholder="Full legal name" required />

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 4, padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#b91c1c", marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                onClick={handleSubmit}
                disabled={!required || submitting}
                style={{ ...btnStyle(required && !submitting ? NAVY : "#9ca3af"), cursor: required && !submitting ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {submitting ? "Submitting..." : "Submit Call-Off Notice"}
              </button>
              {!required && <div style={{ fontSize: "0.75rem", color: MUTED, textAlign: "center" }}>Complete required fields: Name, Post, Date, Shift Start, Notice Type, Reason, and Signature</div>}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: "2rem", padding: "0.85rem 2rem 0", fontSize: "0.72rem", color: MUTED, textAlign: "center" }}>
            Allied Universal Security Services &nbsp;·&nbsp; Washington University &nbsp;·&nbsp; All submissions are timestamped and logged.
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionBar({ label }: { label: string }) {
  return (
    <div style={{ background: DARK, padding: "0.55rem 2rem", color: "#ffffff", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "1.5rem" }}>
      {label}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required: req }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <Label>{label}{req && <span style={{ color: "#b3261e", marginLeft: 2 }}>*</span>}</Label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      {Array.isArray(children)
        ? children.map((child, i) => <div key={i} style={{ flex: 1 }}>{child}</div>)
        : <div style={{ flex: 1 }}>{children}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "0.5rem 0.75rem",
  border: "1px solid #d1d5db", borderRadius: 4, fontSize: "0.88rem",
  color: "#1a1a2e", background: "#fafbfc", outline: "none", fontFamily: "inherit",
};

function btnStyle(bg: string): React.CSSProperties {
  return { background: bg, color: "#ffffff", border: "none", borderRadius: 4, padding: "0.7rem 1.75rem", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", width: "100%" };
}
