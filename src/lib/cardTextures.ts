/**
 * Masterpiece Artwork Texture Generator for 3D Spiral Cards
 * Inspired by the visual aesthetic of pacomepertant.com
 * Generates ultra-high-resolution (2048x1280 @ 2x Retina) artwork canvases
 * with curved borders, specular glass reflections, and signature geometric motifs.
 */
import * as THREE from 'three';
import type { ToolDefinition } from '../types';

export function createCardTexture(tool: ToolDefinition, _index: number): THREE.CanvasTexture {
  const W = 1024;
  const H = 640;
  const canvas = document.createElement('canvas');
  // 2x Retina super-sampling for pin-sharp fidelity
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Scale 2x for sub-pixel anti-aliased sharpness
  ctx.scale(2, 2);

  const padding = 16;
  const cardW = W - padding * 2;
  const cardH = H - padding * 2;
  const cornerRadius = 36;

  // Clear with transparency for smooth 3D rounded corners
  ctx.clearRect(0, 0, W, H);

  // 1. Base card clipping with rounded corners
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(padding, padding, cardW, cardH, cornerRadius);
  } else {
    ctx.rect(padding, padding, cardW, cardH);
  }
  ctx.clip();

  // 2. Render signature motifs based on tool identity
  if (tool.id === 'ai') {
    // [Card 1: AI Summarizer] Signature Cobalt Blue Frame with Geometric Kaleidoscope Prism Star
    ctx.fillStyle = '#0626d9'; // Vibrant cobalt blue outer frame
    ctx.fillRect(padding, padding, cardW, cardH);

    // Inner dark viewport
    const innerPad = 44;
    const innerW = cardW - innerPad * 2;
    const innerH = cardH - innerPad * 2;
    ctx.fillStyle = '#050711';
    ctx.beginPath();
    ctx.roundRect(padding + innerPad, padding + innerPad, innerW, innerH, 20);
    ctx.fill();

    // Inner hairline border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center kaleidoscope star
    ctx.save();
    ctx.translate(W / 2, H / 2);

    // Radial background aura
    const aura = ctx.createRadialGradient(0, 0, 10, 0, 0, 190);
    aura.addColorStop(0, 'rgba(249, 115, 22, 0.85)');
    aura.addColorStop(0.35, 'rgba(56, 189, 248, 0.45)');
    aura.addColorStop(0.7, 'rgba(236, 72, 153, 0.2)');
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 190, 0, Math.PI * 2);
    ctx.fill();

    // Geometric facet petals (8-point kaleidoscope)
    const facetColors = ['#f97316', '#38bdf8', '#fbbf24', '#06b6d4', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
    for (let i = 0; i < 8; i++) {
      ctx.rotate((Math.PI * 2) / 8);
      ctx.fillStyle = facetColors[i % facetColors.length];
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(55, -42, 120, 0);
      ctx.quadraticCurveTo(55, 42, 0, 0);
      ctx.fill();

      // Sharp inner diamond facet
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(45, -15);
      ctx.lineTo(85, 0);
      ctx.lineTo(45, 15);
      ctx.closePath();
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Central luminous white eye core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#050711';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();

    // Tiny center spark
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

  } else if (tool.id === 'books') {
    // [Card 2: Books & Research] Ethereal Lavender/Violet Landscape with Floating Crystal
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.2, '#c084fc');
    grad.addColorStop(0.65, '#581c87');
    grad.addColorStop(1, '#090514');
    ctx.fillStyle = grad;
    ctx.fillRect(padding, padding, cardW, cardH);

    // Mountain silhouettes in background
    ctx.fillStyle = 'rgba(15, 7, 30, 0.9)';
    ctx.beginPath();
    ctx.moveTo(padding, H / 2 + 120);
    ctx.lineTo(padding + 160, H / 2 + 20);
    ctx.lineTo(padding + 280, H / 2 + 70);
    ctx.lineTo(W / 2, H / 2 - 25);
    ctx.lineTo(W - padding - 280, H / 2 + 60);
    ctx.lineTo(W - padding - 150, H / 2 + 10);
    ctx.lineTo(W - padding, H / 2 + 130);
    ctx.lineTo(W - padding, H - padding);
    ctx.lineTo(padding, H - padding);
    ctx.closePath();
    ctx.fill();

    // Water ripple reflection plane
    ctx.fillStyle = 'rgba(76, 29, 149, 0.45)';
    ctx.fillRect(padding, H / 2 + 80, cardW, cardH / 2);

    // Horizontal water reflection lines
    ctx.strokeStyle = 'rgba(233, 213, 255, 0.28)';
    ctx.lineWidth = 1.5;
    for (let y = H / 2 + 95; y < H - padding - 15; y += 18) {
      ctx.beginPath();
      ctx.moveTo(padding + 80, y);
      ctx.lineTo(W - padding - 80, y);
      ctx.stroke();
    }

    // Floating diamond amethyst crystal in center
    ctx.save();
    ctx.translate(W / 2, H / 2 - 40);

    // Glowing aura behind crystal
    const crystalAura = ctx.createRadialGradient(0, 0, 10, 0, 0, 140);
    crystalAura.addColorStop(0, 'rgba(233, 213, 255, 0.9)');
    crystalAura.addColorStop(0.5, 'rgba(192, 132, 252, 0.4)');
    crystalAura.addColorStop(1, 'transparent');
    ctx.fillStyle = crystalAura;
    ctx.beginPath();
    ctx.arc(0, 0, 140, 0, Math.PI * 2);
    ctx.fill();

    // Crystal front facets
    ctx.shadowColor = '#e9d5ff';
    ctx.shadowBlur = 35;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.beginPath();
    ctx.moveTo(0, -125);
    ctx.lineTo(75, -15);
    ctx.lineTo(0, 95);
    ctx.lineTo(-75, -15);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Crystal right shading
    ctx.fillStyle = 'rgba(168, 85, 247, 0.75)';
    ctx.beginPath();
    ctx.moveTo(0, -125);
    ctx.lineTo(75, -15);
    ctx.lineTo(0, 95);
    ctx.closePath();
    ctx.fill();

    // Crystal center edge line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -125);
    ctx.lineTo(0, 95);
    ctx.stroke();

    ctx.restore();

  } else if (tool.id === 'film') {
    // [Card 3: Cinema & YouTube] Golden Hour Warm Sunset Sculpture Studio
    const grad = ctx.createLinearGradient(padding, padding, cardW, cardH);
    grad.addColorStop(0, '#1c0f05');
    grad.addColorStop(0.35, '#d97706');
    grad.addColorStop(0.7, '#f59e0b');
    grad.addColorStop(1, '#fde047');
    ctx.fillStyle = grad;
    ctx.fillRect(padding, padding, cardW, cardH);

    ctx.save();
    ctx.translate(W / 2, H / 2);

    // Glowing sun disk
    ctx.beginPath();
    ctx.arc(-80, -70, 75, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 50;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Perspective floor lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    for (let x = -380; x <= 380; x += 75) {
      ctx.beginPath();
      ctx.moveTo(x * 0.4, 10);
      ctx.lineTo(x * 1.6, 260);
      ctx.stroke();
    }
    for (let y = 30; y <= 240; y += 45) {
      ctx.beginPath();
      ctx.moveTo(-440, y);
      ctx.lineTo(440, y);
      ctx.stroke();
    }

    // Architectural pedestal block in silhouette
    ctx.fillStyle = '#291406';
    ctx.beginPath();
    ctx.moveTo(30, 20);
    ctx.lineTo(190, 20);
    ctx.lineTo(240, 70);
    ctx.lineTo(240, 220);
    ctx.lineTo(30, 220);
    ctx.closePath();
    ctx.fill();

    // Studio sculpture disc
    ctx.fillStyle = '#180a03';
    ctx.beginPath();
    ctx.arc(110, -35, 55, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

  } else if (tool.id === 'operators') {
    // [Card 4: Search Operators] Dark Emerald with Vibrant Atomic Orbits & Boolean Rings
    ctx.fillStyle = '#061a14';
    ctx.fillRect(padding, padding, cardW, cardH);

    ctx.save();
    ctx.translate(W / 2, H / 2);

    // Neon lime central outer ring
    ctx.beginPath();
    ctx.arc(0, 0, 140, 0, Math.PI * 2);
    ctx.fillStyle = '#064e3b';
    ctx.fill();
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#22c55e';
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 35;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner dark disc
    ctx.beginPath();
    ctx.arc(0, 0, 85, 0, Math.PI * 2);
    ctx.fillStyle = '#022c22';
    ctx.fill();

    // Elliptical orbital paths
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 175, 70, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, 175, 70, -Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary cyan satellite circle
    ctx.beginPath();
    ctx.arc(-110, -90, 32, 0, Math.PI * 2);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Floating Boolean data pill with glyph
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(-95, 70, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('$', -102, 78);

    // Central white nucleus
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();

  } else if (tool.id === 'music') {
    // [Card 5: Music & Soundtracks] Deep Obsidian with Neon Cyan Acoustic Ripple Waves
    ctx.fillStyle = '#040d14';
    ctx.fillRect(padding, padding, cardW, cardH);

    ctx.save();
    ctx.translate(W / 2, H / 2);

    // Concentric acoustic rings
    const rippleRadii = [35, 65, 95, 125, 155, 185];
    for (const r of rippleRadii) {
      const alpha = 1 - r / 210;
      ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 24 * alpha;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Horizontal audio wave interference bars
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    for (let i = -6; i <= 6; i++) {
      const barH = 80 - Math.abs(i) * 10;
      ctx.fillRect(i * 24 - 4, -barH / 2, 8, barH);
    }

    // Central luminous white core
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 35;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();

  } else {
    // Custom user AI tools: Prismatic Neon Hexagon Prism
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0f051d');
    grad.addColorStop(0.5, '#6366f1');
    grad.addColorStop(1, '#ec4899');
    ctx.fillStyle = grad;
    ctx.fillRect(padding, padding, cardW, cardH);

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 30;
    for (let s = 140; s >= 35; s -= 35) {
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const rad = (Math.PI / 3) * a;
        const x = Math.cos(rad) * s;
        const y = Math.sin(rad) * s;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- 3. High-Contrast Typography & Identity Labels (Clear Tool Recognition) ---
  const toolAccents: Record<string, { primary: string; glow: string; badgeBg: string }> = {
    film: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)', badgeBg: 'rgba(245, 158, 11, 0.22)' },
    books: { primary: '#c084fc', glow: 'rgba(192, 132, 252, 0.5)', badgeBg: 'rgba(192, 132, 252, 0.22)' },
    music: { primary: '#22d3ee', glow: 'rgba(34, 211, 238, 0.5)', badgeBg: 'rgba(34, 211, 238, 0.22)' },
    ai: { primary: '#38bdf8', glow: 'rgba(56, 189, 248, 0.5)', badgeBg: 'rgba(56, 189, 248, 0.22)' },
    operators: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', badgeBg: 'rgba(16, 185, 129, 0.22)' },
  };
  const accent = toolAccents[tool.id] || {
    primary: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.5)',
    badgeBg: 'rgba(236, 72, 153, 0.22)',
  };

  // 3a. Top Header Identity Tag
  const topTagY = padding + 28;
  const topTagH = 38;
  const indexStr = `0${_index + 1}`.slice(-2);
  const categoryStr = (tool.category || 'AI SUITE').toUpperCase();
  const tagText = `[ ${indexStr} ]  //  ${categoryStr}`;

  ctx.save();
  ctx.font = 'bold 16px "SF Mono", "Fira Code", monospace';
  const tagTextWidth = ctx.measureText(tagText).width;
  const tagPillW = tagTextWidth + 44;

  // Frosted dark pill background
  ctx.fillStyle = 'rgba(7, 9, 18, 0.82)';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(padding + 24, topTagY, tagPillW, topTagH, 19);
  } else {
    ctx.rect(padding + 24, topTagY, tagPillW, topTagH);
  }
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Glowing status dot
  ctx.fillStyle = accent.primary;
  ctx.shadowColor = accent.primary;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(padding + 42, topTagY + topTagH / 2, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Tag text
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(tagText, padding + 56, topTagY + 24);

  // Top-Right Feature Badge (e.g. "YouTube & Cinema", "42+ Platforms", etc.)
  if (tool.badge) {
    ctx.font = '600 14px "Plus Jakarta Sans", system-ui, sans-serif';
    const badgeTextWidth = ctx.measureText(tool.badge).width;
    const badgeW = badgeTextWidth + 30;
    const badgeX = W - padding - 24 - badgeW;

    ctx.fillStyle = accent.badgeBg;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(badgeX, topTagY, badgeW, topTagH, 19);
    } else {
      ctx.rect(badgeX, topTagY, badgeW, topTagH);
    }
    ctx.fill();
    ctx.strokeStyle = accent.primary;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(tool.badge, badgeX + 15, topTagY + 24);
  }
  ctx.restore();

  // 3b. Bottom High-Contrast Frosted Glass Identity Panel
  const bannerH = 158;
  const bannerY = H - padding - bannerH;

  ctx.save();
  // Bottom glass panel gradient
  const bannerGrad = ctx.createLinearGradient(0, bannerY, 0, H - padding);
  bannerGrad.addColorStop(0, 'rgba(6, 8, 16, 0.90)');
  bannerGrad.addColorStop(0.35, 'rgba(5, 6, 14, 0.95)');
  bannerGrad.addColorStop(1, 'rgba(3, 4, 10, 0.98)');
  ctx.fillStyle = bannerGrad;
  ctx.fillRect(padding, bannerY, cardW, bannerH);

  // Hairline top border for the frosted panel
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padding, bannerY);
  ctx.lineTo(W - padding, bannerY);
  ctx.stroke();

  // Left vibrant accent glow bar
  ctx.fillStyle = accent.primary;
  ctx.shadowColor = accent.primary;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(padding + 28, bannerY + 26, 5, 84, 2.5);
  } else {
    ctx.fillRect(padding + 28, bannerY + 26, 5, 84);
  }
  ctx.fill();
  ctx.shadowBlur = 0;

  // Tool Title (Bold, High-Contrast Typography)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';

  // Responsive font scaling if tool name is long
  const displayTitle = tool.name;
  if (ctx.measureText(displayTitle).width > cardW - 280) {
    ctx.font = 'bold 30px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  }
  ctx.fillText(displayTitle, padding + 48, bannerY + 58);

  // Tool Tagline / Description
  ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(226, 232, 240, 0.92)';
  ctx.font = '500 17px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  let displayTagline = tool.tagline || tool.description || '';
  if (displayTagline.length > 68) {
    displayTagline = displayTagline.slice(0, 65) + '...';
  }
  ctx.fillText(displayTagline, padding + 48, bannerY + 98);
  ctx.restore();

  // Action Launch Pill on Bottom-Right
  const launchW = 138;
  const launchH = 44;
  const launchX = W - padding - 28 - launchW;
  const launchY = bannerY + 44;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(launchX, launchY, launchW, launchH, 22);
  } else {
    ctx.rect(launchX, launchY, launchW, launchH);
  }
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Pill CTA text
  ctx.font = 'bold 15px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OPEN ↗', launchX + launchW / 2, launchY + launchH / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.restore();

  // 4. Subtle glass specular sheen diagonal reflection across the card
  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
  sheen.addColorStop(0.35, 'rgba(255, 255, 255, 0.05)');
  sheen.addColorStop(0.5, 'transparent');
  sheen.addColorStop(0.7, 'rgba(255, 255, 255, 0.04)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
  ctx.fillStyle = sheen;
  ctx.fillRect(padding, padding, cardW, cardH);

  // 5. Subtle frosted glass border outline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore(); // Restore outer clip

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 16;
  return texture;
}
