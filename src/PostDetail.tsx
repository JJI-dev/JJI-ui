import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { formatDate as defaultFormatDate } from './formatDate'

/* ──────────────────────────────────────────────────────────────
   PostDetail — 글 상세 공통 컴포넌트
   사용처: space-frontend (Log, Life) / ne-frontend (Blog)

   - 상단 스크롤 진행바, 스크롤 시 헤더 숨김
   - 왼쪽 플로팅 바 (이전/다음, 링크 복사, 목록 서랍) → 1024px 이하에선 하단 캡슐
   - 오른쪽 목차 (본문 h2 기준) → 1280px 이하에선 숨김
   - 목록 서랍(Drawer)
   - 스크롤 reveal 애니메이션 (컴포넌트 자체 처리)
   - 썸네일 위치: 'top'(Log: 화면 상단 큰 이미지) | 'inline'(Life: 본문 안)
                 | 'cover'(Blog/Article: 색상 배경 + (카테고리) + 제목) | 'none'
     · cover 배경색은 글 데이터의 color('#B31B1B' 등)로 지정, 글자색은 자동(밝기 기준) 또는 textColor

   색·폰트는 사이트의 CSS 변수를 따름 (styles.css 상단 참고)
────────────────────────────────────────────────────────────── */

export interface PostSummary {
  id: string | number
  slug: string
  title: string
  category?: string
  /** 날짜 원본 문자열 ('2025-12-01', '2026. 3. 23.' 등) */
  date?: string
  thumbnail?: string
  tags?: string[]
  /** hero='cover' 배경색 (예: '#B31B1B') */
  color?: string
  /** hero='cover' 글자색 (기본: 배경 밝기에 따라 검정/흰색 자동) */
  textColor?: string
}

export interface PostDetailLabels {
  toc?: string
  tocEmpty?: string
  drawer?: string
  copied?: string
  copyFailed?: string
}

export interface PostDetailProps {
  post: PostSummary
  /** 이전/다음 글, 목록 서랍에 쓰이는 전체 목록 (표시 순서대로) */
  posts: PostSummary[]
  /** 상세 경로 prefix — '/log', '/life', '/blog' */
  basePath: string
  /** MDX 본문 */
  children?: ReactNode
  /** 썸네일 위치 (기본 'inline') */
  hero?: 'top' | 'inline' | 'cover' | 'none'
  /** 날짜 표시 (기본 true). false여도 데이터의 date는 그대로 유지 */
  showDate?: boolean
  /** 오른쪽 목차 표시 (기본 true) */
  toc?: boolean
  /** 스크롤 시 사이트 헤더 숨김 (기본 true) */
  hideHeaderOnScroll?: boolean
  /** 숨길 헤더 선택자 (기본 'header') */
  headerSelector?: string
  /** 날짜 옆에 붙는 추가 메타 (예: 조회수) */
  metaExtra?: ReactNode
  /** 본문 아래 '목록으로' 링크 */
  backLink?: { href: string; label: string }
  labels?: PostDetailLabels
  formatDate?: (raw?: string) => string
}

const DEFAULT_LABELS: Required<PostDetailLabels> = {
  toc: 'On This Page',
  tocEmpty: '목차가 없습니다.',
  drawer: '목록',
  copied: '링크 복사가 완료되었습니다!',
  copyFailed: '링크 복사에 실패했습니다',
}

const REVEAL = 'jji-pd-reveal'
const CONTENT_REVEAL_TARGETS = 'h1, h2, h3, h4, p, ol, ul, pre, blockquote, img, figure, table'

/** 배경색 위에서 읽기 좋은 글자색 (아주 어두운 배경만 흰색) */
function readableOn(color?: string): string | undefined {
  const m = color?.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!m) return undefined
  const hex = m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1]
  const [r, g, b] = [0, 2, 4].map(i => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum < 0.06 ? '#ffffff' : '#0a0a0a'
}

const ArrowLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
)
const ArrowRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
)

