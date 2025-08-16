# NBIM Offshore Wind Investment & Cashflow Tracker

*A focused, public dataset and live dashboard tracking Norges Bank Investment Management (NBIM) participation in offshore wind — combining deal‑level investments with reported cash flows.*

> **Mission:** Provide a transparent, well‑sourced view of **NBIM’s offshore wind equity investments** and **NBIM‑reported cash flows** related to unlisted renewable energy infrastructure, enabling practitioners and researchers to analyze how long‑horizon, risk‑averse capital supports project bankability and economics.

---

## Why NBIM, why now

NBIM is a long‑horizon, risk‑aware investor. Its participation is often associated with stronger governance, clearer risk allocation, and improved bankability for offshore wind projects, which can support more competitive financing terms and lift up industry's confidence. This repository assembles verifiable, NBIM‑only data on **investments** and **reported cash flows** so others can track these effects transparently.

---

## What’s in this repository (NBIM‑only) (Work in progress)

```
/data
  ├── nbim_investments.csv        # Row‑per‑investment event (NBIM only)
  ├── nbim_cashflows.csv          # Periodic cash flows from NBIM reports (NBIM only)
  └── projects.csv                # One row per offshore wind project/SPV (optional)
/schema
  ├── nbim_investments.schema.json
  ├── nbim_cashflows.schema.json
  └── projects.schema.json
/dashboard                        # Live, local dashboard (optional)
  └── app.py                      # Streamlit app reading the CSVs
/docs
  └── methodology.md              # Methods, mappings, worked examples
```

> **Getting started quickly?** You only need `/data/nbim_investments.csv` and `/data/nbim_cashflows.csv` to power the dashboard.

---

## Scope & definitions (NBIM‑only)

**In scope**

- NBIM’s **direct equity** stakes in offshore wind project SPVs (any stage: pre‑FID, construction, operational).
- NBIM’s **farm‑downs / acquisitions / JVs** where offshore wind assets are explicitly identified.
- **Platform/company‑level** deals where offshore wind exposure is material and disclosed.
- **NBIM‑reported cash flows** for unlisted renewable energy infrastructure (receipts/payments), captured at **NBIM’s share**.


---

```

---

## Contributing (NBIM‑only data)

1. **Add rows** to `data/nbim_investments.csv` and/or `data/nbim_cashflows.csv` following the schemas.
2. **Cite sources** (NBIM official where possible) in `source_primary`; add partner or media links in `source_secondary`.
3. **Explain assumptions** in `notes`, especially for FX and category mappings.
4. **Open a pull request** with the checklist:

```markdown
### Contribution checklist
- [ ] Row validates against schema
- [ ] Primary NBIM source included
- [ ] FX and units confirmed (EUR m)
- [ ] Notes explain mappings/assumptions
```

> If you spot an error or ambiguity, please open an **Issue** linking the specific rows and sources.

---

## Roadmap

- ✅ Narrow scope to **NBIM only** (this repo)
- Add historical backfill (2021→present) of NBIM unlisted renewables cash‑flow tables
- Add deal‑to‑cash mapping notes for each material transaction
- Publish JSON Schema validations + GitHub Action pre‑commit checks
- Enhance dashboard with EV/MW bands and period filters
- (Later) Consider expanding beyond NBIM once data quality is solid

---

## License

- **Data:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — credit the repository when you use the dataset.
- **Code & schemas:** [MIT License](./LICENSE) — permissive use with attribution.

---

## Disclaimer

This repository is for **research and industry transparency**. It does **not** constitute investment advice. While we aim for accuracy and clear sourcing, errors or omissions may occur. Trademarked names remain the property of their respective owners.

---

## How to cite

> *NBIM Offshore Wind Investment & Cashflow Tracker (Year).* Public dataset and documentation. Include the commit hash or release tag you used.

