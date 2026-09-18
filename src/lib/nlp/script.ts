/**
 * Script detection for Uzbek text: distinguishes Latin, Cyrillic, mixed,
 * and unknown/undetectable input.
 */

export type ScriptType = 'latin' | 'cyrillic' | 'mixed' | 'unknown'

// Uzbek-specific Latin letters (beyond the base Latin alphabet).
const UZBEK_LATIN_SPECIAL = /[o\u02BBg\u02BB]|['`\u2018\u2019][og]/i

// Cyrillic ranges, including Uzbek-specific Cyrillic letters ў, қ, ғ, ҳ.
const CYRILLIC_CHAR = /[\u0400-\u04FF]/
const LATIN_CHAR = /[A-Za-z]/

export interface ScriptDetectionResult {
  script: ScriptType
  latinRatio: number
  cyrillicRatio: number
}

/**
 * Detects the dominant script of a piece of text by counting Latin vs
 * Cyrillic letters and comparing their proportions.
 */
export function detectScriptDetailed(text: string): ScriptDetectionResult {
  const letters = text.match(/\p{L}/gu) ?? []
  if (letters.length === 0) {
    return { script: 'unknown', latinRatio: 0, cyrillicRatio: 0 }
  }

  let latinCount = 0
  let cyrillicCount = 0

  for (const ch of letters) {
    if (CYRILLIC_CHAR.test(ch)) cyrillicCount++
    else if (LATIN_CHAR.test(ch)) latinCount++
  }

  const total = letters.length
  const latinRatio = latinCount / total
  const cyrillicRatio = cyrillicCount / total

  let script: ScriptType
  if (latinCount === 0 && cyrillicCount === 0) {
    script = 'unknown'
  } else if (latinRatio > 0.9) {
    script = 'latin'
  } else if (cyrillicRatio > 0.9) {
    script = 'cyrillic'
  } else if (latinCount > 0 && cyrillicCount > 0) {
    script = 'mixed'
  } else {
    script = 'unknown'
  }

  return { script, latinRatio, cyrillicRatio }
}

/** Convenience wrapper returning only the detected script type. */
export function detectScript(text: string): ScriptType {
  return detectScriptDetailed(text).script
}

/** Returns true if the text contains Uzbek-specific Latin apostrophe letters (o‘, g‘). */
export function hasUzbekLatinMarkers(text: string): boolean {
  return UZBEK_LATIN_SPECIAL.test(text)
}

/** Returns true if the text contains Uzbek-specific Cyrillic letters (ў, қ, ғ, ҳ). */
export function hasUzbekCyrillicMarkers(text: string): boolean {
  return /[ўқғҳЎҚҒҲ]/.test(text)
}

/**
 * Best-effort language label for display purposes. This project only
 * targets Uzbek text, so this reports whether the script looks like
 * recognizable Uzbek writing rather than performing general language ID.
 */
export function detectLanguageLabel(text: string): string {
  const { script } = detectScriptDetailed(text)
  if (script === 'latin' || script === 'cyrillic' || script === 'mixed') {
    return "O‘zbek tili"
  }
  return 'Aniqlanmadi'
}
