## 2024-05-23 - Template Generation Performance
**Learning:** Chained `.replace()` calls on large strings (like HTML templates) are significantly slower than a single-pass regex replacement with a lookup map.
**Action:** When performing multiple string replacements, especially on large content, use `str.replace(/pattern/g, (match) => map[match])` instead of chaining multiple `.replace()` calls. This avoids rescanning the string for each replacement.
