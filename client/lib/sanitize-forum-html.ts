const ALLOWED_TAGS = new Set(["A", "B", "STRONG", "I", "EM", "U", "P", "DIV", "BR", "UL", "OL", "LI", "SPAN", "BLOCKQUOTE", "H1", "H2", "H3", "H4", "IMG"]);
const DROP_CONTENT_TAGS = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "TEMPLATE"]);

/** Sanitize rich-text markup from the community forum before rendering it. */
export function sanitizeForumHtml(html: string): string {
  if (typeof window === "undefined" || !html) return "";
  const document = new DOMParser().parseFromString(html, "text/html");
  const cleanChildren = (parent: ParentNode) => {
    for (const node of Array.from(parent.childNodes)) {
      if (!(node instanceof Element)) continue;
      if (DROP_CONTENT_TAGS.has(node.tagName)) {
        node.remove();
        continue;
      }
      cleanChildren(node);
      if (!ALLOWED_TAGS.has(node.tagName)) {
        node.replaceWith(...Array.from(node.childNodes));
        continue;
      }
      const tag = node.tagName;
      const originalHref = tag === "A" ? node.getAttribute("href") : null;
      const originalSrc = tag === "IMG" ? node.getAttribute("src") : null;
      const originalAlt = tag === "IMG" ? node.getAttribute("alt") : null;
      for (const attribute of Array.from(node.attributes)) node.removeAttribute(attribute.name);
      if (tag === "A") {
        if (originalHref) {
          try {
            const url = new URL(originalHref, window.location.origin);
            if (["http:", "https:", "mailto:"].includes(url.protocol)) {
              node.setAttribute("href", url.href);
              node.setAttribute("rel", "noopener noreferrer");
            }
          } catch { /* Drop malformed links. */ }
        }
      } else if (tag === "IMG") {
        if (originalSrc) {
          try {
            const url = new URL(originalSrc, window.location.origin);
            if (["http:", "https:"].includes(url.protocol)) node.setAttribute("src", url.href);
            else node.remove();
          } catch { node.remove(); }
        } else node.remove();
        if (originalAlt) node.setAttribute("alt", originalAlt.slice(0, 250));
      }
    }
  };
  cleanChildren(document.body);
  return document.body.innerHTML;
}
