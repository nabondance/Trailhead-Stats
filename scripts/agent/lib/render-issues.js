// Finds values that leaked into rendered output as literal text.
const PATTERNS = [
  { label: 'undefined', regex: /\bundefined\b/ },
  { label: 'NaN', regex: /\bNaN(?:px)?\b/ },
  { label: 'null', regex: /(?:>|="|:\s)null(?:<|"|\s|$)/m }
]

function findRenderIssues(label, content) {
  const issues = []
  for (const { label: kind, regex } of PATTERNS) {
    const match = regex.exec(content)
    if (match) {
      const start = Math.max(0, match.index - 40)
      const excerpt = content
        .slice(start, match.index + match[0].length + 20)
        .replace(/\s+/g, ' ')
      issues.push(`${label}: literal ${kind} near "${excerpt}"`)
    }
  }
  return issues
}

module.exports = { findRenderIssues }