export function PostDetail({
  post,
  posts,
  basePath,
  children,
  hero = 'inline',
  showDate = true,
  toc: showToc = true,
  hideHeaderOnScroll = true,
  headerSelector = 'header',
  metaExtra,
  backLink,
  labels: labelsProp,
  formatDate = defaultFormatDate,
}: PostDetailProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const base = basePath.replace(/\/$/, '')
  const href = (p: PostSummary) => `${base}/${p.slug}`

  const idx  = posts.findIndex(p => p.id === post.id)
  const prev = idx > 0 ? posts[idx - 1] : undefined
  const next = idx >= 0 ? posts[idx + 1] : undefined

  const rootRef    = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [showBar,  setShowBar]  = useState(false)
  const [progress, setProgress] = useState(0)
  const [drawer,   setDrawer]   = useState(false)
  const [toast,    setToast]    = useState<{ msg: string; on: boolean }>({ msg: '', on: false })
  const [toc,      setToc]      = useState<{ id: string; text: string }[]>([])

  /* 스크롤: 진행바 / 플로팅 바 / 헤더 숨김 */
  useEffect(() => {
    const header = hideHeaderOnScroll ? (document.querySelector(headerSelector) as HTMLElement | null) : null
    const onScroll = () => {
      const y = window.scrollY
      setShowBar(y > 200)
      if (header) {
        header.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        header.style.transform  = y > 200 ? 'translateY(-100%)' : 'translateY(0)'
      }
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h > 0 ? (y / h) * 100 : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (header) header.style.transform = 'translateY(0)'
    }
  }, [post.id, hideHeaderOnScroll, headerSelector])

  /* 스크롤 reveal — threshold 0: 화면보다 긴 요소도 1px만 보이면 표시 */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    contentRef.current?.querySelectorAll(CONTENT_REVEAL_TARGETS).forEach(el => el.classList.add(REVEAL))

    const io = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          entry.target.classList.add('is-revealed')
          io.unobserve(entry.target)
        }
      }),
      { threshold: 0, rootMargin: '0px 0px -8% 0px' }
    )
    root.querySelectorAll(`.${REVEAL}:not(.is-revealed)`).forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [post.id, children])

  /* 목차: 본문 h2 수집 */
  useEffect(() => {
    if (!showToc) return
    const area = contentRef.current
    if (!area) return
    const items = Array.from(area.querySelectorAll('h2')).map((h, i) => {
      if (!h.id) h.id = `${(h.textContent || 'heading').trim().replace(/\s+/g, '-')}-${i}`
      return { id: h.id, text: h.textContent || '' }
    })
    setToc(items)
  }, [post.id, children, showToc])

  /* 서랍: ESC로 닫기 */
  useEffect(() => {
    if (!drawer) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawer(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawer])

  const showToast = (msg: string) => {
    setToast({ msg, on: true })
    window.setTimeout(() => setToast(t => ({ ...t, on: false })), 2500)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast(labels.copied))
      .catch(() => showToast(labels.copyFailed))
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' })
  }

  const date = showDate ? formatDate(post.date) : ''
  const cover = hero === 'cover'

  const article = (
    <article>
      {!cover && post.category && <p className={`jji-pd-category ${REVEAL}`}>{post.category}</p>}
      {!cover && <h1 className={`jji-pd-title ${REVEAL}`}>{post.title}</h1>}
      {!cover && (date || metaExtra) && (
        <div className={`jji-pd-meta ${REVEAL}`}>
          {date && <span>{date}</span>}
          {date && metaExtra && <span aria-hidden>·</span>}
          {metaExtra}
        </div>
      )}

      {hero === 'inline' && post.thumbnail && (
        <div className={`jji-pd-hero-inline ${REVEAL}`}>
          <img src={post.thumbnail} alt={post.title} />
        </div>
      )}

      <div ref={contentRef} className="jji-pd-content">{children}</div>

      {post.tags && post.tags.length > 0 && (
        <div className={`jji-pd-tags ${REVEAL}`}>
          {post.tags.map(t => <span key={t} className="jji-pd-tag">{t}</span>)}
        </div>
      )}

      {backLink && <Link href={backLink.href} className={`jji-pd-back ${REVEAL}`}>{backLink.label}</Link>}
    </article>
  )

  return (
    <div ref={rootRef} className={cover ? 'jji-pd jji-pd--cover' : 'jji-pd'}>
      <div className="jji-pd-progress"><div className="jji-pd-progress-bar" style={{ width: `${progress}%` }} /></div>
      <div className={`jji-pd-toast${toast.on ? ' is-on' : ''}`} role="status">{toast.msg}</div>

      {hero === 'top' && (
        <div className="jji-pd-hero-top">
          {post.thumbnail ? <img src={post.thumbnail} alt={post.title} /> : <div className="jji-pd-hero-placeholder" />}
        </div>
      )}

      {cover && (
        <div
          className="jji-pd-cover"
          style={{
            ...(post.color ? { '--jji-pd-cover-bg': post.color } : {}),
            ...((post.textColor || readableOn(post.color)) ? { '--jji-pd-cover-fg': post.textColor || readableOn(post.color) } : {}),
          } as CSSProperties}
        >
          {post.category && <p className={`jji-pd-cover-category ${REVEAL}`}>({post.category})</p>}
          <h1 className={`jji-pd-cover-title ${REVEAL}`}>{post.title}</h1>
          {(date || metaExtra) && (
            <div className={`jji-pd-cover-meta ${REVEAL}`}>
              {date && <span>{date}</span>}
              {date && metaExtra && <span aria-hidden>·</span>}
              {metaExtra}
            </div>
          )}
        </div>
      )}

      <div className={hero === 'top' ? 'jji-pd-body jji-pd-body--over-hero' : 'jji-pd-body'}>
        <div className="jji-pd-wrap">
          {/* 왼쪽 플로팅 바 */}
          <aside className="jji-pd-bar-rail">
            <div className={`jji-pd-bar${showBar ? ' is-visible' : ''}`}>
              {prev
                ? <Link href={href(prev)} className="jji-pd-btn" aria-label="이전 글"><ArrowLeft /></Link>
                : <button type="button" className="jji-pd-btn" disabled aria-label="이전 글 없음"><ArrowLeft /></button>}
              {next
                ? <Link href={href(next)} className="jji-pd-btn" aria-label="다음 글"><ArrowRight /></Link>
                : <button type="button" className="jji-pd-btn" disabled aria-label="다음 글 없음"><ArrowRight /></button>}
              <button type="button" className="jji-pd-btn" onClick={copyLink} aria-label="링크 복사">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              </button>
              <button type="button" className="jji-pd-btn" onClick={() => setDrawer(true)} aria-label="글 목록">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              </button>
            </div>
          </aside>

          {article}

          {/* 오른쪽 목차 */}
          {showToc && (
            <div className="jji-pd-toc-rail">
              <aside className="jji-pd-toc">
                <p className="jji-pd-toc-title">{labels.toc}</p>
                <div className="jji-pd-toc-list">
                  {toc.length > 0
                    ? toc.map(item => (
                        <button type="button" key={item.id} onClick={() => scrollTo(item.id)} className="jji-pd-toc-link">{item.text}</button>
                      ))
                    : <p className="jji-pd-toc-empty">{labels.tocEmpty}</p>}
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>

      {/* 목록 서랍 */}
      <div className={`jji-pd-overlay${drawer ? ' is-open' : ''}`} onClick={() => setDrawer(false)} />
      <aside className={`jji-pd-drawer${drawer ? ' is-open' : ''}`} aria-hidden={!drawer}>
        <div className="jji-pd-drawer-head">
          <h2>{labels.drawer}</h2>
          <button type="button" onClick={() => setDrawer(false)} className="jji-pd-close" aria-label="목록 닫기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="5" y1="12" x2="19" y2="12" className="l1" />
              <line x1="5" y1="12" x2="19" y2="12" className="l2" />
            </svg>
          </button>
        </div>
        <div className="jji-pd-drawer-list">
          {posts.map(item => (
            <Link
              key={item.id}
              href={href(item)}
              className={`jji-pd-drawer-item${item.id === post.id ? ' is-current' : ''}`}
              onClick={() => setDrawer(false)}
            >
              <div className="jji-pd-drawer-img">{item.thumbnail ? <img src={item.thumbnail} alt="" /> : null}</div>
              <div className="jji-pd-drawer-body">
                <h4>{item.title}</h4>
                <p>{[item.category, showDate ? formatDate(item.date) : ''].filter(Boolean).join(' · ')}</p>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  )
}
