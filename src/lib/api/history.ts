import { supabase } from '../supabase'
import type { AnalysisRow, OcrDocumentRow, WordSearchHistoryRow } from '../supabase-types'

interface MutationResult {
  error: string | null
}

interface ListResult<T> {
  data: T[]
  error: string | null
}

// ------------------------------------------------------------
// analyses
// ------------------------------------------------------------
export async function saveAnalysis(params: {
  userId: string
  originalText: string
  normalizedText?: string | null
  language?: string | null
  script?: string | null
  wordCount: number
  sentenceCount: number
}): Promise<MutationResult> {
  const { error } = await supabase.from('analyses').insert({
    user_id: params.userId,
    original_text: params.originalText,
    normalized_text: params.normalizedText ?? null,
    language: params.language ?? null,
    script: params.script ?? null,
    word_count: params.wordCount,
    sentence_count: params.sentenceCount,
  })
  return { error: error?.message ?? null }
}

export async function fetchAnalyses(userId: string, limit?: number): Promise<ListResult<AnalysisRow>> {
  let query = supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as AnalysisRow[], error: null }
}

export async function deleteAnalysis(id: string): Promise<MutationResult> {
  const { error } = await supabase.from('analyses').delete().eq('id', id)
  return { error: error?.message ?? null }
}

export async function countAnalyses(userId: string): Promise<number> {
  const { count } = await supabase
    .from('analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count ?? 0
}

// ------------------------------------------------------------
// ocr_documents
// ------------------------------------------------------------
export async function saveOcrDocument(params: {
  userId: string
  filename: string
  originalText: string
  cleanedText: string
  confidence: number | null
}): Promise<MutationResult> {
  const { error } = await supabase.from('ocr_documents').insert({
    user_id: params.userId,
    filename: params.filename,
    original_text: params.originalText,
    cleaned_text: params.cleanedText,
    confidence: params.confidence,
  })
  return { error: error?.message ?? null }
}

export async function fetchOcrDocuments(
  userId: string,
  limit?: number,
): Promise<ListResult<OcrDocumentRow>> {
  let query = supabase
    .from('ocr_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as OcrDocumentRow[], error: null }
}

export async function deleteOcrDocument(id: string): Promise<MutationResult> {
  const { error } = await supabase.from('ocr_documents').delete().eq('id', id)
  return { error: error?.message ?? null }
}

export async function countOcrDocuments(userId: string): Promise<number> {
  const { count } = await supabase
    .from('ocr_documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count ?? 0
}

// ------------------------------------------------------------
// word_search_history
// ------------------------------------------------------------
export async function saveWordSearch(userId: string, word: string): Promise<MutationResult> {
  const { error } = await supabase.from('word_search_history').insert({ user_id: userId, word })
  return { error: error?.message ?? null }
}

export async function fetchWordSearchHistory(
  userId: string,
  limit?: number,
): Promise<ListResult<WordSearchHistoryRow>> {
  let query = supabase
    .from('word_search_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as WordSearchHistoryRow[], error: null }
}

export async function deleteWordSearch(id: string): Promise<MutationResult> {
  const { error } = await supabase.from('word_search_history').delete().eq('id', id)
  return { error: error?.message ?? null }
}

export async function countWordSearches(userId: string): Promise<number> {
  const { count } = await supabase
    .from('word_search_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count ?? 0
}
