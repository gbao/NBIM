## 2025-05-22 - Single-Pass Regex Replacement
**Learning:** Chained `.replace()` calls on a large template string scan the string multiple times (O(N*M)). Using a single `.replace()` with a global regex and a callback map reduces this to a single pass (O(N)).
**Action:** Use `template.replace(/{{([A-Z0-9_]+)}}/g, (match, key) => replacements[key] || match)` for template interpolation.
