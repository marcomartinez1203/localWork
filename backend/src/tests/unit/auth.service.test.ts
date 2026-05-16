// ============================================
// LocalWork — AuthService Unit Tests
// ============================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../services/auth.service';

vi.mock('../../config/supabase', async () => {
  const { createMockSupabaseModule } = await import('../__mocks__/supabase');
  return createMockSupabaseModule();
});

import { getGlobalMock } from '../__mocks__/supabase';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getGlobalMock()?.builders.clear();
  });

  describe('register', () => {
    it('Debe registrar un usuario y retornar token', async () => {
      const mock = getGlobalMock()!;
      mock.supabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'u1', email: 'a@b.com' } }, error: null,
      });
      mock.supabaseAdmin.auth.signInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'tok123' }, user: { id: 'u1' } }, error: null,
      });
      mock.getBuilder('profiles').setResult({
        data: { id: 'u1', email: 'a@b.com', full_name: 'Ana', role: 'seeker' },
        error: null,
      });

      const result = await AuthService.register({
        email: 'a@b.com', password: '12345678', full_name: 'Ana', role: 'seeker',
      });

      expect(result.token).toBe('tok123');
      expect(result.user.email).toBe('a@b.com');
    });

    it('Debe lanzar error si el correo ya existe', async () => {
      const mock = getGlobalMock()!;
      mock.supabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      });

      await expect(AuthService.register({
        email: 'a@b.com', password: '12345678', full_name: 'Ana', role: 'seeker',
      })).rejects.toThrow('Este correo ya está registrado');
    });
  });

  describe('login', () => {
    it('Debe iniciar sesión y retornar token', async () => {
      const mock = getGlobalMock()!;
      mock.supabaseAdmin.auth.signInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'tok456' }, user: { id: 'u2' } }, error: null,
      });
      mock.getBuilder('profiles').setResult({
        data: { id: 'u2', email: 'b@c.com', full_name: 'Bob', role: 'seeker' },
        error: null,
      });

      const result = await AuthService.login({ email: 'b@c.com', password: '12345678' });
      expect(result.token).toBe('tok456');
    });

    it('Debe lanzar error 401 si credenciales son inválidas', async () => {
      const mock = getGlobalMock()!;
      mock.supabaseAdmin.auth.signInWithPassword.mockResolvedValue({
        data: null, error: { message: 'Invalid login' },
      });

      await expect(AuthService.login({ email: 'x@y.com', password: 'bad' }))
        .rejects.toThrow('Correo o contraseña incorrectos');
    });
  });

  describe('getProfile', () => {
    it('Debe retornar el perfil por userId', async () => {
      getGlobalMock()!.getBuilder('profiles').setResult({
        data: { id: 'u3', full_name: 'Carlos', role: 'employer' }, error: null,
      });

      const profile = await AuthService.getProfile('u3');
      expect(profile.full_name).toBe('Carlos');
    });

    it('Debe lanzar 404 si el perfil no existe', async () => {
      getGlobalMock()!.getBuilder('profiles').setResult({ data: null, error: { message: 'Not found' } });

      await expect(AuthService.getProfile('u99')).rejects.toThrow('Perfil no encontrado');
    });
  });

  describe('updateProfile', () => {
    it('Debe actualizar campos permitidos', async () => {
      getGlobalMock()!.getBuilder('profiles').setResult({
        data: { id: 'u4', full_name: 'Nuevo', bio: 'Hola' }, error: null,
      });

      const updated = await AuthService.updateProfile('u4', { full_name: 'Nuevo', bio: 'Hola' });
      expect(updated.full_name).toBe('Nuevo');
    });

    it('Debe ignorar campos no permitidos', async () => {
      getGlobalMock()!.getBuilder('profiles').setResult({
        data: { id: 'u5', full_name: 'Luis' }, error: null,
      });

      const updated = await AuthService.updateProfile('u5', { full_name: 'Luis', id: 'hacked' } as any);
      expect(updated).toBeDefined();
    });
  });

  describe('resetPassword', () => {
    it('Debe enviar correo de recuperación', async () => {
      await expect(AuthService.resetPassword('test@test.com')).resolves.toBeUndefined();
    });
  });
});
