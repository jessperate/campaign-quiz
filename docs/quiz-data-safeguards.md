# Quiz data safeguards

## Application safeguards

- Quiz records are written without TTLs through `lib/quiz-store.ts`.
- JSON patches use an atomic Redis Lua merge, preventing stale read/modify/write overwrites.
- Moderation is reversible: records are marked `hidden` and `removed`, never deleted.
- Every new submission is copied to Vercel Blob as an immutable AES-256-GCM encrypted archive.
- `/api/cron/quiz-integrity` runs daily at 13:00 UTC and alerts Slack when checks fail.
- The integrity monitor automatically calls `PERSIST` on any quiz key that gains a TTL.

## Required production environment variables

- `CRON_SECRET`: authorizes Vercel Cron requests.
- `QUIZ_ARCHIVE_SECRET`: encryption secret for independent archives. Until set, the application falls back to `SLACK_SIGNING_SECRET`.
- Keep `SLACK_SIGNING_SECRET` available after introducing `QUIZ_ARCHIVE_SECRET`; restore tooling tries both keys so migration-era archives remain decryptable.
- `QUIZ_MIN_EXPECTED_RECORDS`: record-count alert floor. Defaults to `900`.
- `INTEGRITY_AUTO_PERSIST`: defaults to enabled; set to `false` only to disable automatic TTL repair.
- `INTEGRITY_SLACK_WEBHOOK_URL`: optional dedicated alert webhook; falls back to `SLACK_WEBHOOK_URL`.
- `REDIS_REQUIRE_TLS`: set to `true` only after the Redis Cloud endpoint is switched to TLS and `REDIS_URL` uses `rediss://`.

## Redis Cloud settings

Configure these in the Redis Cloud database console:

1. Data persistence: AOF every second.
2. Remote backup: enabled on the shortest practical interval.
3. Data eviction policy: `noeviction`.
4. TLS: enabled, followed by replacing `REDIS_URL` with the `rediss://` endpoint.
5. Capacity alerts: warning at 70% and critical at 80% memory utilization.

## Existing-record archive backfill

Dry run:

```bash
npm run redis:archive-quiz
```

Apply after reviewing the count:

```bash
npm run redis:archive-quiz -- --apply
```

The backfill is idempotent for records already marked with `archive.status = "complete"`.
