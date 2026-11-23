/*
  작업 목록 피드 형식 (works.json)
  - ne.jji.kr/works.json, mo.jji.kr/works.json 이 이 형식으로 내보냄
  - jji.kr 포트폴리오가 가져와서 목록 표시 → 클릭 시 url(각 사이트 상세)로 이동
  ※ 타입만 정의 (서버 컴포넌트에서도 import type 으로 사용)
*/
export interface WorkFeedItem {
  id: string
  slug: string
  title: string
  category: string
  year?: string
  client?: string
  summary?: string
  /** 절대 주소 */
  thumbnail?: string
  /** 상세 페이지 절대 주소 */
  url: string
  /** 준비 중(상세 없음) */
  tbu?: boolean
}

export interface WorkFeed {
  /** 'ne' | 'mo' ... */
  site: string
  siteUrl: string
  updatedAt: string
  items: WorkFeedItem[]
}
