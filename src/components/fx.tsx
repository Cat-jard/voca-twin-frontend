"use client";

import React, { useState } from "react";

/**
 * Convierte una cadena CSS inline ("display: flex; gap: 11px; ...") en un
 * objeto de estilos válido para React. Permite migrar los estilos originales
 * del HTML verbatim, garantizando fidelidad visual 1:1.
 */
export function css(input: string): React.CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of input.split(";")) {
    const i = decl.indexOf(":");
    if (i === -1) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop) continue;
    // Custom properties (--px, --py, ...) se mantienen tal cual.
    if (prop.startsWith("--")) {
      out[prop] = val;
      continue;
    }
    const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = val;
  }
  return out as React.CSSProperties;
}

type FxProps = {
  as?: React.ElementType;
  base: string;
  hover?: string;
  active?: string;
  focus?: string;
  style?: React.CSSProperties;
} & Record<string, unknown>;

/**
 * Reemplaza los pseudo-estados del DSL original (style-hover, style-active,
 * style-focus) usando estado de React, ya que los estilos inline de React no
 * soportan :hover/:active/:focus.
 */
export function Fx({ as = "div", base, hover, active, focus, style, ...rest }: FxProps) {
  const [h, setH] = useState(false);
  const [a, setA] = useState(false);
  const [f, setF] = useState(false);
  const Tag = as as React.ElementType;

  const merged: React.CSSProperties = {
    ...css(base),
    ...(h && hover ? css(hover) : {}),
    ...(a && active ? css(active) : {}),
    ...(f && focus ? css(focus) : {}),
    ...(style || {}),
  };

  const handlers = rest as Record<string, ((e: unknown) => void) | undefined>;

  return (
    <Tag
      {...rest}
      style={merged}
      onMouseEnter={(e: unknown) => { setH(true); handlers.onMouseEnter?.(e); }}
      onMouseLeave={(e: unknown) => { setH(false); setA(false); handlers.onMouseLeave?.(e); }}
      onMouseDown={(e: unknown) => { setA(true); handlers.onMouseDown?.(e); }}
      onMouseUp={(e: unknown) => { setA(false); handlers.onMouseUp?.(e); }}
      onFocus={(e: unknown) => { setF(true); handlers.onFocus?.(e); }}
      onBlur={(e: unknown) => { setF(false); handlers.onBlur?.(e); }}
    />
  );
}
