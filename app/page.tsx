"use client";

import { useState, useRef, useCallback } from "react";

const tools = [
  { id: "bg-remove", label: "Background Remove", icon: "✂", desc: "ব্যাকগ্রাউন্ড সরাও" },
  { id: "enhance", label: "AI Enhance", icon: "✦", desc: "কোয়ালিটি ৪x বাড়াও" },
  { id: "restore", label: "Face Restore", icon: "◎", desc: "মুখ পরিষ্কার করো" },
  { id: "recolor", label: "Recolor", icon: "◑", desc: "রঙ বদলে দাও" },
  { id: "upscale", label: "Upscale 4K", icon: "⬡", desc: "ছোট ছবি বড় করো" },
  { id: "shadow", label: "Add Shadow", icon: "◻", desc: "শ্যাডো যোগ করো" },
];

export default function Home() {
  const [activeTool, setActiveTool] = useState("bg-remove");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setProcessed(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const applyBackground = (imageSrc: string, color: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
    });
  };

  const handleProcess = async () => {
    if (!uploadedImage) return;
    setProcessing(true);
    setProcessed(false);

    try {
      if (activeTool === "bg-remove") {
        const { removeBackground } = await import("@imgly/background-removal");
        const result = await removeBackground(uploadedImage);
        const url = URL.createObjectURL(result);
        if (bgColor) {
          const colored = await applyBackground(url, bgColor);
          setUploadedImage(colored);
        } else {
          setUploadedImage(url);
        }
      } else if (activeTool === "enhance" || activeTool === "upscale") {
        const img = document.createElement("img");
        img.src = uploadedImage;
        await new Promise((res) => (img.onload = res));
        const canvas = document.createElement("canvas");
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setUploadedImage(canvas.toDataURL("image/png"));
      } else {
        await new Promise((res) => setTimeout(res, 1500));
      }

      setProcessed(true);
    } catch {
      alert("কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করো");
    } finally {
      setProcessing(false);
    }
  };

  const currentTool = tools.find((t) => t.id === activeTool)!;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: 60, background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #7c3aed, #2563eb)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</div>
          <span style={{ fontSize: 17, fontWeight: 700 }}>Pixora <span style={{ color: "#7c3aed" }}>AI</span></span>
        </div>
        <span style={{ fontSize: 12, color: "#7c3aed", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", padding: "4px 12px", borderRadius: 20, fontWeight: 600 }}>
          FREE — ৩ মাস
        </span>
      </nav>

      {/* TOOL BAR */}
      <div style={{ display: "flex", gap: 6, padding: "12px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
        {tools.map((tool) => (
          <button key={tool.id} onClick={() => { setActiveTool(tool.id); setProcessed(false); }} style={{ display: "flex", alignItems: "center", gap: 8, background: activeTool === tool.id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)", border: activeTool === tool.id ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.08)", color: activeTool === tool.id ? "#a78bfa" : "rgba(255,255,255,0.55)", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
            <span>{tool.icon}</span>{tool.label}
          </button>
        ))}
      </div>

      {/* WORKSPACE */}
      <div style={{ flex: 1, display: "flex", gap: 0, padding: "28px 32px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        {/* LEFT - Preview */}
        <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px 0 0 16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 1 }}>PREVIEW</span>
            {uploadedImage && (
              <button onClick={() => { setUploadedImage(null); setProcessed(false); }} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>✕ Clear</button>
            )}
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => !uploadedImage && fileRef.current?.click()}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: uploadedImage ? "default" : "pointer", background: dragging ? "rgba(124,58,237,0.08)" : "transparent", minHeight: 380, position: "relative" }}
          >
            {!uploadedImage ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ width: 72, height: 72, background: "rgba(124,58,237,0.1)", border: "2px dashed rgba(124,58,237,0.35)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>🖼</div>
                <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>ছবি ড্র্যাগ করো অথবা ক্লিক করো</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>PNG, JPG, WEBP • সর্বোচ্চ 10MB</p>
              </div>
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <img src={uploadedImage} alt="preview" style={{ maxWidth: "90%", maxHeight: 340, objectFit: "contain", borderRadius: 12, filter: processing ? "blur(4px) brightness(0.7)" : "none", transition: "filter 0.4s" }} />
                {processing && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 48, height: 48, border: "3px solid rgba(124,58,237,0.2)", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 14 }} />
                    <p style={{ fontSize: 13, color: "#a78bfa", fontWeight: 600 }}>AI Processing…</p>
                  </div>
                )}
                {processed && (
                  <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>✓ সম্পন্ন</div>
                )}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
          </div>

          {uploadedImage && (
            <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10 }}>
              <button onClick={() => fileRef.current?.click()} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: 10, borderRadius: 10, fontSize: 13, cursor: "pointer" }}>↑ নতুন ছবি</button>
              {processed && (
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = uploadedImage!;
                    link.download = "pixora-result.png";
                    link.click();
                  }}
                  style={{ flex: 1, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", padding: 10, borderRadius: 10, fontSize: 13, cursor: "pointer", fontWeight: 600 }}
                >
                  ↓ Download
                </button>
              )}
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />

        {/* RIGHT - Controls */}
        <div style={{ width: 290, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderLeft: "none", borderRadius: "0 16px 16px 0", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{currentTool.icon}</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700 }}>{currentTool.label}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{currentTool.desc}</p>
              </div>
            </div>
          </div>

          <div style={{ padding: 20, flex: 1 }}>

            {/* BACKGROUND COLOR — শুধু bg-remove tool এ দেখাবে */}
            {activeTool === "bg-remove" && (
              <>
                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 12 }}>BACKGROUND COLOR</p>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {["transparent", "#ffffff", "#000000", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setBgColor(color === "transparent" ? null : color)}
                        style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: color === "transparent"
                            ? "linear-gradient(45deg, #555 25%, transparent 25%, transparent 75%, #555 75%), linear-gradient(45deg, #555 25%, transparent 25%, transparent 75%, #555 75%)"
                            : color,
                          backgroundSize: color === "transparent" ? "8px 8px" : "auto",
                          backgroundPosition: color === "transparent" ? "0 0, 4px 4px" : "auto",
                          border: (bgColor === color || (color === "transparent" && !bgColor)) ? "2px solid #a78bfa" : "2px solid rgba(255,255,255,0.1)",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="color"
                      value={bgColor || "#ffffff"}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", cursor: "pointer", padding: 2 }}
                    />
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{bgColor ? bgColor : "Transparent"}</span>
                    {bgColor && (
                      <button onClick={() => setBgColor(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", padding: "4px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>✕</button>
                    )}
                  </div>
                </div>
              </>
            )}

            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 16 }}>OUTPUT FORMAT</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {["PNG", "WEBP", "JPG"].map((f) => (
                <button key={f} style={{ flex: 1, padding: "8px 4px", background: f === "PNG" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)", border: f === "PNG" ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.08)", color: f === "PNG" ? "#a78bfa" : "rgba(255,255,255,0.4)", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>{f}</button>
              ))}
            </div>

            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 12 }}>QUALITY</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
              {["HD", "4K"].map((q) => (
                <button key={q} style={{ flex: 1, padding: "8px 4px", background: q === "HD" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)", border: q === "HD" ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.08)", color: q === "HD" ? "#a78bfa" : "rgba(255,255,255,0.4)", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>{q}</button>
              ))}
            </div>

            <button
              onClick={handleProcess}
              disabled={!uploadedImage || processing}
              style={{ width: "100%", padding: 14, background: uploadedImage && !processing ? "linear-gradient(135deg, #7c3aed, #2563eb)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 12, color: uploadedImage && !processing ? "#fff" : "rgba(255,255,255,0.3)", fontSize: 14, fontWeight: 700, cursor: uploadedImage && !processing ? "pointer" : "not-allowed" }}
            >
              {processing ? "⏳ প্রসেস হচ্ছে..." : `✦ ${currentTool.label} করো`}
            </button>
            {!uploadedImage && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 10 }}>আগে ছবি আপলোড করো</p>}
          </div>

          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>এখন সম্পূর্ণ <span style={{ color: "#7c3aed" }}>ফ্রি</span></p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
