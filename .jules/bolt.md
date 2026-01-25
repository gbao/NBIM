## 2026-01-25 - Chained String Replacement Performance
**Learning:** Chained `.replace()` calls on large strings (like HTML templates) are significantly slower (O(N*M)) than a single-pass regex replacement (O(N)). Also, standard string replacement handles `$` characters in the replacement string specially (e.g. `$&`), which can cause bugs when injecting data like JSON or currency.
**Action:** Use `.replace(/regex/g, callback)` for multiple replacements to ensure O(N) performance and safety against special characters.
