import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const hashToHsl = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue} 85% 60%)`;
};

export const getLabelName = (label) => {
  if (isNonEmptyString(label)) return label.trim();
  if (!label || typeof label !== "object") return "";

  return String(
    label.name ??
    label.labelName ??
    label.customName ??
    label.field ??
    label.label ??
    label.content ??
    "",
  ).trim();
};

export const getLabelColor = (label, fallbackName = "") => {
  const rawColor =
    typeof label === "string"
      ? ""
      : label?.color ??
      label?.defaultColor ??
      label?.colorCode ??
      label?.labelColor ??
      label?.hexColor ??
      label?.value;

  if (isNonEmptyString(rawColor)) return rawColor.trim();

  const name = fallbackName || getLabelName(label);
  return name ? hashToHsl(name) : "#3b82f6";
};

export const normalizeLabel = (label) => {
  const name = getLabelName(label);
  return {
    ...(label && typeof label === "object" ? label : {}),
    name,
    color: getLabelColor(label, name),
  };
};

export const normalizeLabels = (labels = []) =>
  Array.isArray(labels) ? labels.map(normalizeLabel) : [];

export const withAlphaBackground = (color, alpha = 0.2) => {
  const c = String(color || "").trim();
  if (!c) return "transparent";

  if (c.startsWith("#")) {
    if (c.length === 7) return `${c}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
    if (c.length === 4) {
      const r = c[1];
      const g = c[2];
      const b = c[3];
      return `#${r}${r}${g}${g}${b}${b}${Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`;
    }
    return c;
  }

  if (c.startsWith("rgb(") && c.endsWith(")")) {
    return c.replace(/^rgb\((.*)\)$/, `rgba($1, ${alpha})`);
  }

  if (c.startsWith("rgba(") || c.startsWith("hsla(")) {
    return c;
  }

  if (c.startsWith("hsl(") && c.endsWith(")")) {
    return `${c.slice(0, -1)} / ${alpha})`;
  }

  return c;
};
