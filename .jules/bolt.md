## 2026-01-11 - Parallel Excel Conversion
**Learning:** Node.js `Promise.all` is only effective for I/O operations if the underlying I/O is actually non-blocking. Synchronous `XLSX.readFile` blocks the main thread, negating any benefit of `Promise.all`. Switching to `fs.readFile` (async) + `XLSX.read` allows file reading to happen in parallel, even if parsing remains synchronous.
**Action:** Always check if "async" functions are truly async or just wrapping synchronous blocks before parallelizing.
