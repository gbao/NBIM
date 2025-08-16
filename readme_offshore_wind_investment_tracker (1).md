# NBIM Offshore Wind Investment & Cashflow Tracker

*A focused, public dataset and live dashboard tracking Norges Bank Investment Management (NBIM) participation in offshore wind — combining deal‑level investments with reported cash flows.*

> **Mission:** Provide a transparent, well‑sourced view of **NBIM’s offshore wind equity investments** and **NBIM‑reported cash flows** related to unlisted renewable energy infrastructure, enabling practitioners and researchers to analyze how long‑horizon, risk‑averse capital supports project bankability and economics.

---

## Why NBIM, why now

NBIM is a long‑horizon, risk‑aware investor. Its participation is often associated with stronger governance, clearer risk allocation, and improved bankability for offshore wind projects, which can support more competitive financing terms. This repository assembles verifiable, NBIM‑only data on **investments** and **reported cash flows** so others can analyze these effects transparently.

---

## What’s in this repository (NBIM‑only)

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

**Out of scope (for now)**

- Pure debt financings without an NBIM equity position.
- Corporate M&A without asset‑level offshore wind disclosure.
- Non‑offshore renewables (onshore wind, solar) unless used for context in cash‑flow tables.

**Stage taxonomy:** `pre‑FID` · `FID` · `under construction` · `operational` · `repowering`.

**Technology:** `fixed‑bottom` · `floating` (optional subtypes: semi‑sub, spar, TLP).

**Geography:** Country + sea basin (e.g., North Sea, Baltic, U.S. Atlantic, APAC).

---

## Data model — `nbim_investments.csv`

Each row is a **single NBIM investment event**.

| Field                    | Type              | Description                                             |
| ------------------------ | ----------------- | ------------------------------------------------------- |
| `investment_id`\*        | string            | Stable unique ID (e.g., `NBIM-2025-0001`)               |
| `announcement_date`\*    | date (YYYY‑MM‑DD) | Public announcement date                                |
| `financial_close_date`   | date              | Signing/close date, if different                        |
| `investor_name`\*        | string            | Always `Norges Bank Investment Management (NBIM)`       |
| `nbim_vehicle`           | string            | e.g., `GPFG – Unlisted Renewable Energy Infrastructure` |
| `ownership_path`         | enum              | `direct` or `indirect` (via JV/fund/platform)           |
| `project_name`\*         | string            | Official SPV/project name                               |
| `project_spv`            | string            | Legal entity name, if known                             |
| `developer_seller`       | string            | Counterparty developer/seller                           |
| `country`\*              | string            | Project country                                         |
| `sea_basin`              | string            | e.g., North Sea, Baltic                                 |
| `stage`\*                | enum              | pre‑FID/FID/under construction/operational/repowering   |
| `technology`\*           | enum              | fixed‑bottom/floating                                   |
| `capacity_mw`            | number            | Project capacity at 100% (MW)                           |
| `stake_percent`          | number            | % equity acquired/committed by NBIM                     |
| `transaction_type`       | enum              | farm‑down, acquisition, JV, greenfield, platform        |
| `enterprise_value_eur_m` | number            | EV at 100% (EUR m), if disclosed                        |
| `equity_value_eur_m`     | number            | Equity value at 100% (EUR m), if disclosed              |
| `implied_ev_per_mw_keur` | number            | Computed `(EV*1,000)/capacity_mw`                       |
| `currency_original`      | string            | e.g., GBP, DKK                                          |
| `fx_rate_to_eur`         | number            | FX used to convert to EUR                               |
| `valuation_basis`        | string            | press release, report, filing                           |
| `subsidy_scheme`         | string            | CfD/PPA/feed‑in; include round/strike if known          |
| `offtaker`               | string            | Buyer of power/certificates, if known                   |
| `cod_year`               | integer           | Expected/actual COD year                                |
| `financing_structure`    | string            | e.g., project finance/no external debt                  |
| `lenders`                | string            | If publicly disclosed                                   |
| `co_investors`           | string            | Other equity participants                               |
| `notes`                  | text              | Context, assumptions, rounding notes                    |
| `source_primary`\*       | url               | Primary source (NBIM or partner official)               |
| `source_secondary`       | url               | Secondary/press coverage                                |
| `source_reliability`     | enum              | A (official), B (trade), C (media)                      |
| `verified`               | boolean           | `true` if cross‑checked                                 |
| `last_updated`           | datetime          | ISO 8601 timestamp                                      |

**Example (CSV)**

```csv
investment_id,announcement_date,financial_close_date,investor_name,nbim_vehicle,ownership_path,project_name,project_spv,developer_seller,country,sea_basin,stage,technology,capacity_mw,stake_percent,transaction_type,enterprise_value_eur_m,equity_value_eur_m,implied_ev_per_mw_keur,currency_original,fx_rate_to_eur,valuation_basis,subsidy_scheme,offtaker,cod_year,financing_structure,lenders,co_investors,notes,source_primary,source_secondary,source_reliability,verified,last_updated
NBIM-2025-0001,2025-06-30,2025-07-15,"Norges Bank Investment Management (NBIM)","GPFG – Unlisted Renewable Energy Infrastructure",direct,Example Offshore Wind SPV,Example Wind B.V.,Ørsted,Netherlands,North Sea,operational,fixed-bottom,752,16.6,farm-down,2600,,345.7,EUR,1.0,press release,CfD Round X,,2020,project finance,,,Illustrative row only.,https://example.com/press,https://example.com/news,A,false,2025-08-16T06:00:00Z
```

