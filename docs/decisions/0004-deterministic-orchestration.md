# ADR 0004: Deterministic orchestration, LLMs only for reasoning

- Status: Accepted (implementation in Phase 5)
- Date: 2026-10-29

## Decision

- The orchestrator is a TypeScript state machine, not an LLM agent.
- LLM agents (analysis, BDD scenario, implementation, review, failure analysis) only propose content through tools checked by a policy engine.
- Pass/fail is decided by `tsc`, ESLint, Prettier, `bddgen` and Playwright, never by an agent's claim.
- Agent changes land on an `agent/<runId>` branch; a human merges.
- The AI provider sits behind one interface. A fake replay provider is used to test the runtime without cost. The real provider is chosen in Phase 5.

## Consequences

- Runs are reproducible and auditable; less autonomy than an LLM-driven orchestrator.
- Small amount of runtime code to own instead of an agent framework dependency.
