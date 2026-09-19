const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "div",
  "span",
]);

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "target", "rel"],
  div: ["style"],
  span: ["style"],
  p: ["style"],
};

/**
 * Allowlist manual (sin DOMPurify) porque isomorphic-dompurify rompe al
 * empaquetarse en el runtime serverless de Vercel. El regex externo matchea
 * cualquier cosa con forma de tag, comillado o no, para que nada se cuele
 * sin pasar por el allowlist.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^<>]*)?>/g, (match) => {
    const closing = match.startsWith("</");
    const tag = (match.match(/^<\/?\s*([a-zA-Z][a-zA-Z0-9]*)/)?.[1] ?? "").toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (closing) return `</${tag}>`;

    const allowed = ALLOWED_ATTRS[tag] || [];
    let safeAttrs = "";
    const attrRegex = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(match))) {
      const attrName = m[1].toLowerCase();
      const value = m[2] !== undefined ? m[2] : m[3];
      if (!allowed.includes(attrName)) continue;
      if (attrName === "href" && /^\s*javascript:/i.test(value)) continue;
      safeAttrs += ` ${attrName}="${value.replace(/"/g, "&quot;")}"`;
    }
    return `<${tag}${safeAttrs}>`;
  });
}
