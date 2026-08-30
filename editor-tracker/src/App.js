import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fkwjvbwookbuifbikupj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrd2p2Yndvb2tidWlmYmlrdXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMDg2OTQsImV4cCI6MjEwMTc4NDY5NH0.xU0VpSKnDpnsrXGvZgC-Btvm33HOxLDqRF60LyPnw84";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin emails — add yours here
const ADMIN_EMAILS = ["tearaibryers@gmail.com"];

const CAMPAIGNS = ["Select campaign...", "Result", "Peak Height", "Recreate (OLD)", "DARE", "FOLK", "ROAST"];
const CREATORS = ["Select creator...", "Te Arai", "Lucas"];
const VIDEO_TYPES = ["Select type...", "Original", "Repost edit"];
const RATE_PER_VIDEO = 5;
const RATE_REPOST = 2.50;

const STATUS_OPTIONS = ["Completed"];

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

// ─── Auth Screen ────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    onAuth(data.user);
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name.trim() } }
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess("Account created! You can now log in.");
    setMode("login");
    setLoading(false);
  };

  const s = {
    wrap: { minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Arial',sans-serif" },
    box: { background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "40px 36px", width: "100%", maxWidth: 400 },
    logo: { fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", color: "#e8e4dc", textTransform: "uppercase", marginBottom: 4 },
    sub: { fontSize: 11, color: "#444", marginBottom: 32 },
    label: { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#555", textTransform: "uppercase", marginBottom: 6, display: "block" },
    input: { width: "100%", background: "#0d0d0d", border: "1px solid #222", borderRadius: 8, padding: "12px 14px", color: "#e8e4dc", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 },
    btn: { width: "100%", background: "#e8e4dc", color: "#0d0d0d", border: "none", borderRadius: 8, padding: "14px", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", cursor: "pointer", marginTop: 8 },
    toggle: { textAlign: "center", marginTop: 20, fontSize: 12, color: "#444" },
    toggleLink: { color: "#e8e4dc", cursor: "pointer", fontWeight: 600, marginLeft: 4 },
    error: { background: "#2a0a0a", border: "1px solid #5a1a1a", color: "#ff6b6b", borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 16 },
    success: { background: "#0a2a1a", border: "1px solid #1a5a3a", color: "#4aff9f", borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 16 },
  };

  return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={s.logo}>UGC Creative Tracker</div>
        <div style={s.sub}>Te Arai Bryers · Editor Portal</div>
        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}
        {mode === "signup" && (
          <>
            <label style={s.label}>Your name</label>
            <input style={s.input} placeholder="e.g. Geoff" value={name} onChange={e => setName(e.target.value)} />
          </>
        )}
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label style={s.label}>Password</label>
        <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())} />
        <button style={s.btn} onClick={mode === "login" ? handleLogin : handleSignup} disabled={loading}>
          {loading ? "..." : mode === "login" ? "Log in" : "Create account"}
        </button>
        <div style={s.toggle}>
          {mode === "login" ? "New editor?" : "Already have an account?"}
          <span style={s.toggleLink} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccess(null); }}>
            {mode === "login" ? " Create account" : " Log in"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function EditorTracker() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [videos, setVideos] = useState([]);
  const [view, setView] = useState("upload");
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({ creator: "", campaign: "", title: "", video_type: "", file: null });
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterCreator, setFilterCreator] = useState("All");
  const [loading, setLoading] = useState(true);
  const fileRef = useRef();

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsAdmin(ADMIN_EMAILS.includes(session.user.email));
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAdmin(ADMIN_EMAILS.includes(session.user.email));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch videos from Supabase
  const fetchVideos = useCallback(async () => {
    if (!user) return;
    let query = supabase.from("submissions").select("*").order("created_at", { ascending: false });
    if (!ADMIN_EMAILS.includes(user.email)) {
      query = query.eq("editor_id", user.id);
    }
    const { data, error } = await query;
    if (!error && data) setVideos(data);
  }, [user]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("submissions-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, () => fetchVideos())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, fetchVideos]);

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

  const handleSubmit = async () => {
    if (!form.creator || form.creator === "Select creator..." ||
        !form.campaign || form.campaign === "Select campaign..." ||
        !form.video_type || form.video_type === "Select type..." ||
        !form.title || !form.file) {
      showToast("Please fill in all fields and upload a file.", "error");
      return;
    }
    const editorName = user.user_metadata?.display_name || user.email;
    const { error } = await supabase.from("submissions").insert([{
      editor_id: user.id,
      editor_name: editorName,
      creator: form.creator,
      campaign: form.campaign,
      title: form.title,
      video_type: form.video_type,
      status: "In Review",
      feedback: "",
      paid: false,
    }]);
    if (error) { showToast("Submission failed. Try again.", "error"); return; }
    setForm({ creator: "", campaign: "", title: "", video_type: "", file: null });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    fetchVideos();
  };

  const updateVideo = async (id, changes) => {
    await supabase.from("submissions").update(changes).eq("id", id);
    fetchVideos();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setVideos([]);
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", color: "#444", fontFamily: "Inter,sans-serif", fontSize: 13 }}>Loading...</div>;
  if (!user) return <AuthScreen onAuth={(u) => { setUser(u); setIsAdmin(ADMIN_EMAILS.includes(u.email)); }} />;

  const weekStart = getWeekStart();
  const thisWeek = videos.filter(v => new Date(v.created_at) >= weekStart);
  const editorSummary = {};
  thisWeek.forEach(v => {
    if (!editorSummary[v.editor_name]) editorSummary[v.editor_name] = { total: 0, completed: 0, inReview: 0, revisions: 0, unpaidAmount: 0 };
    editorSummary[v.editor_name].total++;
    const rate = v.video_type === "Repost edit" ? RATE_REPOST : RATE_PER_VIDEO;
    if (v.status === "Completed") { editorSummary[v.editor_name].completed++; if (!v.paid) editorSummary[v.editor_name].unpaidAmount += rate; }
    if (v.status === "In Review") editorSummary[v.editor_name].inReview++;
    if (v.status === "Revisions") editorSummary[v.editor_name].revisions++;
  });

  const filteredVideos = filterCreator === "All" ? videos : videos.filter(v => v.creator === filterCreator);
  const inReviewAll = videos.filter(v => v.status === "In Review");
  const editorName = user.user_metadata?.display_name || user.email;

  const s = {
    app: { minHeight: "100vh", background: "#0d0d0d", color: "#e8e4dc", fontFamily: "'Inter', 'Arial', sans-serif" },
    header: { borderBottom: "1px solid #1e1e1e", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0d0d", position: "sticky", top: 0, zIndex: 100 },
    logo: { fontSize: 15, fontWeight: 700, letterSpacing: "0.15em", color: "#e8e4dc", textTransform: "uppercase" },
    sub: { fontSize: 11, color: "#555", letterSpacing: "0.1em", marginTop: 2 },
    nav: { display: "flex", gap: 4, alignItems: "center" },
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
    signOut: { padding: "6px 14px", borderRadius: 6, border: "1px solid #222", cursor: "pointer", fontSize: 11, fontWeight: 600, background: "transparent", color: "#555", marginLeft: 8 },
    adminBadge: { fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#4da6ff", background: "#1a2a3a", border: "1px solid #1e3a5a", borderRadius: 4, padding: "2px 8px", marginLeft: 8, textTransform: "uppercase" },
  };

  // Editor-only nav tabs (no Pay Summary for editors)
  const navTabs = isAdmin
    ? [["upload", "Upload"], ["tracker", "Tracker"], ["summary", "Pay Summary"]]
    : [["upload", "Upload"], ["tracker", "My Submissions"]];

  return (
    <div style={s.app}>
      {toast && <div style={s.toast(toast.type)}>{toast.msg}</div>}

      <div style={s.header}>
        <div>
          <div style={s.logo}>
            UGC Creative Tracker
            {isAdmin && <span style={s.adminBadge}>Admin</span>}
          </div>
          <div style={s.sub}>{isAdmin ? "Te Arai Bryers · All Editors" : `${editorName} · Editor`}</div>
        </div>
        <div style={s.nav}>
          {navTabs.map(([v, l]) => (
            <button key={v} style={s.navBtn(view === v)} onClick={() => setView(v)}>{l}</button>
          ))}
          <button style={s.signOut} onClick={handleSignOut}>Sign out</button>
        </div>
      </div>

      <div style={s.main}>

        {/* ── Upload Tab ── */}
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
                <div style={{ fontSize: 13, color: "#555" }}>The creator will review and leave feedback shortly.</div>
              </div>
            ) : (
              <div style={s.card}>
                {/* Editor name auto-filled from login */}
                <div style={{ marginBottom: 16, padding: "12px 14px", background: "#0d0d0d", border: "1px solid #222", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "#444", marginBottom: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>Submitting as</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e4dc" }}>{editorName}</div>
                </div>

                <div style={s.row}>
                  <div style={s.col}>
                    <label style={s.label}>Creator</label>
                    <select style={s.select} value={form.creator} onChange={e => setForm(f => ({ ...f, creator: e.target.value }))}>
                      {CREATORS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={s.col}>
                    <label style={s.label}>Campaign</label>
                    <select style={s.select} value={form.campaign} onChange={e => setForm(f => ({ ...f, campaign: e.target.value }))}>
                      {CAMPAIGNS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={s.row}>
                  <div style={s.col}>
                    <label style={s.label}>Video title</label>
                    <input style={s.input} placeholder="e.g. REGEN_Week1_TeArai_v1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div style={s.col}>
                    <label style={s.label}>Video type</label>
                    <select style={s.select} value={form.video_type} onChange={e => setForm(f => ({ ...f, video_type: e.target.value }))}>
                      {VIDEO_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 6 }}>Original = $5.00 · Repost edit = $2.50</div>
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

        {/* ── Tracker Tab ── */}
        {view === "tracker" && (
          <div>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{isAdmin ? "Video tracker" : "My submissions"}</div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  {isAdmin ? "Review submissions, leave feedback, and update statuses." : "Track your submitted videos and feedback."}
                </div>
              </div>
              {isAdmin && (
                <div style={{ display: "flex", gap: 6 }}>
                  {["All", "Te Arai", "Lucas"].map(c => (
                    <button key={c} style={s.filterBtn(filterCreator === c)} onClick={() => setFilterCreator(c)}>{c}</button>
                  ))}
                </div>
              )}
            </div>

            {isAdmin && inReviewAll.length > 0 && (
              <div style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "8px 14px", background: "#1a2a3a", borderRadius: 8, marginBottom: 24 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#4da6ff" }}>⚡ {inReviewAll.length} video{inReviewAll.length > 1 ? "s" : ""} waiting for review</span>
              </div>
            )}

            {filteredVideos.length === 0 ? (
              <div style={{ ...s.card, textAlign: "center", padding: "48px 28px", color: "#333" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 14 }}>No videos submitted yet</div>
              </div>
            ) : (
              <>
                {STATUS_OPTIONS.map(status => {
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
                                <span style={s.badge("#888")}>{v.editor_name}</span>
                                <span style={s.badge("#4da6ff")}>{v.creator}</span>
                                <span style={s.badge("#666")}>{v.campaign}</span>
                                <span style={s.badge(v.video_type === "Repost edit" ? "#a09fff" : "#4aff9f")}>{v.video_type || "Original"}</span>
                                <span style={{ fontSize: 11, color: "#444" }}>{formatDate(v.created_at)}</span>
                              </div>
                            </div>
                            {isAdmin && (
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <select style={s.statusSelect} value={v.status} onChange={e => {
                                  const changes = { status: e.target.value };
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
                            )}
                            {!isAdmin && (
                              <div style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: status === "Approved" ? "#0a2a1a" : status === "Revisions" ? "#2a1a0a" : "#1a1a2a", color: status === "Approved" ? "#4aff9f" : status === "Revisions" ? "#ff9f4a" : "#4da6ff" }}>
                                {status}
                              </div>
                            )}
                          </div>
                          {/* Feedback — editable by admin, read-only for editors */}
                          <div>
                            <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>Feedback</div>
                            {isAdmin ? (
                              <textarea style={s.textarea} placeholder="Leave feedback for the editor..." value={v.feedback || ""} onChange={e => updateVideo(v.id, { feedback: e.target.value })} />
                            ) : (
                              <div style={{ ...s.textarea, background: "#0d0d0d", color: v.feedback ? "#888" : "#333", cursor: "default" }}>
                                {v.feedback || "No feedback yet"}
                              </div>
                            )}
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

        {/* ── Pay Summary Tab (Admin only) ── */}
        {view === "summary" && isAdmin && (
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
                      {[["Total submitted", data.total], ["Completed", data.completed], ["Unpaid amount", `$${data.unpaidAmount.toFixed(2)}`]].map(([label, val]) => (
                        <div key={label} style={{ background: "#111", borderRadius: 8, padding: "12px 14px" }}>
                          <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 20, fontWeight: 800 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={s.payRow}>
                      <div>
                        <div style={{ fontSize: 11, color: "#444", marginBottom: 2 }}>Amount owed this week</div>
                        <div style={s.payAmount}>${data.unpaidAmount.toFixed(2)} USD</div>
                      </div>
                      <button onClick={async () => {
                        const toUpdate = videos.filter(v => v.editor_name === editor && v.status === "Completed" && !v.paid);
                        for (const v of toUpdate) {
                          await supabase.from("submissions").update({ paid: true }).eq("id", v.id);
                        }
                        fetchVideos();
                        showToast(`${editor} marked as paid`);
                      }} style={{ background: "#0a2a1a", border: "1px solid #1a5a3a", color: "#4aff9f", borderRadius: 8, padding: "12px 24px", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}>
                        Mark all paid
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ ...s.card, marginTop: 24 }}>
                  <div style={{ fontSize: 11, color: "#444", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total payout this week</div>
                  <div style={{ fontSize: 32, fontWeight: 800 }}>${Object.values(editorSummary).reduce((sum, d) => sum + d.unpaidAmount, 0).toFixed(2)} USD</div>
                  <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>
                    Across all editors this week
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
