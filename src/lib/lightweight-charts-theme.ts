type Hsl = { h: number; s: number; l: number };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function parseHslTriplet(raw: string): Hsl | null {
  // Expected formats from CSS vars:
  //  - "222.2 84% 4.9%"
  //  - "222.2, 84%, 4.9%" (rare)
  const cleaned = raw.trim().replace(/,/g, " ").replace(/\s+/g, " ");
  if (!cleaned) return null;
  const parts = cleaned.split(" ");
  if (parts.length < 3) return null;

  const h = Number(parts[0]);
  const s = Number(parts[1].replace("%", ""));
  const l = Number(parts[2].replace("%", ""));
  if ([h, s, l].some((v) => Number.isNaN(v))) return null;
  return { h, s, l };
}

function hslToRgb({ h, s, l }: Hsl): { r: number; g: number; b: number } {
  // h: 0..360, s/l: 0..100
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;

  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (hh < 60) {
    rp = c;
    gp = x;
  } else if (hh < 120) {
    rp = x;
    gp = c;
  } else if (hh < 180) {
    gp = c;
    bp = x;
  } else if (hh < 240) {
    gp = x;
    bp = c;
  } else if (hh < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

function rgbaFromHsl(hsl: Hsl, alpha: number) {
  const { r, g, b } = hslToRgb(hsl);
  const a = clamp(alpha, 0, 1);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function rgbaFromCssVar(
  cssVarName: string,
  alpha = 1,
  fallback = `rgba(0, 0, 0, ${alpha})`
) {
  if (typeof window === "undefined") return fallback;

  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVarName);
  const parsed = parseHslTriplet(value);
  if (!parsed) return fallback;
  return rgbaFromHsl(parsed, alpha);
}

export function getLightweightChartTheme() {
  // Keep chart colors in sync with the design tokens.
  return {
    text: rgbaFromCssVar("--muted-foreground", 1, "rgba(120, 120, 120, 1)"),
    grid: rgbaFromCssVar("--border", 0.35, "rgba(0, 0, 0, 0.08)"),
    border: rgbaFromCssVar("--border", 0.6, "rgba(0, 0, 0, 0.12)"),
    crosshair: rgbaFromCssVar("--muted-foreground", 0.55, "rgba(120, 120, 120, 0.55)"),
    labelBg: rgbaFromCssVar("--background", 0.95, "rgba(255, 255, 255, 0.95)"),
    primary: rgbaFromCssVar("--primary", 1, "rgba(34, 197, 94, 1)"),
    primarySoft: rgbaFromCssVar("--primary", 0.25, "rgba(34, 197, 94, 0.25)"),
    destructive: rgbaFromCssVar("--destructive", 1, "rgba(239, 68, 68, 1)"),
  };
}
