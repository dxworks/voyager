# Voyager Summary and Unpack Decision Memo

## Context

We implemented a mission-driven summary flow between `voyager` and `voyager-summarizer` and need PO alignment on the operating model and next-step UX decisions.

## Decision Area 1: Summary Flow (Voyager + Voyager-Summarizer)

### What Is Implemented

- Voyager supports `summary` as a first-class default action and mission command.
- Instruments can now declare two summary outputs:
  - `summaryMdFile`
  - `summaryHtmlFile`
- Voyager exposes both paths in mission context variables:
  - `${instrumentName}SummaryMd`
  - `${instrumentName}SummaryHtml`
- If a file does not exist, Voyager sets the variable to `'null'`.
- A summarizer instrument can run last (`runOrder`) and call `voyager-summarizer` using only context variables.
- Voyager-summarizer handles both HTML modes:
  - `inline` (inside Markdown)
  - `reference` (external HTML path)
- If a `reference` HTML path is missing, summarizer warns and skips only that tool section from HTML output, while continuing report generation.

### Impact

- The flow is generic and stable across missions.
- Missing optional HTML does not break consolidated reporting.
- Configuration remains mission/instrument driven and reusable.

### Recommendation

Accept current implementation as baseline architecture for summary generation and consolidation.

## Decision Area 2: Unpack Input Strategy

### Current Behavior

- Unpack is mission-based.
- Archive input comes from mission `target`/`targets`.
- Mapping and unpack logic are defined in mission configuration.

### Proposed Improvement

- Keep mission as source of truth for unpack rules and mapping.
- Add an optional CLI archive argument (for example `--archive` / `--archives`) that overrides only the input artifact path at runtime.

### Why This Option

- Preserves reproducibility and governance in mission files.
- Adds convenience for ad-hoc user-provided archives.
- Avoids duplicating mapping logic in CLI parameters.

### Recommendation

Adopt a hybrid approach:

- Mission defines unpack behavior.
- CLI archive argument provides runtime input override.

## Final Proposed Direction

1. Keep the implemented summary architecture as the standard flow.
2. Plan a small unpack UX enhancement: optional archive override parameter while preserving mission-defined unpack mapping.
