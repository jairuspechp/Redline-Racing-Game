/* Motorbike artwork (SVG string).
   Wheels are built from a static tire plus a ".spin" group (tread, rim,
   spokes, hub) that CSS rotates around the wheel centre. The frame and
   rider sit in ".body" so they can bob while the wheels turn. */
Race.bikeSvg = function (color, idx) {
  const CY = 44, R_TIRE = 15, R_RIM = 10.5;

  function wheel(cx) {
    let spokes = "";
    for (let k = 0; k < 5; k++) {
      const a = (k * 72 - 90) * Math.PI / 180;
      spokes += `<line x1="${cx}" y1="${CY}" x2="${(cx + Math.cos(a) * R_RIM).toFixed(2)}" y2="${(CY + Math.sin(a) * R_RIM).toFixed(2)}" stroke="#aab1bf" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    return `
      <circle cx="${cx}" cy="${CY}" r="${R_TIRE}" fill="none" stroke="#0b0c0e" stroke-width="5"/>
      <g class="spin" style="transform-origin:${cx}px ${CY}px">
        <circle cx="${cx}" cy="${CY}" r="${R_TIRE}" fill="none" stroke="#3a3e48" stroke-width="5" stroke-dasharray="3 6.425"/>
        <circle cx="${cx}" cy="${CY}" r="${R_RIM}" fill="none" stroke="#aab1bf" stroke-width="1.2"/>
        ${spokes}
        <circle cx="${cx}" cy="${CY}" r="2.6" fill="#aab1bf"/>
        <circle cx="${cx}" cy="${CY - R_RIM + 2}" r="1.3" fill="${color}"/>
      </g>`;
  }

  const delay = (idx * 0.07).toFixed(2);

  return `<svg viewBox="0 0 104 62" aria-hidden="true">
    <g class="wind">
      <line x1="-4"  y1="28" x2="-18" y2="28" stroke="#aab1bf" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="-2"  y1="38" x2="-22" y2="38" stroke="#aab1bf" stroke-width="1.5" stroke-linecap="round" style="animation-delay:.1s"/>
      <line x1="0"   y1="47" x2="-14" y2="47" stroke="#aab1bf" stroke-width="1.5" stroke-linecap="round" style="animation-delay:.2s"/>
    </g>
    ${wheel(20)}
    ${wheel(84)}
    <g class="body" style="--d:-${delay}s">
      <path d="M20 44 L40 30 L62 30 L84 44 M40 30 L48 44 L62 44 L62 30" fill="none" stroke="#7d8594" stroke-width="3"/>
      <path d="M34 26 Q48 18 64 24 L68 32 L40 34 Z" fill="${color}"/>
      <rect x="46" y="38" width="20" height="10" rx="3" fill="#2d3038"/>
      <path d="M78 22 L86 40" stroke="#aab1bf" stroke-width="3"/>
      <path d="M74 20 L82 19" stroke="#0b0c0e" stroke-width="4"/>
      <path d="M42 24 L50 8 L58 8 L66 22 L76 21" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="56" cy="2" r="7" fill="${color}"/>
      <path d="M57 -1 h7 v5 h-7z" fill="#0b0c0e"/>
    </g>
  </svg>`;
};
