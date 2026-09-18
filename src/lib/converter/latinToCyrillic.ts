/**
 * Uzbek Latin → Cyrillic converter.
 *
 * Based on the standard Uzbek Latin/Cyrillic correspondence table. Uses
 * ordered, longest-match-first rules so digraphs (sh, ch, ng, o‘, g‘, yo,
 * yu, ya, ye) are handled before single letters, and preserves the case
 * pattern of the original text.
 */

type Rule = [latin: string, cyrillic: string]

// Ordered longest-match-first: multi-letter combinations before single
// letters, so "sh" is matched before a lone "s" or "h".
const RULES: Rule[] = [
  // Uzbek-specific apostrophe letters (several apostrophe variants accepted).
  ["o‘", 'ў'], ["o’", 'ў'], ["o'", 'ў'], ['oʻ', 'ў'],
  ["g‘", 'ғ'], ["g’", 'ғ'], ["g'", 'ғ'], ['gʻ', 'ғ'],
  // Digraphs.
  ['sh', 'ш'],
  ['ch', 'ч'],
  ['yo', 'ё'],
  ['yu', 'ю'],
  ['ya', 'я'],
  ['ye', 'е'],
  ["ts", 'ц'],
  // Single letters.
  ['a', 'а'], ['b', 'б'], ['d', 'д'], ['e', 'е'], ['f', 'ф'],
  ['g', 'г'], ['h', 'ҳ'], ['i', 'и'], ['j', 'ж'], ['k', 'к'],
  ['l', 'л'], ['m', 'м'], ['n', 'н'], ['o', 'о'], ['p', 'п'],
  ['q', 'қ'], ['r', 'р'], ['s', 'с'], ['t', 'т'], ['u', 'у'],
  ['v', 'в'], ['x', 'х'], ['y', 'й'], ['z', 'з'],
]

// Sort longest-first so multi-char patterns are tried before single chars.
const SORTED_RULES = [...RULES].sort((a, b) => b[0].length - a[0].length)

function matchCase(source: string, target: string): string {
  if (source === source.toUpperCase() && source !== source.toLowerCase()) {
    return target.toUpperCase()
  }
  if (source[0] === source[0].toUpperCase() && source[0] !== source[0].toLowerCase()) {
    return target[0].toUpperCase() + target.slice(1)
  }
  return target
}

export function latinToCyrillic(text: string): string {
  if (!text) return ''
  let result = ''
  let i = 0
  const lower = text.toLowerCase()

  outer: while (i < text.length) {
    for (const [latin, cyrillic] of SORTED_RULES) {
      const len = latin.length
      if (lower.slice(i, i + len) === latin) {
        const original = text.slice(i, i + len)
        result += matchCase(original, cyrillic)
        i += len
        continue outer
      }
    }
    // No rule matched (punctuation, digits, whitespace) — keep as-is.
    result += text[i]
    i += 1
  }

  return result
}
