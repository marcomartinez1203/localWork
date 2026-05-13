// ============================================
// LocalWork — Auth Service (Backend)
// ============================================
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { RegisterRequest, LoginRequest, AuthResponse, Profile } from '../types';

export class AuthService {

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        role: data.role,
        phone: data.phone,
      },
    });

    if (authError) {
      console.error('🔴 Supabase createUser error:', JSON.stringify(authError, null, 2));
      if (authError.message.includes('already registered')) {
        throw new AppError('Este correo ya está registrado', 409);
      }
      throw new AppError(authError.message, 400);
    }

    // 2. Crear perfil manualmente (no depender del trigger)
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: authData.user.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role || 'seeker',
      phone: data.phone || null,
      work_type: data.work_type || null,
    });

    if (profileError) {
      console.error('🔴 Profile creation error:', profileError);
    }

    // 3. Si es empleador y tiene empresa, crearla
    if (data.role === 'employer' && data.company_name) {
      await supabaseAdmin.from('companies').insert({
        owner_id: authData.user.id,
        name: data.company_name,
        nit: data.company_nit || null,
      });
    }

    // 4. Iniciar sesión para obtener el token
    const { data: loginData, error: loginErr } =
      await supabaseAdmin.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (loginErr || !loginData.session) {
      if (loginErr) console.error('[AuthService.register]', loginErr);
      throw new AppError('Error al crear la sesión', 500);
    }

    // 5. Obtener perfil
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    return {
      user: profile as Profile,
      token: loginData.session.access_token,
    };
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const { data: loginData, error } = await supabaseAdmin.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new AppError('Correo o contraseña incorrectos', 401);
    }

    if (!loginData.session) {
      throw new AppError('Error al crear la sesión', 500); // loginData exists, session missing — no extra error to log
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();

    return {
      user: profile as Profile,
      token: loginData.session.access_token,
    };
  }

  static async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new AppError('Perfil no encontrado', 404);
    }

    return data as Profile;
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    // Campos permitidos
    const allowed: (keyof Profile)[] = ['full_name', 'phone', 'bio', 'location', 'education', 'experience', 'skills', 'work_type', 'service_public', 'availability', 'hourly_rate'];
    const cleanUpdates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in updates) {
        cleanUpdates[key] = updates[key];
      }
    }

    const executeUpdate = async (payload: Record<string, unknown>) => {
      return supabaseAdmin
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select()
        .single();
    };

    let { data, error } = await executeUpdate(cleanUpdates);

    // Compatibilidad temporal: producción puede no tener aún la columna service_public.
    if (error && (error as { code?: string }).code === '42703' && 'service_public' in cleanUpdates) {
      const { service_public: _ignored, ...fallbackUpdates } = cleanUpdates;
      ({ data, error } = await executeUpdate(fallbackUpdates));
    }

    if (error) { console.error('[AuthService.updateProfile]', error); throw new AppError('Error al actualizar el perfil', 500); }

    // Actualizar embedding de IA silenciosamente en background si cambiaron campos relevantes
    if ('bio' in cleanUpdates || 'skills' in cleanUpdates || 'experience' in cleanUpdates) {
      setTimeout(async () => {
        try {
          const AIService = (await import('./ai.service')).AIService;
          const textToEmbed = AIService.buildProfileText(data as any);
          const embedding = await AIService.generateEmbedding(textToEmbed);
          if (embedding) {
            await supabaseAdmin.from('profiles').update({ embedding: `[${embedding.join(',')}]` }).eq('id', userId);
          }
        } catch (e) { console.error('Error actualizando embedding de perfil:', e); }
      }, 0);
    }

    return data as Profile;
  }

  static async resetPassword(email: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);
    if (error) { console.error('[AuthService.resetPassword]', error); throw new AppError('Error al enviar el correo de recuperación', 500); }
  }
}
