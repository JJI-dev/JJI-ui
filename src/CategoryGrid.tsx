import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'

/* ──────────────────────────────────────────────────────────────
   CategoryGrid — 왼쪽 세로 카테고리 + 오른쪽 검색 + 3열 목록
   (ne-frontend Work 레이아웃 → Blog 공통 레이아웃으로 전환)
   사용처: ne-frontend Work·Blog / mo-frontend Blog

   - 카테고리·검색은 목록 영역 안에서 sticky → 목록이 끝나면 함께 올라감 (푸터에 안 잘림)
   - 768px 이하: 고정 해제, 일반 흐름
   - 타일 등장 애니메이션은 컴포넌트 자체 처리
────────────────────────────────────────────────────────────── */

export interface CategoryGridProps<T> {
  /** 표시 순서대로. 첫 번째(또는 allCategory)는 '전체' */
  categories: readonly string[]
  items: T[]
  getKey: (item: T) => string | number
  renderItem: (item: T, index: number) => ReactNode
  /** 카테고리 매칭 (기본: 전체 카테고리면 모두 통과, 아니면 통과 안 함) */
  matches?: (item: T, category: string) => boolean
  /** '전체' 카테고리 이름 (기본: categories[0]) */
  allCategory?: string
  initialCategory?: string
  onCategoryChange?: (category: string) => void
  /** 검색 버튼 클릭 시 외부 검색 열기 (예: SpotlightSearch) */
  onSearchClick?: () => void
  /** onSearchClick이 없을 때: 아이콘 옆 입력창으로 목록 필터 */
  getSearchText?: (item: T) => string
  searchPlaceholder?: string
  /** 검색 버튼 숨김 */
  hideSearch?: boolean
  emptyText?: ReactNode
}

/* 돋보기 — 기존 ne Work의 작은 버전 (30px) */
const SearchIcon = () => (
  <svg width="30" height="30" viewBox="0 0 64 62" fill="none" aria-hidden>
    <rect x="35.918" y="30" width="36" height="10.8473" rx="4" transform="rotate(39.6266 35.918 30)" fill="currentColor" />
    <circle cx="29" cy="29" r="26" fill="white" stroke="currentColor" strokeWidth="6" />
  </svg>
)

export function CategoryGrid<T>({
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
  searchPlaceholder = '검색',
  hideSearch = false,
  emptyText = '해당 카테고리의 글이 없습니다',
}: CategoryGridProps<T>) {
  const all = allCategory ?? categories[0]
  const [active, setActive]         = useState(initialCategory ?? all)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery]           = useState('')
  const gridRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(item =>
      (active === all || (matches ? matches(item, active) : false)) &&
      (!q || !getSearchText || getSearchText(item).toLowerCase().includes(q))
    )
  }, [items, active, all, matches, query, getSearchText])

  const gridKey = `${active}::${query}`

  /* 타일 등장 애니메이션 — 필터 바뀔 때마다 다시 */
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          entry.target.classList.add('is-revealed')
          io.unobserve(entry.target)
        }
      }),
      { threshold: 0, rootMargin: '0px 0px -8% 0px' }
    )
    el.querySelectorAll('.jji-cg-cell').forEach(c => io.observe(c))
    return () => io.disconnect()
  }, [gridKey])

  const select = (c: string) => {
    setActive(c)
    onCategoryChange?.(c)
  }

  const inlineSearch = !onSearchClick && !!getSearchText

  return (
    <div className="jji-cg">
      {/* 카테고리 */}
      <div className="jji-cg-rail jji-cg-rail--left">
        <nav className="jji-cg-categories" aria-label="카테고리">
          {categories.map(c => (
            <button
              key={c}
              type="button"
              className={`jji-cg-category${active === c ? ' is-active' : ''}`}
              aria-pressed={active === c}
              onClick={() => select(c)}
            >
              {c}
            </button>
          ))}
        </nav>
      </div>

      {/* 검색 */}
      {!hideSearch && (onSearchClick || inlineSearch) && (
        <div className="jji-cg-rail jji-cg-rail--right">
          <div className="jji-cg-search">
            {inlineSearch && searchOpen && (
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') { setQuery(''); setSearchOpen(false) } }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
              />
            )}
            <button
              type="button"
              className="jji-cg-search-btn"
              aria-label={inlineSearch && searchOpen ? '검색 닫기' : '검색'}
              onClick={() => {
                if (onSearchClick) return onSearchClick()
                if (searchOpen) setQuery('')
                setSearchOpen(o => !o)
              }}
            >
              <SearchIcon />
            </button>
          </div>
        </div>
      )}

      <div className="jji-cg-spacer" />

      {filtered.length === 0 ? (
        <div className="jji-cg-empty">{emptyText}</div>
      ) : (
        <div key={gridKey} ref={gridRef} className="jji-cg-grid">
          {filtered.map((item, i) => (
            <div key={getKey(item)} className={`jji-cg-cell jji-cg-delay-${(i % 3) + 1}`}>
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   GridTile — 썸네일 + 하단 그라데이션 정보 (기존 ne Work 목록 타일)
────────────────────────────────────────────────────────────── */

export type TileMeta = [label: string, value: ReactNode]

export interface GridTileProps {
  href?: string
  thumbnail?: string
  alt?: string
  /** 왼쪽 정보 (예: TITLE, YEAR) */
  metaLeft?: TileMeta[]
  /** 오른쪽 정보 (예: CATEGORY, CLIENT) */
  metaRight?: TileMeta[]
  /** 가운데 배지 (예: 'TBU') — 지정 시 클릭 불가 */
  badge?: string
}

function MetaCol({ rows, align }: { rows?: TileMeta[]; align: 'left' | 'right' }) {
  if (!rows?.length) return <div />
  return (
    <div className={`jji-tile-meta-col is-${align}`}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <span className="jji-tile-label">{label} : </span>
          <span className="jji-tile-value">{value ?? '-'}</span>
        </div>
      ))}
    </div>
  )
}

export function GridTile({ href, thumbnail, alt = '', metaLeft, metaRight, badge }: GridTileProps) {
  const inner = (
    <>
      <div className="jji-tile-inner">
        {thumbnail && <img src={thumbnail} alt={alt} />}
      </div>
      {badge && <div className="jji-tile-badge"><span>{badge}</span></div>}
      <div className="jji-tile-overlay">
        <MetaCol rows={metaLeft} align="left" />
        <MetaCol rows={metaRight} align="right" />
      </div>
    </>
  )

  if (badge || !href) {
    return <div className={`jji-tile${badge ? ' is-disabled' : ''}`}>{inner}</div>
  }
  return <Link href={href} className="jji-tile">{inner}</Link>
}
