export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T, E = Error>(data: T): Result<T, E> {
  return { success: true, data };
}

export function err<T, E = Error>(error: E): Result<T, E> {
  return { success: false, error };
}