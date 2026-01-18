## 2025-05-20 - Optimized String Replacement in Dashboard Generation
**Learning:** Chained `.replace()` calls for template interpolation are significantly slower than a single-pass regex replacement with a lookup map in Node.js.
**Action:** When performing multiple string replacements on a large template, prefer `template.replace(/{{(KEY)}}/g, (match, key) => map[key])` over `template.replace(...).replace(...)`. In this case, it yielded a ~3.9x performance improvement (8.5s -> 2.2s for 10k iterations).
