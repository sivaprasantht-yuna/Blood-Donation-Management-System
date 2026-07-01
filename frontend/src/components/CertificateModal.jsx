import React, { useRef, useEffect, useState } from "react";
import { Award, Download, X } from "lucide-react";

export default function CertificateModal({
  isOpen,
  onClose,
  donorName = "Valued Donor",
  bloodGroup = "N/A",
}) {
  const canvasRef = useRef(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [serialNo] = useState(
    () => `LD-${Math.floor(100000 + Math.random() * 900000)}-2026`,
  );

  useEffect(() => {
    if (!isOpen) return;

    // Use setTimeout to ensure the DOM is painted and canvas elements are available
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const activeDonorName = (donorName || "Valued Donor").toUpperCase();
      const activeBloodGroup = bloodGroup || "N/A";

      const drawCertificate = () => {
        const width = 3508;
        const height = 2480;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // 1. Draw Background (Light grey with center radial gradient)
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          100,
          width / 2,
          height / 2,
          width,
        );
        gradient.addColorStop(0, "#FFFFFF");
        gradient.addColorStop(1, "#F4F5F7");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 2. Subtle medical cross pattern grid
        ctx.strokeStyle = "rgba(193, 18, 31, 0.015)";
        ctx.lineWidth = 2;
        for (let x = 150; x < width - 150; x += 180) {
          for (let y = 150; y < height - 150; y += 180) {
            ctx.beginPath();
            ctx.moveTo(x - 10, y);
            ctx.lineTo(x + 10, y);
            ctx.moveTo(x, y - 10);
            ctx.lineTo(x, y + 10);
            ctx.stroke();
          }
        }

        // 3. Very light heartbeat (ECG) line at bottom
        ctx.strokeStyle = "rgba(193, 18, 31, 0.025)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        let startY = 2150;
        ctx.moveTo(180, startY);
        for (let cx = 180; cx < width - 180; cx += 380) {
          ctx.lineTo(cx, startY);
          ctx.lineTo(cx + 60, startY);
          ctx.lineTo(cx + 75, startY - 80);
          ctx.lineTo(cx + 90, startY + 110);
          ctx.lineTo(cx + 105, startY - 30);
          ctx.lineTo(cx + 120, startY);
          ctx.lineTo(cx + 200, startY);
        }
        ctx.stroke();

        // 4. Faint blood drop watermark in the center
        ctx.save();
        ctx.translate(width / 2, height / 2 + 100);
        ctx.fillStyle = "rgba(193, 18, 31, 0.008)"; // extremely faint
        ctx.beginPath();
        ctx.moveTo(0, -320);
        ctx.bezierCurveTo(220, -140, 320, 60, 320, 220);
        ctx.arc(0, 220, 320, 0, Math.PI, false);
        ctx.bezierCurveTo(-320, 60, -220, -140, 0, -320);
        ctx.fill();
        ctx.restore();

        // 5. Thick deep-red premium border (#C1121F)
        ctx.strokeStyle = "#C1121F";
        ctx.lineWidth = 36;
        ctx.strokeRect(90, 90, width - 180, height - 180);

        // Double Gold line nested inside
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 8;
        ctx.strokeRect(128, 128, width - 256, height - 256);

        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 3;
        ctx.strokeRect(148, 148, width - 296, height - 296);

        // 6. Red Corner Ribbons
        // Top-Left corner ribbon
        ctx.fillStyle = "#C1121F";
        ctx.beginPath();
        ctx.moveTo(90, 90);
        ctx.lineTo(320, 90);
        ctx.lineTo(90, 320);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(90, 280);
        ctx.lineTo(280, 90);
        ctx.stroke();

        // Top-Right corner ribbon
        ctx.fillStyle = "#C1121F";
        ctx.beginPath();
        ctx.moveTo(width - 90, 90);
        ctx.lineTo(width - 320, 90);
        ctx.lineTo(width - 90, 320);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(width - 90, 280);
        ctx.lineTo(width - 280, 90);
        ctx.stroke();

        // Bottom-Left
        ctx.fillStyle = "#C1121F";
        ctx.beginPath();
        ctx.moveTo(90, height - 90);
        ctx.lineTo(320, height - 90);
        ctx.lineTo(90, height - 320);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(90, height - 280);
        ctx.lineTo(280, height - 90);
        ctx.stroke();

        // Bottom-Right
        ctx.fillStyle = "#C1121F";
        ctx.beginPath();
        ctx.moveTo(width - 90, height - 90);
        ctx.lineTo(width - 320, height - 90);
        ctx.lineTo(width - 90, height - 320);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(width - 90, height - 280);
        ctx.lineTo(width - 280, height - 90);
        ctx.stroke();

        // 7. Header Logo: Shield + Cross + Blood Drop
        let logoX = width / 2;
        let logoY = 320;
        ctx.fillStyle = "#C1121F";
        ctx.beginPath();
        ctx.moveTo(logoX, logoY - 100);
        ctx.bezierCurveTo(
          logoX + 80,
          logoY - 100,
          logoX + 90,
          logoY - 50,
          logoX + 90,
          logoY + 10,
        );
        ctx.bezierCurveTo(
          logoX + 90,
          logoY + 70,
          logoX,
          logoY + 110,
          logoX,
          logoY + 110,
        );
        ctx.bezierCurveTo(
          logoX,
          logoY + 110,
          logoX - 90,
          logoY + 70,
          logoX - 90,
          logoY + 10,
        );
        ctx.bezierCurveTo(
          logoX - 90,
          logoY - 50,
          logoX - 80,
          logoY - 100,
          logoX,
          logoY - 100,
        );
        ctx.fill();
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 5;
        ctx.stroke();

        // White cross inside
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(logoX - 12, logoY - 45, 24, 90);
        ctx.fillRect(logoX - 45, logoY - 12, 90, 24);

        // Red blood drop in the center
        ctx.fillStyle = "#C1121F";
        ctx.beginPath();
        ctx.moveTo(logoX, logoY - 24);
        ctx.bezierCurveTo(
          logoX + 20,
          logoY - 7,
          logoX + 24,
          logoY + 12,
          logoX + 24,
          logoY + 22,
        );
        ctx.arc(logoX, logoY + 22, 24, 0, Math.PI, false);
        ctx.bezierCurveTo(
          logoX - 24,
          logoY + 12,
          logoX - 20,
          logoY - 7,
          logoX,
          logoY - 24,
        );
        ctx.fill();

        // Header text
        ctx.textAlign = "center";
        ctx.font = '700 32px "Montserrat", sans-serif';
        ctx.fillStyle = "#333333";
        ctx.fillText("LIFEDROP MEDICAL SERVICES NETWORK", logoX, logoY + 170);

        ctx.font = '700 22px "Poppins", sans-serif';
        ctx.fillStyle = "#C1121F";
        ctx.fillText(
          "NATIONAL VOLUNTARY EMERGENCY BLOOD DONATION PROGRAM",
          logoX,
          logoY + 215,
        );

        // Main Title
        ctx.font = '700 84px "Cinzel", serif';
        ctx.fillStyle = "#C1121F";
        ctx.fillText("CERTIFICATE OF BLOOD DONATION", logoX, logoY + 360);

        // Subtitle
        ctx.font = 'italic 500 32px "Playfair Display", serif';
        ctx.fillStyle = "#555555";
        ctx.fillText(
          "Presented with gratitude for your life-saving contribution.",
          logoX,
          logoY + 425,
        );

        // Presentation text
        ctx.font = '500 28px "Poppins", sans-serif';
        ctx.fillStyle = "#555555";
        ctx.fillText(
          "This Certificate is proudly presented to",
          logoX,
          logoY + 540,
        );

        // Recipient Name
        ctx.font = '700 92px "Playfair Display", serif';
        ctx.fillStyle = "#C1121F";
        ctx.fillText(activeDonorName, logoX, logoY + 670);

        // Underline name (Elegant Gold Line with central decorative diamond)
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(logoX - 550, logoY + 710);
        ctx.lineTo(logoX + 550, logoY + 710);
        ctx.stroke();

        ctx.fillStyle = "#D4AF37";
        ctx.beginPath();
        ctx.moveTo(logoX, logoY + 700);
        ctx.lineTo(logoX + 16, logoY + 710);
        ctx.lineTo(logoX, logoY + 720);
        ctx.lineTo(logoX - 16, logoY + 710);
        ctx.closePath();
        ctx.fill();

        // Description
        ctx.font = '500 32px "Poppins", sans-serif';
        ctx.fillStyle = "#333333";
        ctx.fillText(
          "in recognition of your generous voluntary blood donation.",
          logoX,
          logoY + 800,
        );

        ctx.font = '500 30px "Poppins", sans-serif';
        ctx.fillStyle = "#555555";
        ctx.fillText(
          "Your selfless act has helped save lives and inspired hope within our community.",
          logoX,
          logoY + 860,
        );

        // Quote
        ctx.font = 'italic 500 34px "Playfair Display", serif';
        ctx.fillStyle = "#C1121F";
        ctx.fillText(
          '"Every donation can save up to three lives. Thank you for being someone\'s hero."',
          logoX,
          logoY + 950,
        );

        // Bottom Left (Info Card)
        let cardX = 260;
        let cardY = 1520;
        let cardW = 850;
        let cardH = 500;

        ctx.fillStyle = "rgba(212, 175, 55, 0.04)";
        ctx.fillRect(cardX, cardY, cardW, cardH);
        ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
        ctx.lineWidth = 3;
        ctx.strokeRect(cardX, cardY, cardW, cardH);

        let items = [
          { label: "Blood Group", val: activeBloodGroup },
          {
            label: "Donation ID",
            val: `DN-${Math.floor(100000 + Math.random() * 900000)}`,
          },
          { label: "Donation Date", val: "June 30, 2026" },
          {
            label: "Donation Location",
            val: "LifeDrop Regional Camp, Chennai",
          },
          { label: "Units Donated", val: "1 Unit (350ml)" },
          { label: "Certificate Number", val: serialNo },
        ];

        ctx.textAlign = "left";
        for (let i = 0; i < items.length; i++) {
          let itemY = cardY + 60 + i * 70;
          ctx.fillStyle = "#C1121F";
          ctx.font = '700 24px "Montserrat", sans-serif';
          ctx.fillText(items[i].label + " :", cardX + 50, itemY);
          ctx.fillStyle = "#333333";
          ctx.font = '600 24px "Poppins", sans-serif';
          ctx.fillText(items[i].val, cardX + 360, itemY);
        }

        // Bottom Center (QR Code)
        let qrX = width / 2 - 130;
        let qrY = 1520;
        let qrSize = 260;

        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 4;
        ctx.strokeRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30);

        ctx.textAlign = "center";
        ctx.fillStyle = "#555555";
        ctx.font = '600 20px "Poppins", sans-serif';
        ctx.fillText("SCAN TO VERIFY", width / 2, qrY + qrSize + 50);
        ctx.font = '500 16px "Poppins", sans-serif';
        ctx.fillText("Certificate Authenticity", width / 2, qrY + qrSize + 85);

        ctx.fillStyle = "#333333";
        // QR corners finder patterns
        ctx.fillRect(qrX, qrY, 80, 80);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(qrX + 15, qrY + 15, 50, 50);
        ctx.fillStyle = "#333333";
        ctx.fillRect(qrX + 25, qrY + 25, 30, 30);

        ctx.fillRect(qrX + qrSize - 80, qrY, 80, 80);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(qrX + qrSize - 65, qrY + 15, 50, 50);
        ctx.fillStyle = "#333333";
        ctx.fillRect(qrX + qrSize - 55, qrY + 25, 30, 30);

        ctx.fillRect(qrX, qrY + qrSize - 80, 80, 80);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(qrX + 15, qrY + qrSize - 65, 50, 50);
        ctx.fillStyle = "#333333";
        ctx.fillRect(qrX + 25, qrY + qrSize - 55, 30, 30);

        ctx.fillStyle = "#333333";
        for (let r = 0; r < 14; r++) {
          for (let c = 0; c < 14; c++) {
            if ((r < 5 && c < 5) || (r < 5 && c > 8) || (r > 8 && c < 5))
              continue;
            let rand = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
            if (rand - Math.floor(rand) > 0.4) {
              ctx.fillRect(qrX + c * 18.5, qrY + r * 18.5, 18.5, 18.5);
            }
          }
        }

        // Bottom Right Signatures
        let sigX1 = width - 650;
        let sigY1 = 1680;
        ctx.textAlign = "center";
        ctx.font = 'italic 700 40px "Playfair Display", serif';
        ctx.fillStyle = "#1F2937";
        ctx.fillText("Dr. Elizabeth Vance", sigX1, sigY1);

        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sigX1 - 180, sigY1 + 15);
        ctx.lineTo(sigX1 + 180, sigY1 + 15);
        ctx.stroke();

        ctx.font = '700 20px "Montserrat", sans-serif';
        ctx.fillStyle = "#555555";
        ctx.fillText("CHIEF MEDICAL OFFICER", sigX1, sigY1 + 50);
        ctx.font = '500 18px "Poppins", sans-serif';
        ctx.fillText("LifeDrop Blood Services Division", sigX1, sigY1 + 80);

        let sigX2 = width - 250;
        let sigY2 = 1680;
        ctx.font = 'italic 700 40px "Playfair Display", serif';
        ctx.fillStyle = "#1F2937";
        ctx.fillText("Marcus Holloway", sigX2, sigY2);

        ctx.beginPath();
        ctx.moveTo(sigX2 - 180, sigY2 + 15);
        ctx.lineTo(sigX2 + 180, sigY2 + 15);
        ctx.stroke();

        ctx.font = '700 20px "Montserrat", sans-serif';
        ctx.fillStyle = "#555555";
        ctx.fillText("AUTHORIZED REGISTRAR", sigX2, sigY2 + 50);
        ctx.font = '500 18px "Poppins", sans-serif';
        ctx.fillText("National Registry Office", sigX2, sigY2 + 80);

        // Circular Seal
        let sealX = width - 450;
        let sealY = 1940;

        ctx.fillStyle = "rgba(212, 175, 55, 0.08)";
        ctx.beginPath();
        ctx.arc(sealX, sealY, 90, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sealX, sealY, 80, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#C1121F";
        ctx.beginPath();
        ctx.moveTo(sealX, sealY - 35);
        ctx.bezierCurveTo(
          sealX + 22,
          sealY - 15,
          sealX + 26,
          sealY + 10,
          sealX + 26,
          sealY + 20,
        );
        ctx.arc(sealX, sealY + 20, 26, 0, Math.PI, false);
        ctx.bezierCurveTo(
          sealX - 26,
          sealY + 10,
          sealX - 22,
          sealY - 15,
          sealX,
          sealY - 35,
        );
        ctx.fill();

        ctx.font = '700 13px "Montserrat", sans-serif';
        ctx.fillStyle = "#333333";
        ctx.fillText("OFFICIAL SEAL", sealX, sealY + 50);
        ctx.fillText("LIFEDROP NET", sealX, sealY - 50);

        // Footer Section
        let footerY = height - 120;
        ctx.font = '700 24px "Montserrat", sans-serif';
        ctx.fillStyle = "#C1121F";
        ctx.fillText(
          "THANK YOU FOR MAKING A DIFFERENCE. DONATE BLOOD • SAVE LIVES",
          width / 2,
          footerY,
        );

        ctx.font = '500 20px "Poppins", sans-serif';
        ctx.fillStyle = "#555555";
        ctx.fillText(
          "www.lifedrop-network.org  |  +1 (800) 555-DROP  |  emergency@lifedrop.org",
          width / 2,
          footerY + 40,
        );

        // Update Download URL
        const url = canvas.toDataURL("image/png");
        setDownloadUrl(url);
      };

      // Draw immediately
      drawCertificate();

      // Draw again when fonts are ready for perfect styling
      if (document.fonts && typeof document.fonts.ready !== "undefined") {
        document.fonts.ready
          .then(() => {
            drawCertificate();
          })
          .catch((e) => {
            console.warn("Fonts loading deferred, using default metrics", e);
          });
      }
    }, 150);
  }, [isOpen, donorName, bloodGroup, serialNo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl flex flex-col items-center">
        {/* Header toolbar */}
        <div className="w-full flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-red-600">
            <Award size={24} className="animate-pulse" />
            <span className="font-bold text-lg text-gray-900">
              LifeSaver Achievement Certificate
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Certificate Display Screen */}
        <div className="w-full border border-gray-100 rounded-2xl overflow-hidden shadow-inner bg-gray-50 p-2 md:p-4 flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={3508}
            height={2480}
            className="w-full max-w-3xl border border-gray-200 rounded shadow-md aspect-[3508/2480] bg-white object-contain"
          />
        </div>

        {/* CTA control panel */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <a
            href={downloadUrl}
            download={`LifeSaver_Certificate_${(donorName || "Valued_Donor").replace(/\s+/g, "_")}.png`}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-2xl active:scale-[98%] transition shadow-lg shadow-red-200"
          >
            <Download size={18} /> Download High-Resolution Award
          </a>
          <button
            onClick={onClose}
            className="flex-none sm:w-32 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl transition"
          >
            Cancel
          </button>
        </div>

        <p className="text-[11px] text-gray-400 mt-4 text-center">
          * This certificate is generated securely from validated event records
          on the LifeDrop platform. You may print and share this globally with
          hospitals.
        </p>
      </div>
    </div>
  );
}
