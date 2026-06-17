## 2025-01-14 - String Replacement Optimization
**Learning:** Chaining multiple `.replace()` calls on a large string (like an HTML template) creates intermediate string copies for each call, which is memory and CPU intensive.
**Action:** Use a single-pass regex replacement with a callback function (e.g., `.replace(/{{([A-Z0-9_]+)}}/g, (match, key) => map[key])`) to significantly improve performance (observed ~4.5x speedup).
