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
export {
  PostDetail,
  formatDate
};
