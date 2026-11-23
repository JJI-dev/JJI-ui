import { createElement, useEffect, useRef, type ReactNode, type HTMLAttributes } from 'react'

/* ──────────────────────────────────────────────────────────────
   RevealScope — 스크롤 등장 애니메이션 (Work/Project 상세 공통)
   사용처: ne Work 상세 / mo Work 상세 / career Project 상세
   레이아웃은 각 사이트가 자유롭게, 움직임만 공통.

   - 범위 안의 제목·문단·이미지 등을 자동으로 찾아 화면에 들어올 때 천천히 등장
     · 글: 아래에서 천천히 올라오며 나타남
     · 이미지: 아래에서 위로 가림막이 걷히며 살짝 확대돼 있던 이미지가 제자리로
   - 동시에 보이는 요소는 순서대로 시간차(stagger)
   - 직접 지정: data-reveal (글) / data-reveal="image" (이미지·이미지 박스) / data-reveal="none" (제외)
   - 기존 .reveal 클래스도 대상으로 인식 (career MDX 호환)
   - 이미 대상인 요소의 안쪽 요소는 중복으로 움직이지 않음
────────────────────────────────────────────────────────────── */

const DEFAULT_SELECTOR = [
  'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'blockquote', 'pre', 'table',
  'img', 'video', 'picture', 'figure',
  '.reveal', '[data-reveal]',
].join(', ')

const IMAGE_TAGS = new Set(['IMG', 'VIDEO', 'PICTURE', 'FIGURE'])

export interface RevealScopeProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  /** 렌더링 태그 (기본 div) */
  as?: 'div' | 'section' | 'article' | 'main'
  /** 자동 대상 선택자 교체 */
  selector?: string
  /** 기본 선택자에 추가 (예: '.p, .card') */
  extraSelector?: string
  /** 시간차 간격 초 (기본 0.12) */
  stagger?: number
}

export function RevealScope({
  children,
  as = 'div',
  selector = DEFAULT_SELECTOR,
  extraSelector,
  stagger = 0.12,
  ...rest
}: RevealScopeProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const sel = extraSelector ? `${selector}, ${extraSelector}` : selector

    const prepare = () => {
      const candidates = Array.from(root.querySelectorAll<HTMLElement>(sel))
        .filter(el => el.dataset.reveal !== 'none' && !el.classList.contains('jji-rv'))
      const set = new Set(candidates)
      // 이미 대상인 조상 안에 있으면 제외 (중복 애니메이션 방지)
      const targets = candidates.filter(el => {
        for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
          if (set.has(p) || p.classList.contains('jji-rv')) return false
        }
        return true
      })
      targets.forEach(el => {
        const isImage = el.dataset.reveal === 'image' || IMAGE_TAGS.has(el.tagName)
        el.classList.add('jji-rv', isImage ? 'jji-rv--image' : 'jji-rv--up')
      })
      return targets
    }

    const io = new IntersectionObserver(
      entries => {
        let order = 0
        entries.forEach(entry => {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) {
            el.style.transitionDelay = `${Math.min(order++ * stagger, 0.6)}s`
            el.classList.add('is-in')
            io.unobserve(el)
          } else if (entry.boundingClientRect.bottom < 0) {
            el.classList.add('is-in') // 이미 지나간 요소 (새로고침 시 스크롤 복원)
            io.unobserve(el)
          }
        })
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    )

    prepare().forEach(el => io.observe(el))

    // MDX 등 늦게 들어오는 내용도 처리
    let raf = 0
    const mo = new MutationObserver(() => {
      if (raf) return
      raf = requestAnimationFrame(() => { raf = 0; prepare().forEach(el => io.observe(el)) })
    })
    mo.observe(root, { childList: true, subtree: true })

    return () => { io.disconnect(); mo.disconnect(); cancelAnimationFrame(raf) }
  }, [selector, extraSelector, stagger])

  return createElement(as, { ref, ...rest }, children)
}
