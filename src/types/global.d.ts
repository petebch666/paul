// React Native global type declarations
declare global {
  // Console API
  const console: {
    log: (...args: any[]) => void;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    info: (...args: any[]) => void;
    debug: (...args: any[]) => void;
  };

  // Timer APIs
  function setTimeout(callback: () => void, delay: number): number;
  function clearTimeout(id: number): void;
  function setInterval(callback: () => void, delay: number): number;
  function clearInterval(id: number): void;

  // Crypto API (if available)
  const crypto: {
    getRandomValues: (array: Uint8Array) => Uint8Array;
  } | undefined;

  // Development flag
  const __DEV__: boolean;
}

export {};

