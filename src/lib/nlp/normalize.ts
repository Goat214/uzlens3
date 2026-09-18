/**
 * Uzbek text normalization utilities.
 *
 * Uzbek Latin script uses two apostrophe-like characters that are commonly
 * mistyped or substituted with the wrong Unicode codepoint:
 *   - o' / o‘ / oʻ / o`  → should normalize to  o‘  (U+02BB or similar)
 *   - g' / g‘ / gʻ / g`  → should normalize to  g‘
 *
 * This module normalizes those variants to a single canonical form, cleans
 * whitespace, and tidies punctuation spacing — without altering valid words.
 */

// Canonical modifier letter used in standard Uzbek orthography.
const CANONICAL_APOSTROPHE = '\u02BB' // ʻ (MODIFIER LETTER TURNED COMMA)

// All the characters people substitute for the Uzbek apostrophe.
const APOSTROPHE_VARIANTS = [
  '\u2018', // ‘ left single quotation mark
  '\u2019', // ’ right single quotation mark
  '\u02BC', // ʼ modifier letter apostrophe
  '\u0060', // ` grave accent
  '\u00B4', // ´ acute accent
  "'", // ' straight apostrophe
]

function buildApostropheRegex(): RegExp {
  const escaped = APOSTROPHE_VARIANTS.map((c) =>
    c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  ).join('')
  return new RegExp(`[${escaped}]`, 'g')
}

const APOSTROPHE_REGEX = buildApostropheRegex()

/**
 * Normalizes every apostrophe-like character to the canonical Uzbek
 * modifier letter, but only where it matters: directly after "o"/"O" or
 * "g"/"G". A bare apostrophe used for quoting elsewhere in the sentence is
 * left untouched, so valid words and real quotations are not corrupted.
 */
export function normalizeApostrophes(text: string): string {
  return text.replace(
    new RegExp(`([oOgG])${APOSTROPHE_REGEX.source}`, 'g'),
    (_match, letter: string) => `${letter}${CANONICAL_APOSTROPHE}`,
  )
}

/** Collapses runs of whitespace into a single space and trims the ends. */
export function normalizeWhitespace(text: string): string {
  return text.replace(/[ \t\f\v]+/g, ' ').replace(/ *\n */g, '\n').trim()
}

/**
 * Normalizes punctuation spacing: no space before . , ! ? : ; and exactly
 * one space after (unless followed by end of string or another punctuation
 * mark or a closing bracket/quote).
 */
export function normalizePunctuation(text: string): string {
  return text
    .replace(/\s+([.,!?:;])/g, '$1')
    .replace(/([.,!?:;])(?=[^\s.,!?:;"'”’)\]\n]|$)/g, '$1 ')
    .replace(/ {2,}/g, ' ')
}

/**
 * Runs the full Uzbek normalization pipeline: apostrophe canonicalization,
 * punctuation spacing, then whitespace collapsing. Designed to be safe to
 * run on any Uzbek Latin text without destroying valid words.
 */
export function normalizeUzbekText(text: string): string {
  if (!text) return ''
  let result = text
  result = normalizeApostrophes(result)
  result = normalizePunctuation(result)
  result = normalizeWhitespace(result)
  return result
}
