## 2025-01-13 - Parallel Excel Processing
**Learning:** Even with small datasets (files < 1MB), processing multiple Excel files sequentially is measurably slower (up to 2x variation) than processing them in parallel. `xlsx.readFile` is synchronous and blocks the event loop. Switching to `fs.readFile` (async) + `xlsx.read` allows for better I/O concurrency when combined with `Promise.all`.
**Action:** Always check for independent file operations in scripts and parallelize them using `Promise.all` and async I/O methods.
