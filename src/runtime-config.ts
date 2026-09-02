export type RuntimeConfigValues = Record<string, unknown>;

export type RuntimeConfigApi = {
  get: () => Promise<RuntimeConfigValues>;
  onSchemaError: (
    callback: (detail: { code?: string; error?: string }) => void,
  ) => () => void;
};

export const DEFAULT_RUNTIME_CONFIG_TIMEOUT_MS = 1_000;

/**
 * Read optional runtime configuration without allowing an unavailable schema
 * to block napplet startup on the SDK's 30-second request timeout.
 */
export function readRuntimeConfig(
  api: RuntimeConfigApi,
  timeoutMs = DEFAULT_RUNTIME_CONFIG_TIMEOUT_MS,
): Promise<RuntimeConfigValues> {
  return new Promise((resolve) => {
    let settled = false;
    let unsubscribe: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const finish = (values: RuntimeConfigValues): void => {
      if (settled) return;
      settled = true;
      if (timer !== null) clearTimeout(timer);
      unsubscribe?.();
      resolve(values);
    };

    timer = setTimeout(() => finish({}), Math.max(0, timeoutMs));

    try {
      unsubscribe = api.onSchemaError(() => finish({}));
    } catch {
      // The config domain is optional. A missing domain means normal routing.
    }
    if (settled) return;

    try {
      void api.get().then(
        (values) => finish(values ?? {}),
        () => finish({}),
      );
    } catch {
      finish({});
    }
  });
}
