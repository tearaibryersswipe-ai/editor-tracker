import { useState, useEffect, useRef, useCallback } from "react";

const EDITORS = ["Select editor...", "Geoff", "Nicket"];
const CAMPAIGNS = ["Select campaign...", "REGEN", "Peak Height", "ReCreate", "Other"];
const CREATORS = ["Select creator...", "Te Arai", "Lucas"];
const RATE_PER_VIDEO = 5;

const STATUS_COLORS = {
  "In Review": { bg: "#1a2a3a", text: "#4da6ff", border: "#1e3a5a" },
  "Revisions": { bg: "#2a1a0a", text: "#ff9f4a", border: "#3a2a0a" },
  "Approved": { bg: "#0a2a1a", text: "#4aff9f", border: "#0a3a2a" },
  "Completed": { bg: "#1a1a2a", text: "#a09fff", border: "#2a2a3a" },
};

const STATUS_OPTIONS = ["In Review", "Revisions", "Approved", "Completed"];

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

export default function EditorTracker() {
  const [videos, setVideos] = useState([]);
  const [view, setView] = useState("upload");
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({ editor: "", creator: "", campaign: "", title: "", file: null });
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterCreator, setFilterCreator] = useState("All");
  const fileRef = useRef();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("editor_videos");
      if (saved) setVideos(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (updated) => {
    setVideos(updated);
    try { localStorage.setItem("editor_videos", JSON.stringify(updated)); } catch {}
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setForm(f => ({ ...f, file, title: f.title || file.name.replace(/\.[^/.]+$/, "") }));
  }, []);

  const handleSubmit = () => {
    if (!form.editor || form.editor === "Select editor..." ||
        !form.creator || form.creator === "Select creator..." ||
        !form.campaign || form.campaign === "Select campaign..." ||
        !form.title || !form.file) {
      showToast("Please fill in all fields and upload a file.", "error");
      return;
    }
    const entry = {
      id: Date.now(),
      editor: form.editor,
      creator: form.creator,
      campaign: form.campaign,
      title: form.title,
      fileName: form.file.name,
      status: "In Review",
      submittedAt: Date.now(),
      approvedAt: null,
      revisions: 0,
      notes: "",
      paid: false,
    };
    save([entry, ...videos]);
    setForm({ editor: "", creator: "", campaign: "", title: "", file: null });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const updateVideo = (id, changes) => {
    const updated = videos.map(v => v.id === id ? { ...v, ...changes } : v);
    save(updated);
  };

  const weekStart = getWeekStart();
  const thisWeek = videos.filter(v => new Date(v.submittedAt) >= weekStart);
  const editorSummary = {};
  thisWeek.forEach(v => {
    if (!editorSummary[v.editor]) editorSummary[v.editor] = { total: 0, completed: 0, inReview: 0, revisions: 0, unpaid: 0 };
    editorSummary[v.editor].total++;
    if (v.status === "Completed") { editorSummary[v.editor].completed++; if (!v.paid) editorSummary[v.editor].unpaid++; }
    if (v.status === "In Review") editorSummary[v.editor].inReview++;
    if (v.status === "Revisions") editorSummary[v.editor].revisions++;
  });

  const filteredVideos = filterCreator === "All" ? videos : videos.filter(v => v.creator === filterCreator);
  const inReviewAll = videos.filter(v => v.status === "In Review");

  const s = {
    app: { minHeight: "100vh", background: "#0d0d0d", color: "#e8e4dc", fontFamily: "'Inter', 'Arial', sans-serif" },
    header: { borderBottom: "1px solid #1e1e1e", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0d0d", position: "sticky", top: 0, zIndex: 100 },
    logo: { fontSize: 15, fontWeight: 700, letterSpacing: "0.15em", color: "#e8e4dc", textTransform: "uppercase" },
    sub: { fontSize: 11, color: "#555", letterSpacing: "0.1em", marginTop: 2 },
    nav: { display: "flex", gap: 4 },
    navBtn: (active) => ({ padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", background: active ? "#e8e4dc" : "transparent", color: active ? "#0d0d0d" : "#666", transition: "all 0.15s" }),
    main: { maxWidth: 860, margin: "0 auto", padding: "40px 24px" },
    card: { background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "28px 28px" },
    label: { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase", marginBottom: 8, display: "block" },
    input: { width: "100%", background: "#0d0d0d", border: "1px solid #222", borderRadius: 8, padding: "12px 14px", color: "#e8e4dc", fontSize: 14, outline: "none", boxSizing: "border-box" },
    select: { width: "100%", background: "#0d0d0d", border: "1px solid #222", borderRadius: 8, padding: "12px 14px", color: "#e8e4dc", fontSize: 14, outline: "none", boxSizing: "border-box", appearance: "none" },
    dropzone: (active) => ({ border: `2px dashed ${active ? "#e8e4dc" : "#2a2a2a"}`, borderRadius: 12, padding: "48px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: active ? "#161616" : "transparent" }),
    btn: { background: "#e8e4dc", color: "#0d0d0d", border: "none", borderRadius: 8, padding: "14px 32px", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer", width: "100%" },
    row: { display: "flex", gap: 16, marginBottom: 16 },
    col: { flex: 1 },
    sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #1a1a1a" },
    videoCard: { background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, padding: "18px 20px", marginBottom: 12 },
    statusSelect: { background: "#111", border: "1px solid #222", borderRadius: 6, padding: "6px 10px", color: "#e8e4dc", fontSize: 12, outline: "none" },
    textarea: { width: "100%", background: "#111", border: "1px solid #222", borderRadius: 6, padding: "10px 12px", color: "#888", fontSize: 12, resize: "vertical", minHeight: 60, outline: "none", marginTop: 8, boxSizing: "border-box" },
    summaryCard: { background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px 24px", marginBottom: 12 },
    payRow: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #1a1a1a", marginTop: 12 },
    payAmount: { fontSize: 22, fontWeight: 800, color: "#e8e4dc" },
    badge: (color) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: `${color}15`, color, border: `1px solid ${color}30` }),
    toast: (type) => ({ position: "fixed", bottom: 24, right: 24, background: type === "error" ? "#2a0a0a" : "#0a2a1a", border: `1px solid ${type === "error" ? "#5a1a1a" : "#1a5a3a"}`, color: type === "error" ? "#ff6b6b" : "#4aff9f", padding: "14px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999 }),
    filterBtn: (active) => ({ padding: "6px 14px", borderRadius: 6, border: `1px solid ${active ? "#e8e4dc" : "#222"}`, cursor: "pointer", fontSize: 11, fontWeight: 600, background: active ? "#e8e4dc" : "transparent", color: active ? "#0d0d0d" : "#555", transition: "all 0.15s" }),
  };

  return (
    <div style={s.app}>
      {toast && <div style={s.toast(toast.type)}>{toast.msg}</div>}

      <div style={s.header}>
        <div>
          <div style={s.logo}>Core Code™ Editor Portal</div>
          <div style={s.sub}>Te Arai Bryers · UGC Production</div>
        </div>
        <div style={s.nav}>
          {[["upload", "Upload"], ["tracker", "Tracker"], ["summary", "Pay Summary"]].map(([v, l]) => (
            <button key={v} style={s.navBtn(view === v)} onClick={() => setView(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={s.main}>

        {view === "upload" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Submit a video</div>
              <div style={{ fontSize: 13, color: "#555" }}>Upload your completed edit for review. Fill in all fields before submitting.</div>
            </div>

            {submitted ? (
              <div style={{ ...s.card, textAlign: "center", padding: "48px 28px" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Video submitted</div>
                <div style={{ fontSize: 13, color: "#555" }}>Te Arai will review and leave feedback shortly.</div>
              </div>
            ) : (
              <div style={s.card}>
                <div style={s.row}>
                  <div style={s.col}>
                    <label style={s.label}>Your name</label>
                    <select style={s.select} value={form.editor} onChange={e => setForm(f => ({ ...f, editor: e.target.value }))}>
                      {EDITORS.map(e => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div style={s.col}>
                    <label style={s.label}>Creator</label>
                    <select style={s.select} value={form.creator} onChange={e => setForm(f => ({ ...f, creator: e.target.value }))}>
                      {CREATORS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={s.row}>
                  <div style={s.col}>
                    <label style={s.label}>Campaign</label>
                    <select style={s.select} value={form.campaign} onChange={e => setForm(f => ({ ...f, campaign: e.target.value }))}>
                      {CAMPAIGNS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={s.col}>
                    <label style={s.label}>Video title</label>
                    <input style={s.input} placeholder="e.g. REGEN_Week1_TeArai_v1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={s.label}>Video file</label>
                  <div
                    style={s.dropzone(dragging)}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current.click()}
                  >
                    <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) setForm(fm => ({ ...fm, file: f, title: fm.title || f.name.replace(/\.[^/.]+$/, "") })); }} />
                    {form.file ? (
                      <div>
                        <div style={{ fontSize: 20, marginBottom: 8 }}>📹</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e4dc" }}>{form.file.name}</div>
                        <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{(form.file.size / 1024 / 1024).toFixed(1)} MB · Click to change</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 28, marginBottom: 12 }}>↑</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#888" }}>Drag and drop your video here</div>
                        <div style={{ fontSize: 12, color: "#444", marginTop: 6 }}>or click to browse files</div>
                      </div>
                    )}
                  </div>
                </div>

                <button style={s.btn} onClick={handleSubmit}>Submit for review</button>
              </div>
            )}
          </div>
        )}

        {view === "tracker" && (
          <div>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Video tracker</div>
                <div style={{ fontSize: 13, color: "#555" }}>Review submissions, leave feedback, and update statuses.</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["All", "Te Arai", "Lucas"].map(c => (
                  <button key={c} style={s.filterBtn(filterCreator === c)} onClick={() => setFilterCreator(c)}>{c}</button>
                ))}
              </div>
            </div>

            {inReviewAll.length > 0 && (
              <div style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "8px 14px", background: "#1a2a3a", borderRadius: 8, marginBottom: 24 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#4da6ff" }}>⚡ {inReviewAll.length} video{inReviewAll.length > 1 ? "s" : ""} waiting for your review</span>
              </div>
            )}

            {filteredVideos.length === 0 ? (
              <div style={{ ...s.card, textAlign: "center", padding: "48px 28px", color: "#333" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 14 }}>No videos submitted yet</div>
              </div>
            ) : (
              <>
                {["In Review", "Revisions", "Approved", "Completed"].map(status => {
                  const group = filteredVideos.filter(v => v.status === status);
                  if (group.length === 0) return null;
                  return (
                    <div key={status} style={{ marginBottom: 32 }}>
                      <div style={s.sectionTitle}>{status} · {group.length}</div>
                      {group.map(v => (
                        <div key={v.id} style={s.videoCard}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{v.title}</div>
                              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                <span style={s.badge("#888")}>{v.editor}</span>
                                <span style={s.badge("#4da6ff")}>{v.creator}</span>
                                <span style={s.badge("#666")}>{v.campaign}</span>
                                <span style={{ fontSize: 11, color: "#444" }}>{formatDate(v.submittedAt)}</span>
                                {v.revisions > 0 && <span style={s.badge("#ff9f4a")}>{v.revisions} revision{v.revisions > 1 ? "s" : ""}</span>}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <select style={s.statusSelect} value={v.status} onChange={e => {
                                const changes = { status: e.target.value };
                                if (e.target.value === "Approved") changes.approvedAt = Date.now();
                                if (e.target.value === "Revisions") changes.revisions = (v.revisions || 0) + 1;
                                updateVideo(v.id, changes);
                              }}>
                                {STATUS_OPTIONS.map(st => <option key={st}>{st}</option>)}
                              </select>
                              {v.status === "Completed" && (
                                <button onClick={() => updateVideo(v.id, { paid: !v.paid })} style={{ padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: v.paid ? "#0a2a1a" : "#1a1a1a", color: v.paid ? "#4aff9f" : "#555" }}>
                                  {v.paid ? "✓ Paid" : "Mark paid"}
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>Feedback notes</div>
                            <textarea style={s.textarea} placeholder="Leave feedback for the editor..." value={v.notes} onChange={e => updateVideo(v.id, { notes: e.target.value })} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {view === "summary" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Weekly pay summary</div>
              <div style={{ fontSize: 13, color: "#555" }}>Week of {formatDate(weekStart.getTime())} · ${RATE_PER_VIDEO} USD per completed video</div>
            </div>

            {Object.keys(editorSummary).length === 0 ? (
              <div style={{ ...s.card, textAlign: "center", padding: "48px 28px", color: "#333" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 14 }}>No videos submitted this week yet</div>
              </div>
            ) : (
              <>
                {Object.entries(editorSummary).map(([editor, data]) => (
                  <div key={editor} style={s.summaryCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{editor}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span style={s.badge("#4aff9f")}>{data.completed} completed</span>
                        {data.inReview > 0 && <span style={s.badge("#4da6ff")}>{data.inReview} in review</span>}
                        {data.revisions > 0 && <span style={s.badge("#ff9f4a")}>{data.revisions} revisions</span>}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {[["Total submitted", data.total], ["Completed", data.completed], ["Unpaid", data.unpaid]].map(([label, val]) => (
                        <div key={label} style={{ background: "#111", borderRadius: 8, padding: "12px 14px" }}>
                          <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 20, fontWeight: 800 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={s.payRow}>
                      <div>
                        <div style={{ fontSize: 11, color: "#444", marginBottom: 2 }}>Amount owed this week</div>
                        <div style={s.payAmount}>${data.unpaid * RATE_PER_VIDEO} USD</div>
                      </div>
                      <button onClick={() => {
                        const updated = videos.map(v => v.editor === editor && v.status === "Completed" && !v.paid ? { ...v, paid: true } : v);
                        save(updated);
                        showToast(`${editor} marked as paid`);
                      }} style={{ background: "#0a2a1a", border: "1px solid #1a5a3a", color: "#4aff9f", borderRadius: 8, padding: "12px 24px", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}>
                        Mark all paid
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ ...s.card, marginTop: 24 }}>
                  <div style={{ fontSize: 11, color: "#444", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total payout this week</div>
                  <div style={{ fontSize: 32, fontWeight: 800 }}>${Object.values(editorSummary).reduce((sum, d) => sum + d.unpaid * RATE_PER_VIDEO, 0)} USD</div>
                  <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>
                    {Object.values(editorSummary).reduce((sum, d) => sum + d.unpaid, 0)} unpaid completed videos across all editors
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
