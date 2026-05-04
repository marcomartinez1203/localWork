// ============================================
// LocalWork — Global Type Declarations
// ============================================

interface Window {
  supabase?: {
    createClient: (url: string, key: string, options?: Record<string, unknown>) => {
      channel: (name: string, config?: Record<string, unknown>) => {
        on: (event: string, filter: Record<string, unknown>, handler: (payload: { new: Record<string, unknown> }) => void) => { subscribe: (callback?: (status: string) => void) => void };
        subscribe: (callback?: (status: string) => void) => void;
        presenceState: () => Record<string, unknown[]>;
        track: (payload: Record<string, unknown>) => Promise<void>;
      };
      removeChannel: (channel: unknown) => void;
      removeAllChannels: () => void;
    };
  };
}

declare const showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
