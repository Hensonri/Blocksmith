import { useEffect, useRef } from "react";

const INTENT_LABELS = {
  "open-crown": "Open Crown",
  cattleman: "Cattleman Crease",
  "pinch-front": "Pinch Front",
  teardrop: "Teardrop",
  "center-dent": "Center Dent",
};

export const INTENT_IMAGES = {
  "open-crown": "/assets/hat-intent-open-crown.webp",
  cattleman: "/assets/hat-intent-cattleman.webp",
  "pinch-front": "/assets/hat-intent-pinch-front.webp",
  teardrop: "/assets/hat-intent-teardrop.webp",
  "center-dent": "/assets/hat-intent-center-dent.webp",
};

function renderHat(canvas, project, opening) {
  const rect = canvas.getBoundingClientRect();
  const density = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.max(320, Math.floor(rect.height));
  canvas.width = width * density;
  canvas.height = height * density;
  const ctx = canvas.getContext("2d");
  ctx.scale(density, density);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#d8bd88";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(94, 65, 34, 0.16)";
  ctx.lineWidth = 1;
  for (let x = 18; x < width; x += 28) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 18; y < height; y += 28) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  const centerX = width / 2;
  const baseline = height * 0.7;
  const profileRatio = opening.lengthMm / opening.widthMm;
  const brimRadiusX = Math.min(width * 0.39, 205 + project.brimWidthMm * 1.45);
  const brimRadiusY = brimRadiusX / Math.max(1.75, profileRatio * 1.5);
  const crownWidth = Math.min(width * 0.5, 250 * (opening.lengthMm / 194));
  const crownHeight = Math.min(height * 0.52, 235 * (project.crownHeightMm / 152.4));
  const crownTop = baseline - crownHeight;
  const topWidth = crownWidth * (0.87 - project.taperPct / 350);

  ctx.fillStyle = "rgba(155, 116, 69, 0.17)";
  ctx.strokeStyle = "#563b22";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(centerX, baseline + 17, brimRadiusX, brimRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(121, 81, 42, 0.24)";
  ctx.beginPath();
  ctx.moveTo(centerX - crownWidth / 2, baseline);
  ctx.bezierCurveTo(centerX - crownWidth * 0.48, baseline - crownHeight * 0.38, centerX - topWidth * 0.56, crownTop + crownHeight * 0.12, centerX - topWidth / 2, crownTop + crownHeight * 0.08);
  ctx.bezierCurveTo(centerX - topWidth * 0.26, crownTop - crownHeight * 0.02, centerX + topWidth * 0.26, crownTop - crownHeight * 0.02, centerX + topWidth / 2, crownTop + crownHeight * 0.08);
  ctx.bezierCurveTo(centerX + topWidth * 0.56, crownTop + crownHeight * 0.12, centerX + crownWidth * 0.48, baseline - crownHeight * 0.38, centerX + crownWidth / 2, baseline);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(71, 47, 25, 0.48)";
  for (let index = 1; index < 7; index += 1) {
    const t = index / 7;
    const y = crownTop + crownHeight * t;
    const half = (topWidth / 2) + (crownWidth / 2 - topWidth / 2) * t;
    ctx.beginPath(); ctx.ellipse(centerX, y, half, 12 + t * 10, 0, Math.PI, Math.PI * 2); ctx.stroke();
  }
  for (let index = -4; index <= 4; index += 1) {
    const offset = index / 4;
    ctx.beginPath();
    ctx.moveTo(centerX + offset * topWidth * 0.46, crownTop + crownHeight * 0.06);
    ctx.bezierCurveTo(centerX + offset * crownWidth * 0.47, crownTop + crownHeight * 0.3, centerX + offset * crownWidth * 0.5, baseline - crownHeight * 0.2, centerX + offset * crownWidth * 0.5, baseline);
    ctx.stroke();
  }

  ctx.fillStyle = "#4a301b";
  ctx.font = "600 13px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("STANDARD OPEN-CROWN TOOLING", centerX, 28);
  ctx.font = "12px Georgia, serif";
  ctx.fillText(`${opening.profile.name} · ${opening.lengthMm.toFixed(1)} × ${opening.widthMm.toFixed(1)} mm`, centerX, height - 20);
}

export function HatPreview({ project, opening, mode }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (mode === "finished") return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const render = () => renderHat(canvas, project, opening);
    render();
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [project, opening, mode]);

  if (mode === "finished") {
    const intentLabel = INTENT_LABELS[project.finishedIntent] ?? "Finished Hat";
    return (
      <img
        className="hat-illustration"
        src={INTENT_IMAGES[project.finishedIntent] ?? INTENT_IMAGES["open-crown"]}
        alt={`${intentLabel} finished-hat intent illustration; concept only, not manufacturing geometry`}
      />
    );
  }

  return <canvas ref={canvasRef} className="hat-canvas" role="img" aria-label={`Interactive open-crown tooling preview for a ${opening.profile.name} profile`} />;
}
