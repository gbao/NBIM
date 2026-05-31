## 2024-05-23 - Single-pass String Replacement
**Learning:** Benchmarking revealed that chained `.replace()` calls for template generation were ~2x slower than a single-pass regex replacement strategy.
**Action:** When performing multiple replacements on the same string, prefer a single `replace` call with a callback function that looks up values in a map.
