# Bolt's Journal

## 2024-05-23 - Template Replacement Optimization
**Learning:** Replacing chained `.replace()` calls with a single-pass regex strategy is significantly faster (approx 5x) for template processing in this codebase.
**Action:** Use single-pass regex replacement for template interpolation when multiple replacements are needed.
