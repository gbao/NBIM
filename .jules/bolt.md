## 2026-02-02 - Template Replacement Optimization
**Learning:** Chained `.replace()` calls on large strings in Node.js create significant overhead due to repeated string allocation and scanning. Replacing 25 sequential calls with a single-pass regex (`/{{\s*([A-Z_]+)\s*}}/g`) and a lookup map reduced execution time by ~9x (from ~496ms to ~56ms).
**Action:** Use single-pass regex replacement with a callback function for template interpolation instead of chained replacements, especially when the number of replacements is high (>10).
