/**
 * Uzbek Cyrillic → Latin converter. Mirrors latinToCyrillic.ts using the
 * same correspondence table, reversed. Each Cyrillic letter maps to exactly
 * one Latin form so the conversion is deterministic in this direction.
 */

type Rule = [cyrillic: string, latin: string]

const RULES: Rule[] = [
  ['ш', 'sh'], ['ч', 'ch'],
  ['ё', 'yo'], ['ю', 'yu'], ['я', 'ya'],
  ['ц', 'ts'],
  ['ў', "o‘"], ['ғ', "g‘"],
  ['а', 'a'], ['б', 'b'], ['д', 'd'], ['е', 'e'], ['ф', 'f'],
  ['г', 'g'], ['ҳ', 'h'], ['и', 'i'], ['ж', 'j'], ['к', 'k'],
  ['л', 'l'], ['м', 'm'], ['н', 'n'], ['о', 'o'], ['п', 'p'],
  ['қ', 'q'], ['р', 'r'], ['с', 's'], ['т', 't'], ['у', 'u'],
  ['в', 'v'], ['х', 'x'], ['й', 'y'], ['з', 'z'],
  ['ъ', "'"], ['ь', ''],
]

const SORTED_RULES = [...RULES].sort((a, b) => b[0].length - a[0].length)

function matchCase(source: string, target: string): string {
  if (!target) return target
  if (source === source.toUpperCase() && source !== source.toLowerCase()) {
    return target.toUpperCase()
  }
  if (source[0] === source[0].toUpperCase() && source[0] !== source[0].toLowerCase()) {
    return target[0].toUpperCase() + target.slice(1)
  }
  return target
}

export function cyrillicToLatin(text: string): string {
  if (!text) return ''
  let result = ''
  let i = 0
  const lower = text.toLowerCase()

  outer: while (i < text.length) {
    for (const [cyrillic, latin] of SORTED_RULES) {
      const len = cyrillic.length
      if (lower.slice(i, i + len) === cyrillic) {
        const original = text.slice(i, i + len)
        result += matchCase(original, latin)
        i += len
        continue outer
      }
    }
    result += text[i]
    i += 1
  }

  return result
}
