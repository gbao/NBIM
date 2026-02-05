## 2024-05-23 - Template Replacement Performance
**Learning:** Chained `.replace()` calls on large strings for template interpolation are significantly slower (O(N*M)) than a single-pass regex replacement with a callback (O(N)). In this project, switching to single-pass regex improved dashboard generation time by ~2.6x.
**Action:** Use `template.replace(/{{[A-Z_]+}}/g, mapCallback)` for all future template interpolations.
