export interface Franchise {
  id: number
  name: string
  slug: string
  description: string
  cover_image: string
  logo: string
  title_count: number
  avg_rating: number
  titles?: Title[]
  timelines?: Timeline[]
}

export interface Title {
  id: number
  franchise_id: number
  franchise_name: string
  franchise_slug: string
  title: string
  slug: string
  media_type: MediaType
  release_date: string
  end_date: string
  studio: string
  author: string
  artist: string
  publisher: string
  episode_count: number | null
  chapter_count: number | null
  volume_count: number | null
  runtime_minutes: number | null
  season_number: number | null
  chronological_order: number | null
  release_order: number | null
  synopsis: string
  cover_image: string
  banner_image: string
  trailer_url: string
  avg_rating: number
  popularity_score: number
  language: string
  is_completed: boolean
  tags?: string
  connections?: {
    outgoing: Connection[]
    incoming: Connection[]
  }
}

export type MediaType =
  | 'anime'
  | 'manga'
  | 'movie'
  | 'ova'
  | 'ona'
  | 'special'
  | 'manhwa'
  | 'novel'
  | 'spin_off'
  | 'comic'
  | 'game'
  | 'series'

export interface Connection {
  id: number
  source_title_id: number
  target_title_id: number
  connection_type: string
  description: string
  weight: number
  target_title?: string
  target_slug?: string
  target_media_type?: string
  target_cover?: string
  source_title?: string
  source_slug?: string
  source_media_type?: string
  source_cover?: string
}

export interface Timeline {
  id: number
  franchise_id: number
  name: string
  slug: string
  description: string
  is_primary: boolean
}

export interface Review {
  id: number
  user_id: number
  title_id: number
  username: string
  avatar: string
  rating: number
  content: string
  spoiler: boolean
  likes: number
  created_at: string
}

export interface SearchResult {
  id: number
  title: string
  slug: string
  media_type: MediaType | null
  release_date: string | null
  cover_image: string | null
  avg_rating: number | null
  franchise_name: string | null
  franchise_slug: string | null
  result_type: 'title' | 'franchise'
}
