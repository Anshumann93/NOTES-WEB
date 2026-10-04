import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";


function Logo() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="12" fill="url(#lg1)" />
      <path d="M12 16h20M12 22h14M12 28h18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="28" r="5" fill="url(#lg2)" />
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="lg2" x1="27" y1="23" x2="37" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function AuthInput({ type, placeholder, value, onChange, icon, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)",
        color: focused ? "#6366f1" : "rgba(148,163,184,0.55)",
        transition: "color 0.2s", pointerEvents: "none",
        display: "flex", alignItems: "center"
      }}>
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        style={{
          width: "100%",
          padding: "14px 16px 14px 46px",
          borderRadius: "14px",
          border: `1.5px solid ${focused ? "#6366f1" : "rgba(255,255,255,0.08)"}`,
          background: focused ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.03)",
          color: "#f8fafc",
          fontSize: "0.92rem",
          outline: "none",
          transition: "all 0.22s ease",
          boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      />
    </div>
  );
}

export default function Auth() {
  const { login, register, guestLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const switchMode = () => {
    setIsLogin(v => !v);
    setError("");
    setSuccess("");
    setName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
        setSuccess("Account created! Logging you in...");
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const pills = ["✍️ Handwritten Notes", "🤖 AI Transcriber", "🧠 Mind Maps", "🔗 YouTube → Notes", "📊 Flowcharts"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap');

        @keyframes authOrbFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(60px,-80px) scale(1.1); }
          66%      { transform: translate(-40px,40px) scale(0.95); }
        }
        @keyframes authOrbFloat2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-70px,60px) scale(1.08); }
          70%      { transform: translate(50px,-50px) scale(0.92); }
        }
        @keyframes authOrbFloat3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,80px) scale(1.15); }
        }
        @keyframes authParticleRise {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes authShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes authSpin { to { transform: rotate(360deg); } }
        @keyframes authAlertIn {
          0%   { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes authCardIn {
          0%   { opacity: 0; transform: translateY(36px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .auth-bg-orb { position: absolute; border-radius: 50%; filter: blur(90px); }
        .auth-bg-orb-1 {
          width: 650px; height: 650px;
          background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
          top: -220px; left: -120px;
          animation: authOrbFloat1 18s ease-in-out infinite;
        }
        .auth-bg-orb-2 {
          width: 540px; height: 540px;
          background: radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%);
          bottom: -160px; right: -110px;
          animation: authOrbFloat2 22s ease-in-out infinite;
        }
        .auth-bg-orb-3 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 70%);
          top: 38%; left: 58%;
          animation: authOrbFloat3 16s ease-in-out infinite;
        }
        .auth-card-anim { animation: authCardIn 0.65s cubic-bezier(0.16,1,0.3,1) forwards; }
        .auth-btn {
          position: relative; width: 100%; height: 50px; border: none;
          border-radius: 14px; font-size: 0.95rem; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; overflow: hidden; color: #fff; letter-spacing: 0.025em;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
          background-size: 200% auto;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-position 0.4s ease;
        }
        .auth-btn:hover:not(:disabled) {
          background-position: right center; transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(99,102,241,0.52);
        }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.68; cursor: not-allowed; }
        .auth-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 50%, transparent 100%);
          background-size: 200% auto; animation: authShimmer 2.2s linear infinite;
        }
        .auth-link-btn {
          background: none; border: none; color: #818cf8; cursor: pointer;
          font-weight: 700; font-size: 0.875rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: color 0.18s; padding: 0;
        }
        .auth-link-btn:hover { color: #a5b4fc; text-decoration: underline; }
        .auth-spinner {
          display: inline-block; width: 17px; height: 17px;
          border: 2.5px solid rgba(255,255,255,0.28); border-top-color: #fff;
          border-radius: 50%; animation: authSpin 0.65s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }
        .auth-alert { animation: authAlertIn 0.28s ease forwards; }
        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          color: rgba(148,163,184,0.38); font-size: 0.8rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07);
        }
        input::placeholder { color: rgba(148,163,184,0.45); }
      `}</style>

      {/* Full-page background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 130% 90% at 50% -5%, #0d0f21 0%, #080c14 50%, #040608 100%)"
        }} />
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-orb auth-bg-orb-3" />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.045) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(99,102,241,0.045) 1px, transparent 1px)",
          backgroundSize: "58px 58px"
        }} />
        {Array.from({ length: 18 }, (_, i) => {
          const colors = ["#6366f1","#8b5cf6","#06b6d4","#10b981"];
          const size = 1.2 + (i % 3) * 1.2;
          const color = colors[i % 4];
          return (
            <div key={i} style={{
              position: "absolute",
              left: `${(i * 5.5) % 100}%`,
              bottom: "-8px",
              width: `${size}px`, height: `${size}px`,
              borderRadius: "50%", background: color,
              opacity: 0.25 + (i % 3) * 0.1,
              boxShadow: `0 0 ${size * 3}px ${color}`,
              animation: `authParticleRise ${14 + (i % 10)}s ${(i * 0.7) % 8}s linear infinite`
            }} />
          );
        })}
      </div>

      {/* Page center */}
      <div style={{
        position: "relative", zIndex: 2,
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        {/* Card */}
        <div
          className={visible ? "auth-card-anim" : ""}
          style={{
            width: "100%", maxWidth: "440px",
            background: "rgba(12,18,36,0.8)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "28px",
            padding: "42px 38px",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.65)," +
              "0 0 0 1px rgba(99,102,241,0.14)," +
              "inset 0 1px 0 rgba(255,255,255,0.055)",
            display: "flex", flexDirection: "column"
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
              <Logo />
            </div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "3px 13px", borderRadius: "999px",
              border: "1px solid rgba(99,102,241,0.28)",
              background: "rgba(99,102,241,0.08)",
              fontSize: "0.73rem", fontWeight: 600,
              color: "#a5b4fc", letterSpacing: "0.045em",
              marginBottom: "16px"
            }}>
              ✦ StudyShell AI Notes
            </span>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1.9rem", fontWeight: 800,
              background: "linear-gradient(135deg,#f8fafc 0%,#a5b4fc 55%,#67e8f9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: "0 0 8px", lineHeight: 1.2
            }}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p style={{ color: "rgba(148,163,184,0.75)", fontSize: "0.875rem", margin: 0 }}>
              {isLogin
                ? "Sign in to access your AI-generated notes"
                : "Join thousands learning smarter with AI"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-alert" style={{
              background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.22)",
              color: "#fda4af", borderRadius: "12px", padding: "11px 15px",
              fontSize: "0.845rem", display: "flex", alignItems: "center", gap: "8px",
              marginBottom: "18px"
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="auth-alert" style={{
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.22)",
              color: "#6ee7b7", borderRadius: "12px", padding: "11px 15px",
              fontSize: "0.845rem", display: "flex", alignItems: "center", gap: "8px",
              marginBottom: "18px"
            }}>
              ✓ {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
            {/* Name – animated slide */}
            <div style={{
              overflow: "hidden",
              maxHeight: isLogin ? "0" : "70px",
              opacity: isLogin ? 0 : 1,
              transform: isLogin ? "translateY(-10px)" : "translateY(0)",
              transition: "max-height 0.38s ease, opacity 0.3s ease, transform 0.3s ease"
            }}>
              <AuthInput
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required={!isLogin}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                }
              />
            </div>

            <AuthInput
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              }
            />

            <AuthInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              }
            />

            <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading
                  ? <><span className="auth-spinner" />{isLogin ? "Signing In..." : "Creating Account..."}</>
                  : (isLogin ? "→  Sign In" : "→  Create Account")
                }
              </button>

              <button
                type="button"
                onClick={guestLogin}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#f8fafc",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s ease"
                }}
              >
                <span>⚡</span>
                <span>Instant Demo Access (Skip Login)</span>
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="auth-divider" style={{ margin: "24px 0 16px" }}>
            {isLogin ? "New to StudyShell?" : "Already have an account?"}
          </div>

          {/* Switch */}
          <div style={{ textAlign: "center" }}>
            <button className="auth-link-btn" onClick={switchMode} type="button">
              {isLogin ? "Create a free account →" : "← Back to Login"}
            </button>
          </div>

          {/* Fine print */}
          <p style={{
            textAlign: "center", fontSize: "0.71rem",
            color: "rgba(100,116,139,0.6)", marginTop: "26px", lineHeight: 1.55
          }}>
            By continuing you agree to our Terms of Service.<br />
            Your notes are private and encrypted.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{
          position: "fixed", bottom: "22px", left: "50%",
          transform: "translateX(-50%)",
          display: "flex", gap: "9px", flexWrap: "wrap",
          justifyContent: "center", zIndex: 10
        }}>
          {pills.map(p => (
            <span key={p} style={{
              padding: "5px 13px",
              background: "rgba(10,15,30,0.72)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.065)",
              borderRadius: "999px",
              fontSize: "0.73rem",
              color: "rgba(148,163,184,0.75)",
              fontWeight: 500, whiteSpace: "nowrap"
            }}>{p}</span>
          ))}
        </div>
      </div>
    </>
  );
}