---

## Data model — `nbim_cashflows.csv`

Periodic cash flows **as reported by NBIM** for unlisted renewable energy infrastructure. Values are NBIM‑share and may include assets beyond offshore wind; use `asset_scope` and `notes` to clarify when a figure is strictly offshore or broader.

| Field               | Type     | Description                                                                                                                                                                                                                                            |
| ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `record_id`\*       | string   | Stable ID (e.g., `CF-2025H1-0001`)                                                                                                                                                                                                                     |
| `period_start`\*    | date     | Period start (YYYY‑MM‑DD)                                                                                                                                                                                                                              |
| `period_end`\*      | date     | Period end (YYYY‑MM‑DD)                                                                                                                                                                                                                                |
| `period_label`\*    | string   | e.g., `1H 2025`, `2024`, `Q3 2023`                                                                                                                                                                                                                     |
| `cashflow_type`\*   | enum     | `receipts_interest`, `receipts_dividends`, `receipts_ongoing_operations`, `receipts_asset_sales`, `payments_interest`, `payments_operating_expenses`, `payments_new_investments_and_development`, `cashflow_to_from_other_activities`, `net_cash_flow` |
| `amount_eur_m`\*    | number   | Amount in EUR millions (NBIM share)                                                                                                                                                                                                                    |
| `currency_original` | string   | Original currency (if disclosed)                                                                                                                                                                                                                       |
| `fx_rate_to_eur`    | number   | FX used to convert                                                                                                                                                                                                                                     |
| `asset_scope`       | enum     | `offshore_wind_only`, `mixed_portfolio`, `unknown`                                                                                                                                                                                                     |
| `source_primary`\*  | url      | NBIM report/table reference                                                                                                                                                                                                                            |
| `source_secondary`  | url      | Trade press/partner materials                                                                                                                                                                                                                          |
| `notes`             | text     | Explain mappings/assumptions                                                                                                                                                                                                                           |
| `last_updated`      | datetime | ISO 8601 timestamp                                                                                                                                                                                                                                     |

**Notes on category mapping**

- `payments_new_investments_and_development`: capital deployed to new assets or development.
- `receipts_asset_sales`: proceeds from sell‑downs/partial disposals.
- `cashflow_to_from_other_activities`: other net cash movements not classified above (e.g., tax/fees/withholding, working capital), as described in NBIM tables.
- `net_cash_flow` should equal the algebraic sum of component lines **for the same period**.

**Example (CSV)**

```csv
record_id,period_start,period_end,period_label,cashflow_type,amount_eur_m,currency_original,fx_rate_to_eur,asset_scope,source_primary,notes,last_updated
CF-2025H1-0001,2025-01-01,2025-06-30,1H 2025,payments_new_investments_and_development,430,,,mixed_portfolio,https://example.com/nbim-report,"Illustrative row only.",2025-08-16T06:00:00Z
```

---

## Methodology

1. **Currency & units**: Report all amounts in **EUR millions**. Use spot FX on the **announcement date** for deals and on the **reporting date** (or average) for cash flows; document your choice in `notes`.
2. **Implied EV/MW**: When EV and capacity are known, compute `implied_ev_per_mw_keur = (EV_eur_m*1,000)/capacity_mw`.
3. **Linking deals to cash flows**: Investment EV values **do not equal** NBIM cash flows; cash flows reflect **NBIM’s paid/received cash**, not 100% enterprise values. Use `notes` to tie specific capital deployments to related investment rows when possible.
4. **Verification**: Each row requires **one primary source** (NBIM release/report or partner filing). Mark `verified=true` once cross‑checked.
5. **Scope tags**: Use `asset_scope` to distinguish offshore‑only figures from broader NBIM cash‑flow disclosures.

A deeper walkthrough with worked examples lives in `/docs/methodology.md`.

---

## Live dashboard

A minimal Streamlit app (optional) can visualize:

- **Cumulative capital deployed** vs. **receipts** over time
- **Deal list** with filters (stage, technology, basin)
- **EV/MW benchmarks** for NBIM investments

**Run locally**

```bash
pip install streamlit pandas
streamlit run dashboard/app.py
```

The app expects `data/nbim_investments.csv` and `data/nbim_cashflows.csv`.

---

## Quickstart (Python)

```python
import pandas as pd
inv = pd.read_csv("data/nbim_investments.csv")
cf  = pd.read_csv("data/nbim_cashflows.csv")

# Example 1: EV/MW by stage
bench = (inv.dropna(subset=["implied_ev_per_mw_keur"]) 
           .groupby("stage")["implied_ev_per_mw_keur"].mean().round(1))
print(bench)

# Example 2: Cumulative NBIM net cash flow by period
cf_order = cf[cf["cashflow_type"]=="net_cash_flow"].copy()
cf_order["cum_eur_m"] = cf_order.sort_values("period_start")["amount_eur_m"].cumsum()
print(cf_order[["period_label","cum_eur_m"]])
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

