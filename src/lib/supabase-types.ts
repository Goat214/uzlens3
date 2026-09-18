/**
 * Row shapes matching supabase/schema.sql. Kept as plain interfaces (rather
 * than a generated Database type) to keep the stage 3 integration simple —
 * these can be swapped for `supabase gen types typescript` output later
 * without changing any call sites.
 */

export interface ProfileRow {
  id: string
  email: string
  created_at: string
}

export interface AnalysisRow {
  id: string
  user_id: string
  original_text: string
  normalized_text: string | null
  language: string | null
  script: string | null
  word_count: number
  sentence_count: number
  created_at: string
}

export interface OcrDocumentRow {
  id: string
  user_id: string
  filename: string | null
  original_text: string | null
  cleaned_text: string | null
  confidence: number | null
  created_at: string
}

export interface WordSearchHistoryRow {
  id: string
  user_id: string
  word: string
  created_at: string
}
