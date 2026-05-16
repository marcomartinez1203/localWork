// ============================================
// LocalWork — Supabase Mock Helper for Tests
// ============================================
import { vi } from 'vitest';

export interface MockResult {
  data?: unknown;
  error?: unknown | null;
  count?: number;
}

/**
 * Crea un mock de query builder de Supabase reutilizable.
 * Todos los métodos de encadenamiento retornan el mismo objeto,
 * permitiendo configurar el resultado final (single, count, etc.)
 * antes de cada test.
 */
export function createMockQueryBuilder() {
  const builder: any = {};

  const chainMethods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'ilike', 'or', 'and', 'in', 'contains',
    'order', 'range', 'limit', 'not', 'gte', 'lte', 'is'
  ];

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  builder.single = vi.fn(async () => ({ data: null, error: null }));
  builder.maybeSingle = vi.fn(async () => ({ data: null, error: null }));
  builder.count = vi.fn(async (_opts?: unknown) => ({ data: null, error: null, count: 0 }));
  builder.then = vi.fn((resolve: (v: unknown) => unknown) => resolve({ data: null, error: null, count: 0 }));

  builder.setResult = (result: MockResult) => {
    const res = {
      data: result.data ?? null,
      error: result.error ?? null,
      count: result.count ?? (Array.isArray(result.data) ? result.data.length : result.data ? 1 : 0),
    };
    builder.single.mockResolvedValue({ data: result.data ?? null, error: result.error ?? null });
    builder.maybeSingle.mockResolvedValue({ data: result.data ?? null, error: result.error ?? null });
    builder.count.mockResolvedValue(res);
    builder.then.mockImplementation((resolve: (v: unknown) => unknown) => resolve(res));
    return builder;
  };

  return builder;
}

/**
 * Crea un mock completo del cliente Supabase admin con un query builder por tabla.
 * Permite configurar resultados diferentes por tabla.
 */
export function createMockSupabase() {
  const builders = new Map<string, ReturnType<typeof createMockQueryBuilder>>();

  const getBuilder = (table: string) => {
    if (!builders.has(table)) {
      builders.set(table, createMockQueryBuilder());
    }
    return builders.get(table)!;
  };

  const supabaseAdmin = {
    from: vi.fn((table: string) => getBuilder(table)),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    auth: {
      admin: {
        createUser: vi.fn(() => Promise.resolve({
          data: { user: { id: 'mock-user-id', email: 'test@example.com' } },
          error: null,
        })),
      },
      signInWithPassword: vi.fn(() => Promise.resolve({
        data: { session: { access_token: 'mock-token' }, user: { id: 'mock-user-id' } },
        error: null,
      })),
      getUser: vi.fn((token: string) => {
        if (token === 'invalid') {
          return Promise.resolve({ data: { user: null }, error: { message: 'Invalid token' } });
        }
        return Promise.resolve({
          data: { user: { id: 'mock-user-id', email: 'test@example.com' } },
          error: null,
        });
      }),
      resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'mock-path' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://mock.supabase.co/mock' } })),
      })),
    },
  };

  return { supabaseAdmin, getBuilder, builders };
}

// Global instance for vi.mock factory
let _globalMock: ReturnType<typeof createMockSupabase> | null = null;

export function setGlobalMock(mock: ReturnType<typeof createMockSupabase>) {
  _globalMock = mock;
}

export function getGlobalMock() {
  return _globalMock;
}

export function createMockSupabaseModule() {
  const mock = createMockSupabase();
  setGlobalMock(mock);
  return {
    supabaseAdmin: mock.supabaseAdmin,
    createSupabaseClient: vi.fn((_token?: string) => mock.supabaseAdmin),
  };
}
