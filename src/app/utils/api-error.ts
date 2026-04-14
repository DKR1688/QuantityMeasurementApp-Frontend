export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!error || typeof error !== 'object') return fallback;

  const response = error as {
    error?: unknown;
    status?: number;
    message?: string;
  };

  if (typeof response.error === 'string') {
    const rawError = response.error.trim();

    if (rawError.startsWith('<!DOCTYPE html') || rawError.startsWith('<html')) {
      return response.status && response.status >= 500
        ? 'The backend is temporarily unavailable or waking up. Please wait a moment and try again.'
        : fallback;
    }

    return rawError;
  }

  if (response.error && typeof response.error === 'object') {
    const apiError = response.error as {
      error?: string;
      message?: string;
      details?: string;
    };

    if (apiError.error) return apiError.error;
    if (apiError.message) return apiError.message;
    if (apiError.details) return apiError.details;
  }

  if (typeof response.message === 'string') return response.message;

  if (response.status === 0) {
    return 'Cannot reach the backend right now. If you are using Render free tier, the service may still be waking up.';
  }

  if (response.status && response.status >= 500) {
    return 'The backend is temporarily unavailable or waking up. Please wait a moment and try again.';
  }

  return fallback;
}
