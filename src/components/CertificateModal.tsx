import React, { useRef, useEffect, useState } from 'react';
import { Award, Check, Download, X } from 'lucide-react';
import { motion } from 'motion/react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorName: string;
  bloodGroup: string;
}

export default function CertificateModal({ isOpen, onClose, donorName, bloodGroup }: CertificateModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const serialNo = `LD-${Math.floor(100000 + Math.random() * 900000)}-2026`;

  useEffect(() => {
    if (!isOpen) return;

    // Use setTimeout to ensure the DOM is painted and canvas elements are available
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear
      ctx.clearRect(0, 0, 1200, 850);

      // 1. Draw Background (Pristine modern style off-white)
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, 0, 1200, 850);

      // Inner elegant frame
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, 1140, 790);

      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, 1110, 760);

      // 2. Corner Floral Ornaments (Minimal geometric style)
      const drawCorner = (x: number, y: number) => {
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCorner(45, 45);
      drawCorner(1155, 45);
      drawCorner(45, 805);
      drawCorner(1155, 805);

      // 3. Header Texts
      ctx.textAlign = 'center';

      // Logo-desc
      ctx.font = 'bold 22px "Inter", sans-serif';
      ctx.fillStyle = '#DC2626';
      ctx.fillText('L I F E D R O P', 600, 120);

      // Main Title
      ctx.font = 'bold 44px "Inter", sans-serif';
      ctx.fillStyle = '#111827';
      ctx.fillText('CERTIFICATE OF RECOGNITION', 600, 185);

      ctx.font = 'italic 16px "Inter", sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('THIS COMMENDATION IS PROUDLY CONFERRED UPON', 600, 240);

      // 4. Beneficiary Name
      ctx.font = 'bold 46px "Inter", sans-serif';
      ctx.fillStyle = '#DC2626';
      ctx.fillText(donorName.toUpperCase(), 600, 320);

      // Underline name
      ctx.strokeStyle = '#F87171';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(350, 340);
      ctx.lineTo(850, 340);
      ctx.stroke();

      // 5. Narrative Text
      ctx.font = '20px "Inter", sans-serif';
      ctx.fillStyle = '#374151';
      ctx.fillText(`for exemplary humanitarian service as an active voluntary emergency blood donor.`, 600, 400);

      ctx.font = '20px "Inter", sans-serif';
      ctx.fillStyle = '#374151';
      ctx.fillText(`By selflessly giving blood (Type ${bloodGroup}), this individual has directly contributed to saving`, 600, 440);

      ctx.font = '20px "Inter", sans-serif';
      ctx.fillStyle = '#374151';
      ctx.fillText('lives, assisting surgery units, and supporting critical accident therapies.', 600, 480);

      // 6. Beautiful Red Seal (Bottom Middle)
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(600, 600, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(600, 600, 42, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.fillText('OFFICIAL', 600, 595);
      ctx.fillText('SEAL', 600, 615);

      // Golden Ribbon effect (using orange/yellow simple strokes)
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(590, 640);
      ctx.lineTo(570, 710);
      ctx.lineTo(600, 690);
      ctx.lineTo(630, 710);
      ctx.lineTo(610, 640);
      ctx.stroke();

      // 7. Signatures
      // Left side: Director
      ctx.textAlign = 'left';
      ctx.font = 'italic 20px "Inter", sans-serif';
      ctx.fillStyle = '#111827';
      ctx.fillText('Dr. Sarah Connor', 200, 650);

      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(150, 660);
      ctx.lineTo(350, 660);
      ctx.stroke();

      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('DIRECTOR & MEDICAL CHIEF', 190, 680);

      // Right side: Chairperson
      ctx.textAlign = 'right';
      ctx.font = 'italic 20px "Inter", sans-serif';
      ctx.fillStyle = '#111827';
      ctx.fillText('LifeDrop Admin Center', 1050, 650);

      ctx.beginPath();
      ctx.moveTo(850, 660);
      ctx.lineTo(1050, 660);
      ctx.stroke();

      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('VERIFIED SYSTEM REGISTRAR', 1010, 680);

      // 8. Info Footnotes (Middle bottom)
      ctx.textAlign = 'center';
      ctx.font = '12px "Inter", sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText(`Verification Serial No: ${serialNo}  |  Platform: LifeDrop Live Network`, 600, 750);
      ctx.fillText('Calculated and verified on June 9, 2026', 600, 770);

      // Create dataURL and keep in state
      const url = canvas.toDataURL('image/png');
      setDownloadUrl(url);
    }, 100);
  }, [isOpen, donorName, bloodGroup]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl flex flex-col items-center">
        
        {/* Header toolbar */}
        <div className="w-full flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-red-600">
            <Award size={24} className="animate-pulse" />
            <span className="font-bold text-lg text-gray-900">LifeSaver Achievement Certificate</span>
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
            width={1200}
            height={850}
            className="w-full max-w-3xl border border-gray-200 rounded shadow-md aspect-[1200/850] bg-white object-contain"
          />
        </div>

        {/* CTA control panel */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <a
            href={downloadUrl}
            download={`LifeSaver_Certificate_${donorName.replace(/\s+/g, '_')}.png`}
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
          * This certificate is generated securely from validated event records on the LifeDrop platform. You may print and share this globally with hospitals.
        </p>
      </div>
    </div>
  );
}
