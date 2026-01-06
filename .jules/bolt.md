## 2024-05-22 - Parallelizing Excel Conversion
**Learning:** Node.js `fs.readFile` (async) combined with `Promise.all` allows for significant I/O overlap even when the subsequent parsing (e.g., `xlsx.read`) is synchronous. This is a simple pattern to speed up multi-file processing scripts without complex worker threads.
**Action:** Always look for sequential file processing that can be parallelized, especially when file reading is a significant portion of the work. Ensure to use the async version of file readers.
