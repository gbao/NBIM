## 2025-01-26 - [Template Replacement Optimization]
**Learning:** Chained `.replace()` calls on a large HTML template were causing unnecessary traversals. Replacing 25+ passes with a single-pass regex replacement using a lookup map improved template generation speed by ~2.6x (1.04ms -> 0.40ms).
**Action:** When performing multiple string replacements on the same target, prefer a single-pass regex with a callback function (e.g., `.replace(/{{([A-Z_]+)}}/g, (match, key) => map[key])`) over sequential `.replace()` calls.
