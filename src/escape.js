// Trailhead values are untrusted. Every attribute we generate uses double
// quotes, so these four characters are enough for text and attributes.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Markdown allows raw HTML, links and images, and a value must stay on its
// line. The entities render as the original characters.
function escapeMarkdown(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\[/g, '&#91;')
    .replace(/\]/g, '&#93;')
    .replace(/\s*[\r\n]+\s*/g, ' ')
}

module.exports = { escapeHtml, escapeMarkdown }
