"use client";

// src/PostDetail.tsx
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// src/formatDate.ts
function formatDate(raw) {
  if (!raw) return "";
  const trimmed = raw.trim();
  const dotted = trimmed.match(/^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?$/);
  if (dotted) {
    const [, y, m, d] = dotted;
    return `${y}.${m.padStart(2, "0")}.${d.padStart(2, "0")}`;
  }
  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const [, y, m, d] = iso;
    return `${y}.${m.padStart(2, "0")}.${d.padStart(2, "0")}`;
  }
  return trimmed;
}

// src/PostDetail.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var DEFAULT_LABELS = {
  toc: "On This Page",
  tocEmpty: "\uBAA9\uCC28\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  drawer: "\uBAA9\uB85D",
  copied: "\uB9C1\uD06C \uBCF5\uC0AC\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!",
  copyFailed: "\uB9C1\uD06C \uBCF5\uC0AC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4"
};
var REVEAL = "jji-pd-reveal";
var CONTENT_REVEAL_TARGETS = "h1, h2, h3, h4, p, ol, ul, pre, blockquote, img, figure, table";
var ArrowLeft = () => /* @__PURE__ */ jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: /* @__PURE__ */ jsx("path", { d: "M19 12H5M12 19l-7-7 7-7" }) });
var ArrowRight = () => /* @__PURE__ */ jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: /* @__PURE__ */ jsx("path", { d: "M5 12h14M12 5l7 7-7 7" }) });
function PostDetail({
  post,
  posts,
  basePath,
  children,
  hero = "inline",
  toc: showToc = true,
  hideHeaderOnScroll = true,
  headerSelector = "header",
  metaExtra,
  backLink,
  labels: labelsProp,
  formatDate: formatDate2 = formatDate
}) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const base = basePath.replace(/\/$/, "");
  const href = (p) => `${base}/${p.slug}`;
  const idx = posts.findIndex((p) => p.id === post.id);
  const prev = idx > 0 ? posts[idx - 1] : void 0;
  const next = idx >= 0 ? posts[idx + 1] : void 0;
  const rootRef = useRef(null);
  const contentRef = useRef(null);
  const [showBar, setShowBar] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState({ msg: "", on: false });
  const [toc, setToc] = useState([]);
  useEffect(() => {
    const header = hideHeaderOnScroll ? document.querySelector(headerSelector) : null;
    const onScroll = () => {
      const y = window.scrollY;
      setShowBar(y > 200);
      if (header) {
        header.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
        header.style.transform = y > 200 ? "translateY(-100%)" : "translateY(0)";
      }
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? y / h * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (header) header.style.transform = "translateY(0)";
    };
  }, [post.id, hideHeaderOnScroll, headerSelector]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    contentRef.current?.querySelectorAll(CONTENT_REVEAL_TARGETS).forEach((el) => el.classList.add(REVEAL));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      }),
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    root.querySelectorAll(`.${REVEAL}:not(.is-revealed)`).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [post.id, children]);
  useEffect(() => {
    if (!showToc) return;
    const area = contentRef.current;
    if (!area) return;
    const items = Array.from(area.querySelectorAll("h2")).map((h, i) => {
      if (!h.id) h.id = `${(h.textContent || "heading").trim().replace(/\s+/g, "-")}-${i}`;
      return { id: h.id, text: h.textContent || "" };
    });
    setToc(items);
  }, [post.id, children, showToc]);
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e) => {
      if (e.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);
  const showToast = (msg) => {
    setToast({ msg, on: true });
    window.setTimeout(() => setToast((t) => ({ ...t, on: false })), 2500);
  };
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => showToast(labels.copied)).catch(() => showToast(labels.copyFailed));
  };
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
  };
  const date = formatDate2(post.date);
  const article = /* @__PURE__ */ jsxs("article", { children: [
    post.category && /* @__PURE__ */ jsx("p", { className: `jji-pd-category ${REVEAL}`, children: post.category }),
    /* @__PURE__ */ jsx("h1", { className: `jji-pd-title ${REVEAL}`, children: post.title }),
    (date || metaExtra) && /* @__PURE__ */ jsxs("div", { className: `jji-pd-meta ${REVEAL}`, children: [
      date && /* @__PURE__ */ jsx("span", { children: date }),
      date && metaExtra && /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "\xB7" }),
      metaExtra
    ] }),
    hero === "inline" && post.thumbnail && /* @__PURE__ */ jsx("div", { className: `jji-pd-hero-inline ${REVEAL}`, children: /* @__PURE__ */ jsx("img", { src: post.thumbnail, alt: post.title }) }),
    /* @__PURE__ */ jsx("div", { ref: contentRef, className: "jji-pd-content", children }),
    post.tags && post.tags.length > 0 && /* @__PURE__ */ jsx("div", { className: `jji-pd-tags ${REVEAL}`, children: post.tags.map((t) => /* @__PURE__ */ jsx("span", { className: "jji-pd-tag", children: t }, t)) }),
    backLink && /* @__PURE__ */ jsx(Link, { href: backLink.href, className: `jji-pd-back ${REVEAL}`, children: backLink.label })
  ] });
  return /* @__PURE__ */ jsxs("div", { ref: rootRef, className: "jji-pd", children: [
    /* @__PURE__ */ jsx("div", { className: "jji-pd-progress", children: /* @__PURE__ */ jsx("div", { className: "jji-pd-progress-bar", style: { width: `${progress}%` } }) }),
    /* @__PURE__ */ jsx("div", { className: `jji-pd-toast${toast.on ? " is-on" : ""}`, role: "status", children: toast.msg }),
    hero === "top" && /* @__PURE__ */ jsx("div", { className: "jji-pd-hero-top", children: post.thumbnail ? /* @__PURE__ */ jsx("img", { src: post.thumbnail, alt: post.title }) : /* @__PURE__ */ jsx("div", { className: "jji-pd-hero-placeholder" }) }),
    /* @__PURE__ */ jsx("div", { className: hero === "top" ? "jji-pd-body jji-pd-body--over-hero" : "jji-pd-body", children: /* @__PURE__ */ jsxs("div", { className: "jji-pd-wrap", children: [
      /* @__PURE__ */ jsx("aside", { className: "jji-pd-bar-rail", children: /* @__PURE__ */ jsxs("div", { className: `jji-pd-bar${showBar ? " is-visible" : ""}`, children: [
        prev ? /* @__PURE__ */ jsx(Link, { href: href(prev), className: "jji-pd-btn", "aria-label": "\uC774\uC804 \uAE00", children: /* @__PURE__ */ jsx(ArrowLeft, {}) }) : /* @__PURE__ */ jsx("button", { type: "button", className: "jji-pd-btn", disabled: true, "aria-label": "\uC774\uC804 \uAE00 \uC5C6\uC74C", children: /* @__PURE__ */ jsx(ArrowLeft, {}) }),
        next ? /* @__PURE__ */ jsx(Link, { href: href(next), className: "jji-pd-btn", "aria-label": "\uB2E4\uC74C \uAE00", children: /* @__PURE__ */ jsx(ArrowRight, {}) }) : /* @__PURE__ */ jsx("button", { type: "button", className: "jji-pd-btn", disabled: true, "aria-label": "\uB2E4\uC74C \uAE00 \uC5C6\uC74C", children: /* @__PURE__ */ jsx(ArrowRight, {}) }),
        /* @__PURE__ */ jsx("button", { type: "button", className: "jji-pd-btn", onClick: copyLink, "aria-label": "\uB9C1\uD06C \uBCF5\uC0AC", children: /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ jsx("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
          /* @__PURE__ */ jsx("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })
        ] }) }),
        /* @__PURE__ */ jsx("button", { type: "button", className: "jji-pd-btn", onClick: () => setDrawer(true), "aria-label": "\uAE00 \uBAA9\uB85D", children: /* @__PURE__ */ jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
          /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
          /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
          /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
        ] }) })
      ] }) }),
      article,
      showToc && /* @__PURE__ */ jsx("div", { className: "jji-pd-toc-rail", children: /* @__PURE__ */ jsxs("aside", { className: "jji-pd-toc", children: [
        /* @__PURE__ */ jsx("p", { className: "jji-pd-toc-title", children: labels.toc }),
        /* @__PURE__ */ jsx("div", { className: "jji-pd-toc-list", children: toc.length > 0 ? toc.map((item) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => scrollTo(item.id), className: "jji-pd-toc-link", children: item.text }, item.id)) : /* @__PURE__ */ jsx("p", { className: "jji-pd-toc-empty", children: labels.tocEmpty }) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: `jji-pd-overlay${drawer ? " is-open" : ""}`, onClick: () => setDrawer(false) }),
    /* @__PURE__ */ jsxs("aside", { className: `jji-pd-drawer${drawer ? " is-open" : ""}`, "aria-hidden": !drawer, children: [
      /* @__PURE__ */ jsxs("div", { className: "jji-pd-drawer-head", children: [
        /* @__PURE__ */ jsx("h2", { children: labels.drawer }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setDrawer(false), className: "jji-pd-close", "aria-label": "\uBAA9\uB85D \uB2EB\uAE30", children: /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: [
          /* @__PURE__ */ jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12", className: "l1" }),
          /* @__PURE__ */ jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12", className: "l2" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "jji-pd-drawer-list", children: posts.map((item) => /* @__PURE__ */ jsxs(
        Link,
        {
          href: href(item),
          className: `jji-pd-drawer-item${item.id === post.id ? " is-current" : ""}`,
          onClick: () => setDrawer(false),
          children: [
            /* @__PURE__ */ jsx("div", { className: "jji-pd-drawer-img", children: item.thumbnail ? /* @__PURE__ */ jsx("img", { src: item.thumbnail, alt: "" }) : null }),
            /* @__PURE__ */ jsxs("div", { className: "jji-pd-drawer-body", children: [
              /* @__PURE__ */ jsx("h4", { children: item.title }),
              /* @__PURE__ */ jsx("p", { children: [item.category, formatDate2(item.date)].filter(Boolean).join(" \xB7 ") })
            ] })
          ]
        },
        item.id
      )) })
    ] })
  ] });
}

// src/CategoryGrid.tsx
import { useEffect as useEffect2, useMemo, useRef as useRef2, useState as useState2 } from "react";
import Link2 from "next/link";
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var SearchIcon = () => /* @__PURE__ */ jsxs2("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": true, children: [
  /* @__PURE__ */ jsx2("circle", { cx: "21", cy: "21", r: "16", fill: "white", stroke: "currentColor", strokeWidth: "3.5" }),
  /* @__PURE__ */ jsx2("line", { x1: "33", y1: "33", x2: "42", y2: "42", stroke: "currentColor", strokeWidth: "4.5", strokeLinecap: "round" })
] });
function CategoryGrid({
  categories,
  items,
  getKey,
  renderItem,
  matches,
  allCategory,
  initialCategory,
  onCategoryChange,
  onSearchClick,
  getSearchText,
  searchPlaceholder = "\uAC80\uC0C9",
  hideSearch = false,
  emptyText = "\uD574\uB2F9 \uCE74\uD14C\uACE0\uB9AC\uC758 \uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"
}) {
  const all = allCategory ?? categories[0];
  const [active, setActive] = useState2(initialCategory ?? all);
  const [searchOpen, setSearchOpen] = useState2(false);
  const [query, setQuery] = useState2("");
  const gridRef = useRef2(null);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (item) => (active === all || (matches ? matches(item, active) : false)) && (!q || !getSearchText || getSearchText(item).toLowerCase().includes(q))
    );
  }, [items, active, all, matches, query, getSearchText]);
  const gridKey = `${active}::${query}`;
  useEffect2(() => {
    const el = gridRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      }),
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    el.querySelectorAll(".jji-cg-cell").forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [gridKey]);
  const select = (c) => {
    setActive(c);
    onCategoryChange?.(c);
  };
  const inlineSearch = !onSearchClick && !!getSearchText;
  return /* @__PURE__ */ jsxs2("div", { className: "jji-cg", children: [
    /* @__PURE__ */ jsx2("div", { className: "jji-cg-rail jji-cg-rail--left", children: /* @__PURE__ */ jsx2("nav", { className: "jji-cg-categories", "aria-label": "\uCE74\uD14C\uACE0\uB9AC", children: categories.map((c) => /* @__PURE__ */ jsx2(
      "button",
      {
        type: "button",
        className: `jji-cg-category${active === c ? " is-active" : ""}`,
        "aria-pressed": active === c,
        onClick: () => select(c),
        children: c
      },
      c
    )) }) }),
    !hideSearch && (onSearchClick || inlineSearch) && /* @__PURE__ */ jsx2("div", { className: "jji-cg-rail jji-cg-rail--right", children: /* @__PURE__ */ jsxs2("div", { className: "jji-cg-search", children: [
      inlineSearch && searchOpen && /* @__PURE__ */ jsx2(
        "input",
        {
          autoFocus: true,
          value: query,
          onChange: (e) => setQuery(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Escape") {
              setQuery("");
              setSearchOpen(false);
            }
          },
          placeholder: searchPlaceholder,
          "aria-label": searchPlaceholder
        }
      ),
      /* @__PURE__ */ jsx2(
        "button",
        {
          type: "button",
          className: "jji-cg-search-btn",
          "aria-label": inlineSearch && searchOpen ? "\uAC80\uC0C9 \uB2EB\uAE30" : "\uAC80\uC0C9",
          onClick: () => {
            if (onSearchClick) return onSearchClick();
            if (searchOpen) setQuery("");
            setSearchOpen((o) => !o);
          },
          children: /* @__PURE__ */ jsx2(SearchIcon, {})
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx2("div", { className: "jji-cg-spacer" }),
    filtered.length === 0 ? /* @__PURE__ */ jsx2("div", { className: "jji-cg-empty", children: emptyText }) : /* @__PURE__ */ jsx2("div", { ref: gridRef, className: "jji-cg-grid", children: filtered.map((item, i) => /* @__PURE__ */ jsx2("div", { className: `jji-cg-cell jji-cg-delay-${i % 3 + 1}`, children: renderItem(item, i) }, getKey(item))) }, gridKey)
  ] });
}
function MetaCol({ rows, align }) {
  if (!rows?.length) return /* @__PURE__ */ jsx2("div", {});
  return /* @__PURE__ */ jsx2("div", { className: `jji-tile-meta-col is-${align}`, children: rows.map(([label, value]) => /* @__PURE__ */ jsxs2("div", { children: [
    /* @__PURE__ */ jsxs2("span", { className: "jji-tile-label", children: [
      label,
      " : "
    ] }),
    /* @__PURE__ */ jsx2("span", { className: "jji-tile-value", children: value ?? "-" })
  ] }, label)) });
}
function GridTile({ href, thumbnail, alt = "", metaLeft, metaRight, badge }) {
  const inner = /* @__PURE__ */ jsxs2(Fragment, { children: [
    /* @__PURE__ */ jsx2("div", { className: "jji-tile-inner", children: thumbnail && /* @__PURE__ */ jsx2("img", { src: thumbnail, alt }) }),
    badge && /* @__PURE__ */ jsx2("div", { className: "jji-tile-badge", children: /* @__PURE__ */ jsx2("span", { children: badge }) }),
    /* @__PURE__ */ jsxs2("div", { className: "jji-tile-overlay", children: [
      /* @__PURE__ */ jsx2(MetaCol, { rows: metaLeft, align: "left" }),
      /* @__PURE__ */ jsx2(MetaCol, { rows: metaRight, align: "right" })
    ] })
  ] });
  if (badge || !href) {
    return /* @__PURE__ */ jsx2("div", { className: `jji-tile${badge ? " is-disabled" : ""}`, children: inner });
  }
  return /* @__PURE__ */ jsx2(Link2, { href, className: "jji-tile", children: inner });
}

// src/RevealScope.tsx
import { createElement, useEffect as useEffect3, useRef as useRef3 } from "react";
var DEFAULT_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "ul",
  "ol",
  "blockquote",
  "pre",
  "table",
  "img",
  "video",
  "picture",
  "figure",
  ".reveal",
  "[data-reveal]"
].join(", ");
var IMAGE_TAGS = /* @__PURE__ */ new Set(["IMG", "VIDEO", "PICTURE", "FIGURE"]);
function RevealScope({
  children,
  as = "div",
  selector = DEFAULT_SELECTOR,
  extraSelector,
  stagger = 0.12,
  ...rest
}) {
  const ref = useRef3(null);
  useEffect3(() => {
    const root = ref.current;
    if (!root) return;
    const sel = extraSelector ? `${selector}, ${extraSelector}` : selector;
    const prepare = () => {
      const candidates = Array.from(root.querySelectorAll(sel)).filter((el) => el.dataset.reveal !== "none" && !el.classList.contains("jji-rv"));
      const set = new Set(candidates);
      const targets = candidates.filter((el) => {
        for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
          if (set.has(p) || p.classList.contains("jji-rv")) return false;
        }
        return true;
      });
      targets.forEach((el) => {
        const isImage = el.dataset.reveal === "image" || IMAGE_TAGS.has(el.tagName);
        el.classList.add("jji-rv", isImage ? "jji-rv--image" : "jji-rv--up");
      });
      return targets;
    };
    const io = new IntersectionObserver(
      (entries) => {
        let order = 0;
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.style.transitionDelay = `${Math.min(order++ * stagger, 0.6)}s`;
            el.classList.add("is-in");
            io.unobserve(el);
          } else if (entry.boundingClientRect.bottom < 0) {
            el.classList.add("is-in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    prepare().forEach((el) => io.observe(el));
    let raf = 0;
    const mo = new MutationObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        prepare().forEach((el) => io.observe(el));
      });
    });
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [selector, extraSelector, stagger]);
  return createElement(as, { ref, ...rest }, children);
}
export {
  CategoryGrid,
  GridTile,
  PostDetail,
  RevealScope,
  formatDate
};
