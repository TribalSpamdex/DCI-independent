# Local coach integration contract (V0.4.0, contract version 1)

The engine is independent of the interface. Copy the required JavaScript modules into the host's own static assets and serve them from the host's origin for offline operation; preserve relative import paths and version all cached assets together. No network calls, WebGPU, external inference, subscription or runtime API key are required.

## Read-only calls

Import newPlayer, query, command and batch from coach-api.mjs. A request has {version:1,type,day,payload}. Supply a local ISO calendar date (YYYY-MM-DD) and a DCI player snapshot. Queries return verified coaching reviews, a proposed training session, checkout options, a memory summary or a current action agenda. The query function does not mutate input or persist it. The language interface is limited to supported question patterns; it is not a general conversational LLM.

## Commands

Commands return a new validated snapshot; the host must commit it to its own application-specific storage only after explicit consent and successful validation. The confirmed:true argument is an interface contract, not a security sandbox. An untrusted host can bypass it, so do not expose command execution directly to a future LLM. An atomic batch of up to 200 commands returns no partial result if any command fails. Commands support performance observations, recorded darts, legs, session logs, readiness, investigation answers, facts and intervention consent. Accepting an intervention rechecks the current executive report.

## Benchmark interchange

Use host-adapter.mjs or the app's local file import. The format is JSON with format "DCI-benchmark-events", version 1, source (stable source identifier, 1–32 letters/digits/underscores/hyphens), and events (1–200 records per file). Each record needs eventId (stable 1–60 letters/digits/underscores/hyphens), day, skill, context, protocol (exact measurement definition, 1–55 characters), attempts, hits. Context must be practice or competition. For scoring and firstNine, hits means total credited points and attempts means darts; other skills use successes and attempts in the explicitly defined benchmark. Never map checkout visits to per-dart doubles accuracy. Never fabricate unrecorded aims, targets, attempts or dates. Host protocol is namespaced. Same source and event ID with identical contents is a duplicate; changed contents with same ID is rejected. Different sources remain distinct. Imports do not automatically merge older DCAI or darts-coach memory, and require player consent. A host must supply the real format mapping and stable IDs. No code in either other repository has been changed.

## Limitations

A local API and file bridge are integration infrastructure, not evidence of integration with an existing app. The host's actual source, schema, scoring conventions, storage and UI need an audit, adapter and separate integration tests. The independent app remains the sole deployment target for this batch. No unrestricted conversation or automatic natural-language fact extraction. The host must not infer player consent from an assistant message. Existing DCI player memory is retained; backup recommended. Actual iPhone performance and reliability remain to be verified.
