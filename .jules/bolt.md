## 2024-05-23 - Micro-optimizations on Small Datasets
**Learning:** Benchmarking async I/O improvements on very small datasets (files < 100KB) yields high variance results where the overhead of `Promise.all` and async context switching can mask the parallelization benefits.
**Action:** Trust the architectural pattern (parallel I/O is better than serial blocking I/O) for scalability, even if micro-benchmarks on toy data are inconclusive. Verify correctness and move forward.
