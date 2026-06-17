# Bolt's Journal

## 2026-01-05 - Efficient Template Replacement
**Learning:** Chained `.replace()` calls on a large string are inefficient as they traverse the string multiple times.
**Action:** Use a single-pass replacement with a regex (e.g., `/{{(.*?)}}/g`) and a lookup map/callback to improve performance and readability.
