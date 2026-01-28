# Bolt's Journal

## 2025-05-21 - Template Replacement Optimization
**Learning:** Chained `.replace()` calls on a large template string are significantly slower (O(N*M)) than a single-pass regex replacement (O(N)).
**Action:** Use a replacement map and a single `replace(/pattern/g, callback)` for string interpolation when multiple placeholders exist.
**Additional Benefit:** Using a callback function prevents unintended replacement of special patterns (like `$&`) which can occur when passing a string as the second argument to `replace()`.
