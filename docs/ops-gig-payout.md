# Operations & Observability Runbook (OPS)

**Project:** Gig Payout
**Date:** 2026-07-06
**Version:** 0.1
**Owner:** Tech lead
**Status:** Draft
**Last reconciled:** N/A (not yet reconciled)
**Sources:** [sdd-gig-payout.md](sdd-gig-payout.md), [rfc-gig-payout-anchor-orchestration.md](rfc-gig-payout-anchor-orchestration.md)

---

## 1. SLOs & SLIs

| SLI | SLO | Measurement |
|-----|-----|-------------|
| API availability | 99.5% / 30d | Vercel uptime + synthetic ping |
| Payment index latency | p95 < 60s | `indexed_at - stellar_confirmed_at` |
| Off-ramp completion | 95% < 24h | `withdrawals.status=completed` |
| Horizon indexer lag | < 5 min | Cursor vs network head |

Error budget: 0.5% monthly downtime ≈ 3.6 hours.

---

## 2. Observability; Logs, Metrics, Traces

| Signal | Tool | Key fields |
|--------|------|------------|
| App logs | Vercel Log Drain → Axiom | `user_id`, `route`, `error` |
| Metrics | Axiom dashboards | `payments.indexed`, `withdrawals.started`, `anchor.health` |
| Traces | Vercel OTel (optional) | Off-ramp flow span |
| Uptime | Better Stack | `/api/health` |

**Structured log example:**

```json
{"event":"payment.indexed","tx_hash":"...","user_id":"...","amount_usdc":"500"}
```

---

## 3. Alerting & On-Call

| Alert | Condition | Route | Runbook |
|-------|-----------|-------|---------|
| API down | 5xx > 5% for 5m | Pager / Slack #ops | §4 Incident |
| Indexer stalled | No new cursor 15m | Slack #ops | Restart worker |
| Anchor primary down | 2 failed health checks | Slack #ops | RFC failover |
| Withdrawal failure spike | > 10% failed 1h | Pager | Check anchor status |

**On-call:** Founder rotation v1; document in PagerDuty when team > 2.

---

## 4. Incident Response

1. Acknowledge alert within 15m
2. Classify: P0 money loss, P1 off-ramp/receive broken, P2 degraded
3. Mitigate: flip `ANCHOR_PROVIDER`, disable off-ramp banner, Vercel rollback
4. Communicate: status page (Notion public page v1)
5. Postmortem within 48h for P0/P1 → `docs/pm-gig-payout-001.md`

**Rollback:** Vercel instant rollback to last green deploy. DB: run down migration only if forward migration caused incident.

---

## 5. Routine Operations

| Task | Frequency | Owner |
|------|-----------|-------|
| Review anchor health dashboard | Daily | On-call |
| Horizon cursor sanity check | Daily | Automated |
| Dependency security audit | Weekly | CI Dependabot |
| CLR policy review | Quarterly | Compliance |
| DR test (DB restore) | Quarterly | Tech |

**Backup:** Neon PITR enabled; RPO 1h, RTO 4h.

---

## Self-Check

- [x] SLOs map to SDD §7 NFRs
- [x] Alerts actionable with runbook links
- [x] Rollback documented
- [x] No em-dashes
