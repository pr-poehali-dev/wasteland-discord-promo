import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

type Status = "idle" | "loading" | "success" | "error";

export default function Index() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      triggerShake();
      return;
    }
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("error");
    setMessage("Промокод не найден — проверь и попробуй снова");
    triggerShake();
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase());
    if (status !== "idle") {
      setStatus("idle");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-radial-wasteland flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Background decorative lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-wasteland-dust to-transparent opacity-40" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-wasteland-dust to-transparent opacity-40" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-wasteland-dust to-transparent opacity-30" />
      </div>

      {/* Corner marks */}
      <div className="absolute top-8 left-8 w-8 h-8 border-l border-t border-wasteland-orange opacity-30 animate-fade-in" />
      <div className="absolute top-8 right-8 w-8 h-8 border-r border-t border-wasteland-orange opacity-30 animate-fade-in" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-l border-b border-wasteland-orange opacity-30 animate-fade-in" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-r border-b border-wasteland-orange opacity-30 animate-fade-in" />

      {/* Main content */}
      <div className="flex flex-col items-center w-full max-w-sm gap-0 z-10">

        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden avatar-ring mb-6 animate-scale-in animate-flicker">
          <svg
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
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
        </div>

        {/* Title */}
        <div className="flex flex-col items-center mb-1 gap-1 animate-fade-in">
          <h1
            className="font-bebas text-7xl tracking-[0.15em] glow-orange animate-flicker"
            style={{ color: '#F97316', lineHeight: 1 }}
          >
            WASTELAND
          </h1>
          <div className="divider-glow w-48 mt-1" />
        </div>

        {/* Subtitle */}
        <p
          className="font-mono text-xs tracking-widest uppercase mb-8 mt-2 animate-fade-in"
          style={{ color: '#8A7A6E' }}
        >
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
              ref={inputRef}
              type="text"
              value={code}
              onChange={handleChange}
              placeholder="XXXX-XXXX-XXXX"
              maxLength={20}
              autoComplete="off"
              spellCheck={false}
              className="input-wasteland w-full h-14 pl-10 pr-4 rounded-sm text-base"
            />
          </div>

          <div className="h-5 flex items-center justify-center">
            {status === "error" && (
              <div className="flex items-center gap-2 animate-fade-in">
                <Icon name="AlertTriangle" size={13} style={{ color: '#ef4444' }} />
                <span className="font-mono text-xs" style={{ color: '#ef4444' }}>
                  {message}
                </span>
              </div>
            )}
            {status === "success" && (
              <div className="flex items-center gap-2 animate-fade-in">
                <Icon name="CheckCircle" size={13} style={{ color: '#22c55e' }} />
                <span className="font-mono text-xs" style={{ color: '#22c55e' }}>
                  {message}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-wasteland h-12 w-full rounded-sm text-sm tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <Icon name="Loader2" size={16} className="animate-spin" style={{ color: '#0D0B09' }} />
                ПРОВЕРЯЮ...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Icon name="Zap" size={16} style={{ color: '#0D0B09' }} />
                АКТИВИРОВАТЬ
              </span>
            )}
          </button>
        </form>

        {/* Footer hint */}
        <div className="mt-8 flex items-center gap-2 animate-fade-in">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#F97316', boxShadow: '0 0 6px #F97316' }}
          />
          <span className="font-mono text-xs" style={{ color: '#3D3028' }}>
            DISCORD.GG/WASTELAND
          </span>
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#F97316', boxShadow: '0 0 6px #F97316' }}
          />
        </div>
      </div>
    </div>
  );
}
