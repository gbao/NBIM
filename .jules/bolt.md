## 2026-01-29 - Regex Performance in Node.js
**Learning:** Chained `.replace()` calls on large strings (like HTML templates) are significantly slower (O(N*M)) than a single-pass regex replacement (O(N)). In this case, switching to a single regex improved performance by ~11x (7.2s -> 0.6s).
**Action:** Use single-pass regex with a callback for template interpolation when multiple replacements are needed.
