## 2025-03-09 - Accessible Markdown TOC Button
**Learning:** Found an icon-only button to toggle the table of contents in `src/routes/[...dir]/[file=markdown]/+page.svelte` without an `aria-label` or `title`. Sighted users would not know what it does until they click it, and screen readers would read it as a generic, unhelpful button.
**Action:** Add `aria-label="Toggle table of contents"` and `title="Toggle table of contents"` to improve both screen reader accessibility and visual clarity (with a tooltip).
