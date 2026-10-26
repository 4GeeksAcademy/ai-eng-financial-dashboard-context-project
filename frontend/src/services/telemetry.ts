/**
 * HealthCore Telemetry Capture Service
 *
 * Single point of entry for all frontend telemetry events.
 *
 * Architecture (three mechanisms working together):
 *   1. Local queue + batch — events accumulate in memory and are flushed
 *      every FLUSH_INTERVAL_MS or when MAX_QUEUE_SIZE is reached.
 *   2. Reliable flush via `navigator.sendBeacon` — when the user closes
 *      the tab/navigates away, the pending batch is sent reliably.
 *   3. Retry with exponential backoff — if the network fails, retry up to
 *      MAX_RETRIES times, then discard the batch.
 *
 * Usage:
 *   import { track } from '@/services/telemetry'
 *   track('section_viewed', { section: 'inventory' })
 *
 * The caller only passes event_type and properties. Everything else
 * (eventId, timestamp, sessionId, userId, schemaVersion, requestId) is
 * auto-enriched by this service.
 */

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const SCHEMA_VERSION = '1.0.0'
const FLUSH_INTERVAL_MS = 10_000      // 10 seconds
const MAX_QUEUE_SIZE = 20             // or when queue reaches 20 events
const MAX_RETRIES = 3                 // discard after 3 failed attempts
const RETRY_BASE_DELAY_MS = 1_000     // initial backoff delay

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TelemetryEvent {
  eventId: string
  timestamp: string
  sessionId: string
  userId: string
  event_type: string
  schemaVersion: string
  requestId: string
  properties: Record<string, unknown>
}

interface TelemetryBatch {
  events: TelemetryEvent[]
}

/* ------------------------------------------------------------------ */
/*  Internal state                                                     */
/* ------------------------------------------------------------------ */

let queue: TelemetryEvent[] = []
let sessionId: string | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null
let isFlushing = false

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateId(): string {
  // Use crypto.randomUUID if available, fallback to a simple v4-like id
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Simple UUID v4 implementation without external dependency
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function getOrCreateSessionId(): string {
  if (sessionId !== null) return sessionId
  // Try to restore from sessionStorage to survive soft navigations
  const stored = sessionStorage?.getItem('healthcore_telemetry_session_id')
  if (stored) {
    sessionId = stored
    return sessionId
  }
  sessionId = 'sess_' + generateId()
  try {
    sessionStorage?.setItem('healthcore_telemetry_session_id', sessionId)
  } catch {
    // Non-critical; proceed without persistence
  }
  return sessionId
}

function getEndpointUrl(): string {
  // NEXT_PUBLIC_TELEMETRY_ENDPOINT is injected by Vite at build time
  // from .env.local or the environment. Fallback for local dev.
  const viteEnv: Record<string, string | undefined> =
    (typeof import.meta !== 'undefined' && import.meta.env)
      ? (import.meta.env as Record<string, string | undefined>)
      : {}
  return viteEnv.NEXT_PUBLIC_TELEMETRY_ENDPOINT ?? 'http://localhost:8000/telemetry/events'
}

function buildEvent(
  eventType: string,
  properties: Record<string, unknown>,
): TelemetryEvent {
  return {
    eventId: generateId(),
    timestamp: new Date().toISOString(),
    sessionId: getOrCreateSessionId(),
    userId: 'operator_unknown', // Will be replaced by the auth layer when available
    event_type: eventType,
    schemaVersion: SCHEMA_VERSION,
    requestId: 'req_' + generateId(),
    properties,
  }
}

function getQueueSize(): number {
  return queue.length
}

/* ------------------------------------------------------------------ */
/*  Flush — send batch to backend                                      */
/* ------------------------------------------------------------------ */

async function flush(): Promise<void> {
  if (isFlushing) return
  const batch = queue.splice(0, queue.length) // atomically drain
  if (batch.length === 0) return

  isFlushing = true

  const url = getEndpointUrl()
  const payload: TelemetryBatch = { events: batch }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const body = (await response.json()) as { received: number }
        console.log(
          `[Telemetry] Flushed ${body.received} event(s) successfully (attempt ${attempt + 1})`,
        )
        isFlushing = false
        return // success
      }

      // Non-200 response — treat as transient failure
      lastError = new Error(`HTTP ${response.status}`)
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }

    // Exponential backoff before next attempt
    if (attempt < MAX_RETRIES - 1) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt)
      console.log(
        `[Telemetry] Flush attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // All attempts exhausted — discard the batch
  console.error(
    `[Telemetry] Failed to flush ${batch.length} event(s) after ${MAX_RETRIES} attempts — discarding batch.`,
    lastError,
  )
  isFlushing = false
}

/* ------------------------------------------------------------------ */
/*  Timer-based flush scheduling                                       */
/* ------------------------------------------------------------------ */

function scheduleFlush(): void {
  if (flushTimer !== null) return // already scheduled
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flush()
  }, FLUSH_INTERVAL_MS)
}

function resetFlushTimer(): void {
  if (flushTimer !== null) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
}

/* ------------------------------------------------------------------ */
/*  Reliable unload handler via sendBeacon                             */
/* ------------------------------------------------------------------ */

function handlePageHide(): void {
  if (queue.length === 0) return

  const batch = queue.splice(0, queue.length)
  const url = getEndpointUrl()
  const payload: TelemetryBatch = { events: batch }

  try {
    const blob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    })
    navigator.sendBeacon(url, blob)
    console.log(`[Telemetry] Sent ${batch.length} event(s) via sendBeacon on page unload`)
  } catch (err: unknown) {
    console.error('[Telemetry] sendBeacon failed — events discarded on unload', err)
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Track a telemetry event.
 *
 * This is the **only** entry point for emitting telemetry from the
 * frontend. All events are queued locally and sent in batches.
 *
 * @param eventType  - The event type (e.g. 'section_viewed', 'outbound_order_created')
 * @param properties - Event-specific properties (must match the allowlist in event-schemas.json)
 */
export function track(eventType: string, properties: Record<string, unknown>): void {
  const event = buildEvent(eventType, properties)
  queue.push(event)

  // Flush immediately if queue is full
  if (getQueueSize() >= MAX_QUEUE_SIZE) {
    resetFlushTimer()
    void flush()
  } else {
    scheduleFlush()
  }
}

/**
 * Force-flush any pending events. Useful before critical operations
 * or in tests.
 */
export async function flushNow(): Promise<void> {
  resetFlushTimer()
  await flush()
}

/* ------------------------------------------------------------------ */
/*  Registration of unload handler (idempotent)                        */
/* ------------------------------------------------------------------ */

if (typeof document !== 'undefined' && typeof navigator !== 'undefined') {
  // Catch both visibility change and before unload for reliable sendBeacon
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      handlePageHide()
    }
  })
  window.addEventListener('beforeunload', handlePageHide)
}