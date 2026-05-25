import { EMPTY, Observable, throwError, timer } from 'rxjs';
import { catchError, map, switchMap, takeWhile } from 'rxjs/operators';

export interface PollUntilOptions<T> {
  intervalMs?: number;
  timeoutMs?: number;
  shouldStop: (value: T) => boolean;
  onError?: (error: unknown, attempt: number) => 'continue' | 'stop';
}

export interface PollResult<T> {
  value: T;
  attempt: number;
  stopped: boolean;
  timedOut: boolean;
}

const DEFAULT_INTERVAL_MS = 5000;
const DEFAULT_TIMEOUT_MS = 180000;

export function pollUntil<T>(
  fetcher: () => Observable<T>,
  options: PollUntilOptions<T>,
): Observable<PollResult<T>> {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const deadline = Date.now() + timeoutMs;
  let attempt = 0;

  return timer(0, intervalMs).pipe(
    takeWhile(() => Date.now() <= deadline, true),
    switchMap(() => {
      attempt++;
      const currentAttempt = attempt;
      return fetcher().pipe(
        map<T, PollResult<T>>((value) => ({
          value,
          attempt: currentAttempt,
          stopped: options.shouldStop(value),
          timedOut: false,
        })),
        catchError((error) => {
          const decision = options.onError?.(error, currentAttempt) ?? 'stop';
          return decision === 'stop' ? throwError(() => error) : EMPTY;
        }),
      );
    }),
    map((result) => ({
      ...result,
      timedOut: !result.stopped && Date.now() >= deadline,
    })),
    takeWhile((result) => !result.stopped && !result.timedOut, true),
  );
}
