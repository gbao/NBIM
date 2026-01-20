## 2024-01-20 - Excel Conversion Optimization
**Learning:** Parallelizing file I/O using `Promise.all` combined with `fs.readFile` (async) and `XLSX.read` (sync parsing) is a valid pattern to uncork the event loop, even if the parsing itself is CPU-bound.
**Action:** Prefer `fs.readFile` + `XLSX.read(buffer)` over `XLSX.readFile` (blocking) in server or script environments to allow for I/O concurrency.
