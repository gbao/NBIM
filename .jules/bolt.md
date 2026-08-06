## 2024-05-22 - Template Interpolation Optimization
**Learning:** Replaces chained `.replace()` calls with a single-pass regex strategy (`template.replace(/{{[A-Z_]+}}/g, mapLookup)`) improved performance by ~5x (from ~4.7s to ~0.9s for 1000 iterations).
**Learning:** Using a callback function for replacement `string.replace(regex, () => value)` prevents potential bugs where the replacement value contains special replacement patterns (like `$&` or `$1`), which would be interpreted if passed as a string directly.
**Action:** Always prefer callback-based replacement when substituting data into templates, especially when the data might contain user input or generated JSON (e.g. `JSON.stringify` output).
