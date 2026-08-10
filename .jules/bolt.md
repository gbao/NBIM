## 2026-01-17 - Template Replacement Optimization
**Learning:** Chained `.replace()` calls on large strings are O(N*M) where N is string length and M is number of replacements. Replacing with a single-pass regex `/{{([A-Z0-9_]+)}}/g` with a callback map reduces this to O(N).
**Action:** Use single-pass regex replacement for template interpolation when multiple replacements are needed. Verified ~12x speedup (6898ms -> 585ms for 10k iterations).
