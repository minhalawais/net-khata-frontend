# Financial Intelligence Contract

## Endpoint
- Method: `GET`
- Path: `/dashboard/financial-intelligence`
- Auth: JWT required

## Endpoint Alias
- Backward-compatible alias remains available:
  - `GET /dashboard/financial-intelligence-v2`

## Query Filters (Phase 1 locked)
- `start_date` (YYYY-MM-DD, optional)
- `end_date` (YYYY-MM-DD, optional)
- `bank_account_id` (`all` or UUID)
- `payment_method` (`all`, `cash`, `online`, `bank_transfer`, `credit_card`)
- `invoice_status` (`all`, `pending`, `partially_paid`, `paid`, `overdue`, `cancelled`, `refunded`)
- `isp_payment_type` (`all`, `monthly_subscription`, `bandwidth_usage`, `infrastructure`, `other`)
- `time_range` (`today`, `week`, `mtd`, `qtd`, `ytd`, `last_month`, `custom`)

## Response Shape
```json
{
  "schema_version": "financial_intelligence.v2",
  "generated_at": "2026-03-20T10:30:00+05:00",
  "sections_order": [
    "pl_summary",
    "revenue_breakdown",
    "cost_intelligence",
    "employee_financial",
    "collections_aging",
    "bank_positions"
  ],
  "filters_applied": {
    "start_date": "2026-03-01",
    "end_date": "2026-03-20",
    "bank_account_id": "all",
    "payment_method": "all",
    "invoice_status": "all",
    "isp_payment_type": "all",
    "time_range": "mtd"
  },
  "data": {
    "pl_summary": {
      "invoice_to_cash_conversion": {
        "value": 89.4,
        "invoiced": 2150000,
        "collected": 1922100,
        "status": "watch",
        "target_pct": 85
      },
      "salary_pct_of_revenue": {
        "value": 21.3,
        "salary_cost": 410000,
        "revenue": 1922100,
        "status": "healthy",
        "benchmark_range": { "min": 15, "max": 25 }
      }
    },
    "revenue_breakdown": {
      "net_profit_margin_trend_12m": [
        {
          "month": "Mar 2026",
          "month_short": "Mar",
          "revenue": 1922100,
          "net_profit": 542000,
          "margin_pct": 28.2
        }
      ]
    },
    "cost_intelligence": {
      "isp_cost_per_subscriber_trend_12m": [
        {
          "month": "Mar 2026",
          "month_short": "Mar",
          "isp_total_cost": 540000,
          "active_subscribers": 2120,
          "cost_per_subscriber": 254.72
        }
      ]
    },
    "employee_financial": {},
    "collections_aging": {},
    "bank_positions": {
      "cash_flow_bridge": {
        "scope": "bank_accounts_only",
        "opening_balance": 2155000,
        "collections_in": 1710000,
        "extra_income_in": 212100,
        "isp_payments_out": 540000,
        "operating_expenses_out": 301500,
        "salary_commission_out": 184000,
        "closing_balance": 3051600,
        "calculated_closing_balance": 3051600,
        "reconciliation_delta": 0
      }
    },
    "period": {
      "start_date": "2026-03-01",
      "end_date": "2026-03-20"
    }
  }
}
```

## Section Ownership
- `pl_summary`: Section A (P&L Summary Strip)
- `revenue_breakdown`: Section B (Revenue Breakdown)
- `cost_intelligence`: Section C (Cost Intelligence)
- `employee_financial`: Section D (Employee Financial Summary)
- `collections_aging`: Section E (Collections Aging)
- `bank_positions`: Section F (Bank Account Positions)

## Backward Compatibility
Backend aliases remain active for compatibility:
- `/dashboard/financial-analytics`
- `/dashboard/unified-financial`
- `/dashboard/ledger`

Notes:
- Frontend analytics is single-path on `/dashboard/financial-intelligence`.
- `Ledger` now uses `/dashboard/ledger` only.
- Section 5 adds additive analytics fields only; existing keys remain backward compatible.
- `cash_flow_bridge.scope` is currently `bank_accounts_only` and excludes unbanked cash movements.
- `isp_cost_per_subscriber_trend_12m.active_subscribers` uses billed unique customers by month as active-subscriber proxy.
