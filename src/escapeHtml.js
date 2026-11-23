// Trailhead values are untrusted. Every attribute we generate uses double
// quotes, so these four characters are enough for text and attributes.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

module.exports = { escapeHtml }
