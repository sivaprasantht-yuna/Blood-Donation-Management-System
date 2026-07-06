import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Download, X, Share2 } from "lucide-react";

export default function CertificateModal({
  isOpen,
  onClose,
  donorName,
  bloodGroup,
}) {
  const canvasRef = useRef(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [serialNo] = useState(
    () => `LD-${Math.floor(100000 + Math.random() * 900000)}-2026`,
  );

  useEffect(() => {
    if (!isOpen) return;

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      document.fonts.ready.then(() => {
        const W = 3508;
        const H = 2480;
        const cx = W / 2;

        ctx.clearRect(0, 0, W, H);

        // ═══════════════════════════════════════════════════════
        // 1. BACKGROUND — Deep navy with subtle radial warmth
        // ═══════════════════════════════════════════════════════
        const bg = ctx.createRadialGradient(cx, H / 2, 200, cx, H / 2, W * 0.7);
        bg.addColorStop(0, "#1a2744");
        bg.addColorStop(0.5, "#0f1d32");
        bg.addColorStop(1, "#0a1628");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Subtle warm accent glow behind center content
        const warmGlow = ctx.createRadialGradient(cx, H * 0.42, 50, cx, H * 0.42, 900);
        warmGlow.addColorStop(0, "rgba(212, 175, 55, 0.06)");
        warmGlow.addColorStop(1, "rgba(212, 175, 55, 0)");
        ctx.fillStyle = warmGlow;
        ctx.fillRect(0, 0, W, H);

        // ═══════════════════════════════════════════════════════
        // 2. GEOMETRIC PATTERN — Subtle diagonal line grid
        // ═══════════════════════════════════════════════════════
        ctx.strokeStyle = "rgba(212, 175, 55, 0.025)";
        ctx.lineWidth = 1.5;
        for (let i = -H; i < W + H; i += 120) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + H, H);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(i + H, 0);
          ctx.lineTo(i, H);
          ctx.stroke();
        }

        // ═══════════════════════════════════════════════════════
        // 3. BORDER SYSTEM — Triple-layer elegant frame
        // ═══════════════════════════════════════════════════════
        // Outer gold border
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 10;
        ctx.strokeRect(60, 60, W - 120, H - 120);

        // Mid navy gap — natural from background

        // Inner thin gold border
        ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(90, 90, W - 180, H - 180);

        // Innermost subtle border
        ctx.strokeStyle = "rgba(212, 175, 55, 0.2)";
        ctx.lineWidth = 1;
        ctx.strokeRect(110, 110, W - 220, H - 220);

        // Corner ornaments — elegant L-shaped gold brackets
        const cornerSize = 80;
        const cornerInset = 75;
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 5;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(cornerInset, cornerInset + cornerSize);
        ctx.lineTo(cornerInset, cornerInset);
        ctx.lineTo(cornerInset + cornerSize, cornerInset);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(W - cornerInset - cornerSize, cornerInset);
        ctx.lineTo(W - cornerInset, cornerInset);
        ctx.lineTo(W - cornerInset, cornerInset + cornerSize);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(cornerInset, H - cornerInset - cornerSize);
        ctx.lineTo(cornerInset, H - cornerInset);
        ctx.lineTo(cornerInset + cornerSize, H - cornerInset);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(W - cornerInset - cornerSize, H - cornerInset);
        ctx.lineTo(W - cornerInset, H - cornerInset);
        ctx.lineTo(W - cornerInset, H - cornerInset - cornerSize);
        ctx.stroke();

        // ═══════════════════════════════════════════════════════
        // 4. HEADER — Organization identity
        // ═══════════════════════════════════════════════════════
        ctx.textAlign = "center";

        // Top decorative line
        const lineW = 500;
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - lineW, 200);
        ctx.lineTo(cx + lineW, 200);
        ctx.stroke();

        // Center diamond on the line
        ctx.fillStyle = "#D4AF37";
        ctx.beginPath();
        ctx.moveTo(cx, 190);
        ctx.lineTo(cx + 12, 200);
        ctx.lineTo(cx, 210);
        ctx.lineTo(cx - 12, 200);
        ctx.closePath();
        ctx.fill();

        // Organization name
        ctx.font = '600 38px "Montserrat", sans-serif';
        ctx.fillStyle = "rgba(212, 175, 55, 0.85)";
        ctx.letterSpacing = "12px";
        ctx.fillText("L I F E D R O P   M E D I C A L   N E T W O R K", cx, 270);

        // Subtitle
        ctx.font = '500 22px "Poppins", sans-serif';
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillText("NATIONAL VOLUNTARY EMERGENCY BLOOD DONATION PROGRAM", cx, 320);

        // ═══════════════════════════════════════════════════════
        // 5. BLOOD DROP ICON — Minimal geometric emblem
        // ═══════════════════════════════════════════════════════
        const dropCx = cx;
        const dropCy = 480;

        // Outer ring
        ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(dropCx, dropCy + 10, 75, 0, Math.PI * 2);
        ctx.stroke();

        // Blood drop inside the ring
        ctx.fillStyle = "#DC2626";
        ctx.beginPath();
        ctx.moveTo(dropCx, dropCy - 40);
        ctx.bezierCurveTo(dropCx + 28, dropCy - 10, dropCx + 35, dropCy + 18, dropCx + 35, dropCy + 28);
        ctx.arc(dropCx, dropCy + 28, 35, 0, Math.PI, false);
        ctx.bezierCurveTo(dropCx - 35, dropCy + 18, dropCx - 28, dropCy - 10, dropCx, dropCy - 40);
        ctx.fill();

        // White cross inside the drop
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(dropCx - 4, dropCy + 8, 8, 30);
        ctx.fillRect(dropCx - 15, dropCy + 19, 30, 8);

        // ═══════════════════════════════════════════════════════
        // 6. MAIN TITLE
        // ═══════════════════════════════════════════════════════
        ctx.font = '700 90px "Cinzel", serif';
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("CERTIFICATE", cx, 680);

        ctx.font = '400 44px "Cinzel", serif';
        ctx.fillStyle = "rgba(212, 175, 55, 0.9)";
        ctx.fillText("OF BLOOD DONATION", cx, 750);

        // Decorative line under title
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 350, 790);
        ctx.lineTo(cx - 30, 790);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 30, 790);
        ctx.lineTo(cx + 350, 790);
        ctx.stroke();

        // Small diamond center
        ctx.fillStyle = "#D4AF37";
        ctx.beginPath();
        ctx.moveTo(cx, 782);
        ctx.lineTo(cx + 10, 790);
        ctx.lineTo(cx, 798);
        ctx.lineTo(cx - 10, 790);
        ctx.closePath();
        ctx.fill();

        // ═══════════════════════════════════════════════════════
        // 7. PRESENTATION TEXT
        // ═══════════════════════════════════════════════════════
        ctx.font = 'italic 30px "Playfair Display", serif';
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillText("This certificate is proudly presented to", cx, 870);

        // ═══════════════════════════════════════════════════════
        // 8. RECIPIENT NAME — The star of the show
        // ═══════════════════════════════════════════════════════
        ctx.font = '700 100px "Playfair Display", serif';
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(donorName.toUpperCase(), cx, 1010);

        // Gold underline for name
        const nameMetrics = ctx.measureText(donorName.toUpperCase());
        const nameHalfW = Math.min(nameMetrics.width / 2, 800);
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - nameHalfW - 40, 1050);
        ctx.lineTo(cx + nameHalfW + 40, 1050);
        ctx.stroke();

        // Small decorative dots on the line ends
        ctx.fillStyle = "#D4AF37";
        ctx.beginPath();
        ctx.arc(cx - nameHalfW - 50, 1050, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + nameHalfW + 50, 1050, 6, 0, Math.PI * 2);
        ctx.fill();

        // ═══════════════════════════════════════════════════════
        // 9. RECOGNITION TEXT
        // ═══════════════════════════════════════════════════════
        ctx.font = '500 30px "Poppins", sans-serif';
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.fillText(
          "in recognition of their generous voluntary blood donation,",
          cx, 1130
        );
        ctx.fillText(
          "contributing to the preservation and betterment of human life.",
          cx, 1180
        );

        // Quote
        ctx.font = 'italic 28px "Playfair Display", serif';
        ctx.fillStyle = "rgba(212, 175, 55, 0.7)";
        ctx.fillText(
          '"Every drop of blood donated is a heartbeat shared — thank you for being someone\'s hero."',
          cx, 1270
        );

        // ═══════════════════════════════════════════════════════
        // 10. INFO CARDS — Three columns
        // ═══════════════════════════════════════════════════════
        const cardY = 1380;
        const cardH = 380;
        const cardGap = 40;
        const totalCardsW = W - 300;
        const cardW = (totalCardsW - cardGap * 2) / 3;
        const cardStartX = 150;

        const cards = [
          {
            items: [
              { label: "Blood Group", val: bloodGroup },
              { label: "Units Donated", val: "1 Unit (350ml)" },
              { label: "Donation Date", val: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
            ]
          },
          {
            items: [
              { label: "Donation ID", val: `DN-${Math.floor(100000 + Math.random() * 900000)}` },
              { label: "Certificate No.", val: serialNo },
              { label: "Location", val: "LifeDrop Regional, Chennai" },
            ]
          },
        ];

        // Draw the two info cards
        cards.forEach((card, ci) => {
          const x = cardStartX + ci * (cardW + cardGap);
          // Card background
          ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
          roundRect(ctx, x, cardY, cardW, cardH, 20);
          ctx.fill();
          ctx.strokeStyle = "rgba(212, 175, 55, 0.2)";
          ctx.lineWidth = 2;
          roundRect(ctx, x, cardY, cardW, cardH, 20);
          ctx.stroke();

          card.items.forEach((item, i) => {
            const iy = cardY + 70 + i * 110;
            ctx.textAlign = "left";
            ctx.font = '600 20px "Montserrat", sans-serif';
            ctx.fillStyle = "rgba(212, 175, 55, 0.65)";
            ctx.fillText(item.label.toUpperCase(), x + 45, iy);
            ctx.font = '700 32px "Poppins", sans-serif';
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(item.val, x + 45, iy + 42);
          });
        });

        // Third card — QR Code area
        const qrCardX = cardStartX + 2 * (cardW + cardGap);
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        roundRect(ctx, qrCardX, cardY, cardW, cardH, 20);
        ctx.fill();
        ctx.strokeStyle = "rgba(212, 175, 55, 0.2)";
        ctx.lineWidth = 2;
        roundRect(ctx, qrCardX, cardY, cardW, cardH, 20);
        ctx.stroke();

        // QR code simulation
        const qrSize = 180;
        const qrX = qrCardX + (cardW - qrSize) / 2;
        const qrY2 = cardY + 50;

        // QR finder patterns
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(qrX, qrY2, 55, 55);
        ctx.fillStyle = "#0f1d32";
        ctx.fillRect(qrX + 10, qrY2 + 10, 35, 35);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(qrX + 17, qrY2 + 17, 21, 21);

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(qrX + qrSize - 55, qrY2, 55, 55);
        ctx.fillStyle = "#0f1d32";
        ctx.fillRect(qrX + qrSize - 45, qrY2 + 10, 35, 35);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(qrX + qrSize - 38, qrY2 + 17, 21, 21);

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(qrX, qrY2 + qrSize - 55, 55, 55);
        ctx.fillStyle = "#0f1d32";
        ctx.fillRect(qrX + 10, qrY2 + qrSize - 45, 35, 35);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(qrX + 17, qrY2 + qrSize - 38, 21, 21);

        // QR data pixels
        ctx.fillStyle = "#FFFFFF";
        for (let r = 0; r < 12; r++) {
          for (let c = 0; c < 12; c++) {
            if ((r < 4 && c < 4) || (r < 4 && c > 7) || (r > 7 && c < 4)) continue;
            const rand = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
            if (rand - Math.floor(rand) > 0.42) {
              ctx.fillRect(qrX + c * 15, qrY2 + r * 15, 14, 14);
            }
          }
        }

        ctx.textAlign = "center";
        ctx.font = '700 20px "Montserrat", sans-serif';
        ctx.fillStyle = "rgba(212, 175, 55, 0.65)";
        ctx.fillText("SCAN TO VERIFY", qrCardX + cardW / 2, qrY2 + qrSize + 45);
        ctx.font = '500 18px "Poppins", sans-serif';
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillText("Certificate Authenticity", qrCardX + cardW / 2, qrY2 + qrSize + 80);
        ctx.font = '500 16px "Poppins", sans-serif';
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillText(serialNo, qrCardX + cardW / 2, qrY2 + qrSize + 110);

        // ═══════════════════════════════════════════════════════
        // 11. SIGNATURES — Two signatories
        // ═══════════════════════════════════════════════════════
        const sigY = 1880;
        const sig1X = W * 0.25;
        const sig2X = W * 0.75;

        [
          { x: sig1X, name: "Dr. Elizabeth Vance", title: "CHIEF MEDICAL OFFICER", dept: "LifeDrop Blood Services Division" },
          { x: sig2X, name: "Marcus Holloway", title: "AUTHORIZED REGISTRAR", dept: "National Registry Office" },
        ].forEach(({ x, name, title, dept }) => {
          ctx.textAlign = "center";

          // Signature line
          ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - 200, sigY);
          ctx.lineTo(x + 200, sigY);
          ctx.stroke();

          // Cursive name
          ctx.font = 'italic 700 42px "Playfair Display", serif';
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(name, x, sigY - 20);

          // Title
          ctx.font = '700 18px "Montserrat", sans-serif';
          ctx.fillStyle = "rgba(212, 175, 55, 0.7)";
          ctx.fillText(title, x, sigY + 35);

          // Department
          ctx.font = '500 16px "Poppins", sans-serif';
          ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
          ctx.fillText(dept, x, sigY + 65);
        });

        // ═══════════════════════════════════════════════════════
        // 12. OFFICIAL SEAL — Center between signatures
        // ═══════════════════════════════════════════════════════
        const sealX = cx;
        const sealY2 = sigY + 10;

        // Outer ring
        ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sealX, sealY2, 65, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(sealX, sealY2, 55, 0, Math.PI * 2);
        ctx.stroke();

        // Starburst teeth
        ctx.fillStyle = "rgba(212, 175, 55, 0.15)";
        for (let i = 0; i < 24; i++) {
          const angle = (i / 24) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(sealX, sealY2);
          ctx.lineTo(sealX + Math.cos(angle) * 72, sealY2 + Math.sin(angle) * 72);
          ctx.lineTo(sealX + Math.cos(angle + 0.13) * 65, sealY2 + Math.sin(angle + 0.13) * 65);
          ctx.closePath();
          ctx.fill();
        }

        // Blood drop inside seal
        ctx.fillStyle = "#DC2626";
        ctx.beginPath();
        ctx.moveTo(sealX, sealY2 - 25);
        ctx.bezierCurveTo(sealX + 16, sealY2 - 8, sealX + 20, sealY2 + 8, sealX + 20, sealY2 + 15);
        ctx.arc(sealX, sealY2 + 15, 20, 0, Math.PI, false);
        ctx.bezierCurveTo(sealX - 20, sealY2 + 8, sealX - 16, sealY2 - 8, sealX, sealY2 - 25);
        ctx.fill();

        ctx.font = '700 11px "Montserrat", sans-serif';
        ctx.fillStyle = "rgba(212, 175, 55, 0.7)";
        ctx.fillText("OFFICIAL", sealX, sealY2 - 38);
        ctx.fillText("LIFEDROP", sealX, sealY2 + 55);

        // ═══════════════════════════════════════════════════════
        // 13. FOOTER
        // ═══════════════════════════════════════════════════════
        const footerY = H - 130;

        // Divider line
        ctx.strokeStyle = "rgba(212, 175, 55, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(200, footerY - 30);
        ctx.lineTo(W - 200, footerY - 30);
        ctx.stroke();

        ctx.font = '600 22px "Montserrat", sans-serif';
        ctx.fillStyle = "rgba(212, 175, 55, 0.6)";
        ctx.fillText(
          "DONATE BLOOD  •  SAVE LIVES  •  BE A HERO",
          cx, footerY + 10
        );

        ctx.font = '400 18px "Poppins", sans-serif';
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillText(
          "www.lifedrop-network.org  |  +91 (800) 555-DROP  |  emergency@lifedrop.org",
          cx, footerY + 50
        );

        // Generate download URL
        const url = canvas.toDataURL("image/png");
        setDownloadUrl(url);
      });
    }, 150);
  }, [isOpen, donorName, bloodGroup, serialNo]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-[#0f1d32] rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl shadow-black/50 border border-[#D4AF37]/20 flex flex-col items-center"
        >
          {/* Header toolbar */}
          <div className="w-full flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <Award size={24} className="text-[#D4AF37]" />
              </motion.div>
              <div>
                <span className="font-bold text-lg text-white block leading-tight">
                  LifeSaver Achievement Certificate
                </span>
                <span className="text-xs text-gray-400 font-mono">{serialNo}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Certificate Display */}
          <div className="w-full rounded-2xl overflow-hidden shadow-inner bg-[#0a1628] p-2 md:p-3 flex justify-center mb-6 border border-white/5">
            <canvas
              ref={canvasRef}
              width={3508}
              height={2480}
              className="w-full max-w-3xl rounded-lg shadow-2xl aspect-[3508/2480] bg-[#0f1d32] object-contain"
            />
          </div>

          {/* CTA control panel */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <a
              href={downloadUrl}
              download={`LifeSaver_Certificate_${donorName.replace(/\s+/g, "_")}.png`}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#c5a028] hover:from-[#e0bf44] hover:to-[#d4af37] text-[#0f1d32] font-bold py-3.5 px-6 rounded-2xl active:scale-[0.98] transition shadow-lg shadow-[#D4AF37]/20 text-sm"
            >
              <Download size={16} /> Download High-Resolution Certificate
            </a>
            <button
              onClick={() => {
                if (navigator.share && downloadUrl) {
                  navigator.share({ title: "LifeDrop Certificate", text: `${donorName}'s Blood Donation Certificate`, url: downloadUrl }).catch(() => {});
                }
              }}
              className="flex-none sm:w-auto bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-semibold py-3.5 px-5 rounded-2xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Share2 size={14} /> Share
            </button>
            <button
              onClick={onClose}
              className="flex-none sm:w-auto bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 font-semibold py-3.5 px-5 rounded-2xl transition text-sm cursor-pointer"
            >
              Close
            </button>
          </div>

          <p className="text-[11px] text-gray-500 mt-4 text-center">
            This certificate is generated securely from validated event records on the LifeDrop platform. You may print and share this globally.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper: Draw rounded rectangle path
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
