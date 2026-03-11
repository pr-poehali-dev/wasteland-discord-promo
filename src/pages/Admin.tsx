import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/2b7f57ad-66ab-4ab7-aa15-899bffa40481";

interface Promocode {
  id: number;
  code: string;
  role_name: string;
  discord_invite: string | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${seg()}-${seg()}-${seg()}`;
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [codes, setCodes] = useState<Promocode[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: generateCode(),
    role_name: "",
    discord_invite: "",
    max_uses: 1,
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const fetchCodes = async (pwd: string) => {
    setLoading(true);
    const res = await fetch(`${API}?admin_password=${encodeURIComponent(pwd)}`);
    const data = await res.json();
    setLoading(false);
    if (res.ok) return data as Promocode[];
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(false);
    const data = await fetchCodes(password);
    setAuthLoading(false);
    if (data !== null) {
      setCodes(data);
      setAuthed(true);
    } else {
      setAuthError(true);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    if (!form.role_name.trim()) { setCreateError("Укажи название роли"); return; }
    setCreating(true);
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, admin_password: password }),
    });
    setCreating(false);
    if (res.ok) {
      setCreateSuccess(`Промокод ${form.code} создан!`);
      setForm({ code: generateCode(), role_name: "", discord_invite: "", max_uses: 1 });
      const updated = await fetchCodes(password);
      if (updated) setCodes(updated);
    } else {
      const d = await res.json();
      setCreateError(d.error || "Ошибка");
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Удалить промокод ${code}?`)) return;
    await fetch(API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, admin_password: password }),
    });
    const updated = await fetchCodes(password);
    if (updated) setCodes(updated);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-radial-wasteland flex items-center justify-center px-4">
        <div className="absolute top-8 left-8 w-8 h-8 border-l border-t border-wasteland-orange opacity-30" />
        <div className="absolute top-8 right-8 w-8 h-8 border-r border-t border-wasteland-orange opacity-30" />
        <div className="absolute bottom-8 left-8 w-8 h-8 border-l border-b border-wasteland-orange opacity-30" />
        <div className="absolute bottom-8 right-8 w-8 h-8 border-r border-b border-wasteland-orange opacity-30" />

        <div className="w-full max-w-xs flex flex-col items-center gap-6 animate-fade-in">
          <div className="flex flex-col items-center gap-2">
            <span className="font-bebas text-5xl tracking-[0.15em] glow-orange" style={{ color: '#F97316' }}>
              ADMIN
            </span>
            <div className="divider-glow w-32" />
            <p className="font-mono text-xs tracking-widest uppercase mt-1" style={{ color: '#8A7A6E' }}>
              ДОСТУП ОГРАНИЧЕН
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
            <div className="relative glow-border rounded-sm">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon name="Lock" size={15} style={{ color: '#F97316', opacity: 0.6 }} />
              </div>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setAuthError(false); }}
                placeholder="••••••••"
                className="input-wasteland w-full h-12 pl-10 pr-4 rounded-sm text-sm"
              />
            </div>
            {authError && (
              <div className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={13} style={{ color: '#ef4444' }} />
                <span className="font-mono text-xs" style={{ color: '#ef4444' }}>Неверный пароль</span>
              </div>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="btn-wasteland h-11 w-full rounded-sm text-xs tracking-widest"
            >
              {authLoading
                ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={14} className="animate-spin" style={{ color: '#0D0B09' }} />ПРОВЕРЯЮ...</span>
                : <span className="flex items-center justify-center gap-2"><Icon name="ShieldCheck" size={14} style={{ color: '#0D0B09' }} />ВОЙТИ</span>
              }
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radial-wasteland px-4 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-bebas text-4xl tracking-[0.12em] glow-orange" style={{ color: '#F97316' }}>
              WASTELAND ADMIN
            </span>
            <div className="divider-glow w-40" />
          </div>
          <a href="/" className="font-mono text-xs tracking-widest uppercase flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: '#8A7A6E' }}>
            <Icon name="ArrowLeft" size={13} style={{ color: '#8A7A6E' }} />
            НА САЙТ
          </a>
        </div>

        {/* Create form */}
        <div className="glow-border rounded-sm p-5 flex flex-col gap-4" style={{ background: 'rgba(13,11,9,0.8)' }}>
          <p className="font-oswald text-sm tracking-widest uppercase" style={{ color: '#F97316' }}>
            НОВЫЙ ПРОМОКОД
          </p>

          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Code */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs tracking-wider uppercase" style={{ color: '#8A7A6E' }}>Код</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="input-wasteland w-full h-10 px-3 rounded-sm text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, code: generateCode() }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <Icon name="RefreshCw" size={13} style={{ color: '#F97316' }} />
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs tracking-wider uppercase" style={{ color: '#8A7A6E' }}>Роль в Discord</label>
                <input
                  type="text"
                  value={form.role_name}
                  onChange={e => setForm(f => ({ ...f, role_name: e.target.value }))}
                  placeholder="Member, VIP..."
                  className="input-wasteland w-full h-10 px-3 rounded-sm text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Invite */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs tracking-wider uppercase" style={{ color: '#8A7A6E' }}>Ссылка-инвайт Discord</label>
                <input
                  type="text"
                  value={form.discord_invite}
                  onChange={e => setForm(f => ({ ...f, discord_invite: e.target.value }))}
                  placeholder="https://discord.gg/..."
                  className="input-wasteland w-full h-10 px-3 rounded-sm text-xs"
                />
              </div>

              {/* Max uses */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs tracking-wider uppercase" style={{ color: '#8A7A6E' }}>Кол-во использований</label>
                <input
                  type="number"
                  min={1}
                  value={form.max_uses}
                  onChange={e => setForm(f => ({ ...f, max_uses: parseInt(e.target.value) || 1 }))}
                  className="input-wasteland w-full h-10 px-3 rounded-sm text-xs"
                />
              </div>
            </div>

            {createError && (
              <div className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={13} style={{ color: '#ef4444' }} />
                <span className="font-mono text-xs" style={{ color: '#ef4444' }}>{createError}</span>
              </div>
            )}
            {createSuccess && (
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" size={13} style={{ color: '#22c55e' }} />
                <span className="font-mono text-xs" style={{ color: '#22c55e' }}>{createSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="btn-wasteland h-10 w-full rounded-sm text-xs tracking-widest mt-1"
            >
              {creating
                ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={14} className="animate-spin" style={{ color: '#0D0B09' }} />СОЗДАЮ...</span>
                : <span className="flex items-center justify-center gap-2"><Icon name="Plus" size={14} style={{ color: '#0D0B09' }} />СОЗДАТЬ ПРОМОКОД</span>
              }
            </button>
          </form>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="font-oswald text-sm tracking-widest uppercase" style={{ color: '#F97316' }}>
              ПРОМОКОДЫ ({codes.length})
            </p>
            <button
              onClick={() => fetchCodes(password).then(d => { if (d) setCodes(d); })}
              className="font-mono text-xs tracking-widest uppercase flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: '#8A7A6E' }}
            >
              <Icon name="RefreshCw" size={12} style={{ color: '#8A7A6E' }} />
              ОБНОВИТЬ
            </button>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <Icon name="Loader2" size={24} className="animate-spin" style={{ color: '#F97316' }} />
            </div>
          )}

          {!loading && codes.length === 0 && (
            <div className="text-center py-10 font-mono text-xs tracking-widest uppercase" style={{ color: '#3D3028' }}>
              НЕТ ПРОМОКОДОВ
            </div>
          )}

          {codes.map(c => (
            <div
              key={c.id}
              className="rounded-sm p-4 flex items-center justify-between gap-4"
              style={{ background: 'rgba(13,11,9,0.7)', border: '1px solid rgba(249,115,22,0.12)' }}
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm tracking-widest" style={{ color: '#F97316' }}>{c.code}</span>
                  {!c.is_active && (
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm" style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
                      ОТКЛ
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs" style={{ color: '#8A7A6E' }}>
                    Роль: <span style={{ color: '#C2C0BC' }}>{c.role_name}</span>
                  </span>
                  <span className="font-mono text-xs" style={{ color: '#8A7A6E' }}>
                    Использований: <span style={{ color: c.used_count >= (c.max_uses ?? Infinity) ? '#ef4444' : '#C2C0BC' }}>
                      {c.used_count}/{c.max_uses ?? '∞'}
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(c.id, c.code)}
                className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity hover:text-red-500"
              >
                <Icon name="Trash2" size={16} style={{ color: '#ef4444' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
