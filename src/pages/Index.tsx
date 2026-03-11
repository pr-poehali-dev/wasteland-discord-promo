import { useState } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/2b7f57ad-66ab-4ab7-aa15-899bffa40481";

function genCode() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const s = () => Array.from({ length: 4 }, () => c[Math.floor(Math.random() * c.length)]).join("");
  return `${s()}-${s()}-${s()}`;
}

interface Promo {
  id: number;
  code: string;
  role_name: string;
  discord_invite: string | null;
  max_uses: number;
  used_count: number;
  is_active: boolean;
}

// ─── ADMIN PANEL ──────────────────────────────────────────────
function AdminPanel({ onClose }: { onClose: () => void }) {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadErr, setLoadErr] = useState("");
  const [form, setForm] = useState({ code: genCode(), role_name: "", discord_invite: "", max_uses: 1 });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(false);

  const PASS = "adminbegemotik2004";

  const loadPromos = async () => {
    setLoadErr("");
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list", admin_password: PASS }),
    });
    const data = await res.json();
    if (res.ok) { setPromos(data); setLoaded(true); }
    else setLoadErr(data.error || "Ошибка загрузки");
  };

  if (!loaded) { loadPromos(); }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setMsgOk(false);
    if (!form.role_name.trim()) { setMsg("Укажи роль"); return; }
    setCreating(true);
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", admin_password: PASS, ...form }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setMsg(`✓ Промокод ${form.code} создан`);
      setMsgOk(true);
      setForm({ code: genCode(), role_name: "", discord_invite: "", max_uses: 1 });
      loadPromos();
    } else {
      setMsg(data.error || "Ошибка");
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Удалить ${code}?`)) return;
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", admin_password: PASS, id }),
    });
    loadPromos();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ background: 'rgba(13,11,9,0.97)' }}>
      <div className="w-full max-w-lg flex flex-col gap-5 animate-scale-in overflow-y-auto max-h-[90vh]">

        <div className="flex items-center justify-between">
          <span className="font-bebas text-3xl tracking-[0.12em] glow-orange" style={{ color: '#F97316' }}>ADMIN PANEL</span>
          <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
            <Icon name="X" size={20} style={{ color: '#8A7A6E' }} />
          </button>
        </div>
        <div className="divider-glow" />

        {/* Create form */}
        <form onSubmit={handleCreate} className="flex flex-col gap-3 p-4 rounded-sm" style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.15)' }}>
          <p className="font-mono text-xs tracking-widest uppercase" style={{ color: '#F97316' }}>НОВЫЙ ПРОМОКОД</p>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs" style={{ color: '#8A7A6E' }}>КОД</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="input-wasteland w-full h-9 px-3 pr-8 rounded-sm text-xs"
                />
                <button type="button" onClick={() => setForm(f => ({ ...f, code: genCode() }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity">
                  <Icon name="RefreshCw" size={12} style={{ color: '#F97316' }} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs" style={{ color: '#8A7A6E' }}>РОЛЬ В DISCORD</label>
              <input
                type="text"
                value={form.role_name}
                onChange={e => setForm(f => ({ ...f, role_name: e.target.value }))}
                placeholder="VIP, Member..."
                className="input-wasteland w-full h-9 px-3 rounded-sm text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs" style={{ color: '#8A7A6E' }}>DISCORD ИНВАЙТ</label>
              <input
                type="text"
                value={form.discord_invite}
                onChange={e => setForm(f => ({ ...f, discord_invite: e.target.value }))}
                placeholder="discord.gg/..."
                className="input-wasteland w-full h-9 px-3 rounded-sm text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs" style={{ color: '#8A7A6E' }}>ИСПОЛЬЗОВАНИЙ</label>
              <input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: parseInt(e.target.value) || 1 }))}
                className="input-wasteland w-full h-9 px-3 rounded-sm text-xs"
              />
            </div>
          </div>

          {msg && (
            <span className="font-mono text-xs" style={{ color: msgOk ? '#22c55e' : '#ef4444' }}>{msg}</span>
          )}

          <button type="submit" disabled={creating} className="btn-wasteland h-9 w-full rounded-sm text-xs tracking-widest">
            {creating
              ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={13} className="animate-spin" style={{ color: '#0D0B09' }} />СОЗДАЮ...</span>
              : <span className="flex items-center justify-center gap-2"><Icon name="Plus" size={13} style={{ color: '#0D0B09' }} />СОЗДАТЬ</span>
            }
          </button>
        </form>

        {/* List */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs tracking-widest uppercase" style={{ color: '#F97316' }}>
              ПРОМОКОДЫ {promos.length > 0 && `(${promos.length})`}
            </p>
            <button onClick={loadPromos} className="opacity-40 hover:opacity-100 transition-opacity">
              <Icon name="RefreshCw" size={13} style={{ color: '#8A7A6E' }} />
            </button>
          </div>

          {loadErr && <p className="font-mono text-xs" style={{ color: '#ef4444' }}>{loadErr}</p>}

          {promos.length === 0 && !loadErr && (
            <p className="font-mono text-xs text-center py-4 tracking-widest" style={{ color: '#3D3028' }}>НЕТ ПРОМОКОДОВ</p>
          )}

          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
            {promos.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-sm"
                style={{ background: 'rgba(13,11,9,0.6)', border: '1px solid rgba(249,115,22,0.1)' }}>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-mono text-sm tracking-wider" style={{ color: '#F97316' }}>{p.code}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs" style={{ color: '#8A7A6E' }}>{p.role_name}</span>
                    <span className="font-mono text-xs" style={{ color: p.used_count >= p.max_uses ? '#ef4444' : '#3D3028' }}>
                      {p.used_count}/{p.max_uses}
                    </span>
                    {p.discord_invite && (
                      <span className="font-mono text-xs truncate" style={{ color: '#3D3028' }}>{p.discord_invite}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(p.id, p.code)} className="opacity-30 hover:opacity-100 transition-opacity flex-shrink-0">
                  <Icon name="Trash2" size={14} style={{ color: '#ef4444' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────
export default function Index() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<{ role_name?: string; discord_invite?: string; error?: string } | null>(null);
  const [shake, setShake] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { triggerShake(); return; }
    setStatus("loading");
    setResult(null);
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "activate", code: code.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setResult(data);
    } else {
      setStatus("error");
      setResult(data);
      triggerShake();
    }
  };

  // 5 кликов по аватарке — открыть админку
  const handleLogoClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 5) { setAdminOpen(true); setClickCount(0); }
  };

  return (
    <div className="min-h-screen bg-radial-wasteland flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}

      {/* Background lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-wasteland-dust to-transparent opacity-40" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-wasteland-dust to-transparent opacity-40" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-wasteland-dust to-transparent opacity-30" />
      </div>

      <div className="absolute top-8 left-8 w-8 h-8 border-l border-t border-wasteland-orange opacity-30" />
      <div className="absolute top-8 right-8 w-8 h-8 border-r border-t border-wasteland-orange opacity-30" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-l border-b border-wasteland-orange opacity-30" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-r border-b border-wasteland-orange opacity-30" />

      <div className="flex flex-col items-center w-full max-w-sm gap-0 z-10">

        {/* Avatar — 5 кликов = админка */}
        <button
          onClick={handleLogoClick}
          className="w-24 h-24 rounded-full overflow-hidden avatar-ring mb-6 animate-scale-in animate-flicker focus:outline-none cursor-default"
          tabIndex={-1}
        >
          <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="96" height="96" fill="#1A1109" />
            <circle cx="48" cy="48" r="34" fill="#2A1E10" />
            <circle cx="48" cy="38" r="14" fill="#3D2A14" />
            <circle cx="48" cy="72" r="22" fill="#3D2A14" />
            <ellipse cx="41" cy="36" rx="4" ry="5" fill="#0D0B09" />
            <ellipse cx="55" cy="36" rx="4" ry="5" fill="#0D0B09" />
            <ellipse cx="41" cy="36" rx="2.5" ry="3.5" fill="#F97316" />
            <ellipse cx="55" cy="36" rx="2.5" ry="3.5" fill="#F97316" />
            <ellipse cx="41" cy="36" rx="5" ry="6" fill="none" stroke="#F97316" strokeWidth="0.5" opacity="0.4" />
            <ellipse cx="55" cy="36" rx="5" ry="6" fill="none" stroke="#F97316" strokeWidth="0.5" opacity="0.4" />
            <path d="M34 44 Q48 52 62 44 L64 58 Q48 68 32 58 Z" fill="#2A1E10" />
            <circle cx="43" cy="54" r="3" fill="#1A1109" />
            <circle cx="53" cy="54" r="3" fill="#1A1109" />
            <rect x="38" y="57" width="8" height="5" rx="2" fill="#F97316" opacity="0.6" />
            <rect x="50" y="57" width="8" height="5" rx="2" fill="#F97316" opacity="0.6" />
            <circle cx="48" cy="48" r="33" stroke="#F97316" strokeWidth="0.5" opacity="0.25" />
          </svg>
        </button>

        {/* Title */}
        <div className="flex flex-col items-center mb-1 gap-1 animate-fade-in">
          <h1 className="font-bebas text-7xl tracking-[0.15em] glow-orange animate-flicker" style={{ color: '#F97316', lineHeight: 1 }}>
            WASTELAND
          </h1>
          <div className="divider-glow w-48 mt-1" />
        </div>

        <p className="font-mono text-xs tracking-widest uppercase mb-8 mt-2 animate-fade-in" style={{ color: '#8A7A6E' }}>
          ВВЕДИ ПРОМОКОД — ПОЛУЧИ РОЛЬ
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`w-full flex flex-col gap-3 animate-fade-in ${shake ? "animate-shake" : ""}`}
        >
          <div className="relative glow-border rounded-sm">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon name="KeyRound" size={16} style={{ color: '#F97316', opacity: 0.6 }} />
            </div>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setStatus("idle"); setResult(null); }}
              placeholder="XXXX-XXXX-XXXX"
              maxLength={20}
              autoComplete="off"
              spellCheck={false}
              className="input-wasteland w-full h-14 pl-10 pr-4 rounded-sm text-base"
            />
          </div>

          <div className="min-h-5 flex flex-col items-center gap-2">
            {status === "error" && result && (
              <div className="flex items-center gap-2 animate-fade-in">
                <Icon name="AlertTriangle" size={13} style={{ color: '#ef4444' }} />
                <span className="font-mono text-xs" style={{ color: '#ef4444' }}>{result.error}</span>
              </div>
            )}
            {status === "success" && result && (
              <div className="flex flex-col items-center gap-3 animate-fade-in w-full">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={13} style={{ color: '#22c55e' }} />
                  <span className="font-mono text-xs" style={{ color: '#22c55e' }}>
                    Активировано! Роль: <strong>{result.role_name}</strong>
                  </span>
                </div>
                {result.discord_invite && (
                  <a
                    href={result.discord_invite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-wasteland h-10 w-full rounded-sm text-xs tracking-widest flex items-center justify-center gap-2"
                  >
                    <Icon name="ExternalLink" size={13} style={{ color: '#0D0B09' }} />
                    ВОЙТИ В DISCORD
                  </a>
                )}
              </div>
            )}
          </div>

          {status !== "success" && (
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-wasteland h-12 w-full rounded-sm text-sm tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading"
                ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={16} className="animate-spin" style={{ color: '#0D0B09' }} />ПРОВЕРЯЮ...</span>
                : <span className="flex items-center justify-center gap-2"><Icon name="Zap" size={16} style={{ color: '#0D0B09' }} />АКТИВИРОВАТЬ</span>
              }
            </button>
          )}
        </form>

        <div className="mt-8 flex items-center gap-2 animate-fade-in">
          <div className="w-2 h-2 rounded-full" style={{ background: '#F97316', boxShadow: '0 0 6px #F97316' }} />
          <span className="font-mono text-xs" style={{ color: '#3D3028' }}>DISCORD.GG/WASTELAND</span>
          <div className="w-2 h-2 rounded-full" style={{ background: '#F97316', boxShadow: '0 0 6px #F97316' }} />
        </div>
      </div>
    </div>
  );
}
