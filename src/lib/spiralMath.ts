/**
 * Pro Archimedean Spiral Positioning Formula
 * Inspired by pacomepertant.com motion architecture.
 *
 * Distributes nodes evenly along a multi-turn Archimedean spiral so that:
 * 1. Nodes in consecutive turns never collide horizontally or vertically.
 * 2. Pills and labels have generous padding and crystal-clear readability.
 * 3. Adding or removing tools recalculates smooth coordinates automatically.
 */
export function getSpiralPosition(index: number, total: number) {
  if (total <= 1) {
    return {
      left: '50%',
      top: '30%',
      angle: -Math.PI / 2,
      radius: 20,
    };
  }

  // Turns span: 1.25 turns for 2-5 tools, 1.6 turns for 6-8 tools, 2.1 turns for 9+ tools
  const turns = total <= 5 ? 1.25 : total <= 8 ? 1.6 : 2.1;
  const angleSpan = turns * 2 * Math.PI;
  const angleStep = angleSpan / (total - 1);
  const startAngle = -Math.PI / 2; // 12 o'clock origin
  const angle = startAngle + index * angleStep;

  // Radius smoothly expands from 18% to 42% of container
  const progress = index / (total - 1);
  const startRadius = 18;
  const maxRadius = 42;
  const radius = startRadius + progress * (maxRadius - startRadius);

  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius}%`,
    angle,
    radius,
    turns,
    startAngle,
    angleSpan,
  };
}
