// ============================================
// LocalWork — Jobs Service (Backend)
// ============================================
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { Job, JobWithDetails, JobFilters, PaginatedResponse, Category } from '../types';
import { removeAccents } from '../utils/string';
import { NotificationsService } from './notifications.service';

export class JobsService {

  static async list(filters: JobFilters): Promise<PaginatedResponse<JobWithDetails>> {
    const page = filters.page || 1;
    const perPage = filters.per_page || 9;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabaseAdmin
      .from('jobs_with_details')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    // Filtros
    if (filters.category) {
      query = query.or(`category_slug.eq.${filters.category},category_name.eq.${filters.category}`);
    }
    if (filters.modality) {
      query = query.eq('modality', filters.modality);
    }
    if (filters.location) {
      query = query.eq('location', filters.location);
    }
    if (filters.search) {
      // Sanitize + normalizar: quitar caracteres especiales y acentos
      const sanitized = removeAccents(filters.search.replace(/[%_(),.]/g, '').trim());
      const words = sanitized.split(/\s+/).filter(w => w.length >= 2);

      if (words.length === 1) {
        query = query.ilike('search_text', `%${words[0]}%`);
      } else if (words.length > 1) {
        const phrase = words.join(' ');
        const wordFilters = words.map(w => `search_text.ilike.%${w}%`).join(',');
        query = query.or(`search_text.ilike.%${phrase}%,${wordFilters}`);
      }
    }

    // Ordenamiento
    switch (filters.sort) {
      case 'salary-desc':
        query = query.order('salary_min', { ascending: false, nullsFirst: false });
        break;
      case 'salary-asc':
        query = query.order('salary_min', { ascending: true, nullsFirst: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) { console.error('[JobsService.list]', error); throw new AppError('Error al obtener los empleos', 500); }

    return {
      data: (data || []) as JobWithDetails[],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    };
  }

  static async getNearby(params: {
    lat: number;
    lng: number;
    radius: number;
    category?: string;
    modality?: string;
    barrio_id?: string;
  }): Promise<JobWithDetails[]> {
    const { lat, lng, radius, category, modality, barrio_id } = params;

    const { data, error } = await supabaseAdmin.rpc('get_jobs_nearby', {
        user_lat: lat,
        user_lng: lng,
        search_radius: radius,
        filter_category: category && category !== 'all' ? category : null,
        filter_modality: modality && modality !== 'all' ? modality : null,
        filter_barrio: barrio_id && barrio_id !== 'all' ? barrio_id : null
    });

    if (error) { 
        console.error('[JobsService.getNearby]', error); 
        throw new AppError('Error al obtener empleos cercanos', 500); 
    }

    return (data || []) as JobWithDetails[];
  }

  static async getById(jobId: string): Promise<JobWithDetails> {
    const { data, error } = await supabaseAdmin
      .from('jobs_with_details')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) throw new AppError('Empleo no encontrado', 404);

    // Incrementar conteo de vistas en background (falla silenciosa)
    supabaseAdmin.rpc('increment_job_view', { p_job_id: jobId }).then();

    return data as JobWithDetails;
  }

  static async getRecommended(userId: string): Promise<Job[]> {
    // 1. Obtener perfil del buscador
    const { data: profile, error: pError } = await supabaseAdmin.from('profiles').select('embedding').eq('id', userId).single();
    if (pError || !profile) throw new AppError('Perfil no encontrado', 404);

    // 2. Si el perfil no tiene embedding (nuevo usuario o no completado), retornamos ofertas recientes
    if (!profile.embedding) {
      const { data } = await supabaseAdmin.from('jobs').select('*, companies(*)').eq('status', 'active').order('created_at', { ascending: false }).limit(5);
      return data as Job[] || [];
    }

    // 3. Ejecutar búsqueda semántica con pgvector mediante función RPC
    // match_threshold: 0.5 (se puede ajustar para ser más o menos estricto)
    // match_count: 5 (top 5 resultados)
    const { data: matches, error: rpcError } = await supabaseAdmin.rpc('match_jobs', {
      query_embedding: profile.embedding,
      match_threshold: 0.3,
      match_count: 5
    });

    if (rpcError) {
      console.error('[JobsService.getRecommended] RPC Error:', rpcError);
      return [];
    }

    if (!matches || matches.length === 0) return [];

    // 4. Obtener los detalles completos de los trabajos coincidentes
    const jobIds = matches.map((m: any) => m.id);
    const { data: fullJobs } = await supabaseAdmin.from('jobs').select('*, companies(*)').in('id', jobIds);

    // Ordenarlos por la misma similitud devuelta por match_jobs
    return (fullJobs as Job[] || []).sort((a, b) => {
      const idxA = matches.findIndex((m: any) => m.id === a.id);
      const idxB = matches.findIndex((m: any) => m.id === b.id);
      return idxA - idxB;
    });
  }

  static async getEmployerAnalytics(userId: string): Promise<any> {
    const { data, error } = await supabaseAdmin.rpc('get_employer_analytics', { p_owner_id: userId });
    if (error) {
      console.error('[JobsService.getEmployerAnalytics]', error);
      throw new AppError('Error al obtener analíticas', 500);
    }
    return data;
  }

  static async create(companyId: string, jobData: Partial<Job>): Promise<Job> {
    let lat: number | null = null;
    let lng: number | null = null;
    if (jobData.barrio_id) {
      const { data: b } = await supabaseAdmin.from('barrios').select('lat, lng').eq('id', jobData.barrio_id).single();
      if (b) {
        lat = b.lat + (Math.random() * 0.0036 - 0.0018);
        lng = b.lng + (Math.random() * 0.0036 - 0.0018);
      }
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        company_id: companyId,
        category_id: jobData.category_id,
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        modality: jobData.modality || 'Presencial',
        location: jobData.location,
        barrio_id: jobData.barrio_id || null,
        location_lat: lat,
        location_lng: lng,
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        salary_text: jobData.salary_text,
        vacancies: jobData.vacancies || 1,
        status: jobData.status || 'active',
        expires_at: jobData.expires_at || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23514') throw new AppError('El salario mínimo no puede ser mayor al máximo', 400);
      console.error('[JobsService.create]', error); throw new AppError('Error al crear la oferta', 500);
    }

    // Notificar a seekers disponibles si la oferta se publica activa
    if ((jobData.status ?? 'active') === 'active') {
      this._notifyNewJobMatch(data as Job).catch(err =>
        console.error('[JobsService.create] new_job_match error', err)
      );
    }

    this._generateEmbedding(data as Job).catch(e => console.error(e));

    return data as Job;
  }

  private static async _notifyNewJobMatch(job: Job): Promise<void> {
    const { data: category } = await supabaseAdmin
      .from('categories')
      .select('name')
      .eq('id', job.category_id)
      .single();

    const { data: seekers } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'seeker')
      .not('availability', 'is', null);

    if (!seekers || seekers.length === 0) return;

    const categoryLabel = category?.name ? ` en ${category.name}` : '';
    await NotificationsService.createBulk(
      seekers.map(s => ({
        user_id: s.id,
        type: 'new_job_match' as const,
        title: 'Nueva oferta que podría interesarte',
        message: `Se publicó "${job.title}"${categoryLabel}. ¡Revísala antes de que se llene!`,
        data: { job_id: job.id },
      }))
    );
  }

  static async update(jobId: string, userId: string, updates: Partial<Job>): Promise<Job> {
    // Verificar propiedad
    await this.verifyOwnership(jobId, userId);

    const allowed = [
      'title', 'description', 'requirements', 'benefits',
      'modality', 'location', 'salary_min', 'salary_max',
      'salary_text', 'vacancies', 'status', 'category_id', 'expires_at', 'barrio_id'
    ] as const;

    const cleanUpdates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in updates) {
        cleanUpdates[key] = updates[key as keyof typeof updates];
      }
    }

    if (updates.barrio_id !== undefined) {
      if (updates.barrio_id === null) {
        cleanUpdates.location_lat = null;
        cleanUpdates.location_lng = null;
      } else {
        const { data: b } = await supabaseAdmin.from('barrios').select('lat, lng').eq('id', updates.barrio_id).single();
        if (b) {
          cleanUpdates.location_lat = b.lat + (Math.random() * 0.0036 - 0.0018);
          cleanUpdates.location_lng = b.lng + (Math.random() * 0.0036 - 0.0018);
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update(cleanUpdates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) { console.error('[JobsService.update]', error); throw new AppError('Error al actualizar la oferta', 500); }
    
    if ('title' in cleanUpdates || 'description' in cleanUpdates || 'requirements' in cleanUpdates) {
      this._generateEmbedding(data as Job).catch(e => console.error(e));
    }
    
    return data as Job;
  }

  static async delete(jobId: string, userId: string): Promise<void> {
    await this.verifyOwnership(jobId, userId);

    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) { console.error('[JobsService.delete]', error); throw new AppError('Error al eliminar', 500); }
  }

  private static async _generateEmbedding(job: Job): Promise<void> {
    const AIService = (await import('./ai.service')).AIService;
    const textToEmbed = AIService.buildJobText(job as any);
    const embedding = await AIService.generateEmbedding(textToEmbed);
    if (embedding) {
      await supabaseAdmin.from('jobs').update({ embedding: `[${embedding.join(',')}]` }).eq('id', job.id);
    }
  }



  static async getByCompanyOwner(userId: string, filters: JobFilters): Promise<PaginatedResponse<Job>> {
    const page = filters.page || 1;
    const perPage = filters.per_page || 10;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Obtener la empresa del usuario
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', userId)
      .single();

    if (!company) throw new AppError('No tienes una empresa registrada', 404);

    let query = supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) { console.error('[JobsService.getByCompanyOwner]', error); throw new AppError('Error al obtener tus ofertas', 500); }

    return {
      data: (data || []) as Job[],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    };
  }

  // ── Favoritos ──
  static async saveJob(userId: string, jobId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('saved_jobs')
      .insert({ user_id: userId, job_id: jobId });

    if (error) {
      if (error.code === '23505') throw new AppError('Ya guardaste este empleo', 409);
      console.error('[JobsService.saveJob]', error); throw new AppError('Error al guardar el empleo', 500);
    }
  }

  static async unsaveJob(userId: string, jobId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId);

    if (error) { console.error('[JobsService.unsaveJob]', error); throw new AppError('Error al quitar el empleo guardado', 500); }
  }

  static async getSavedJobs(userId: string): Promise<JobWithDetails[]> {
    const { data, error } = await supabaseAdmin
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', userId);

    if (error) throw new AppError('Error al obtener empleos guardados', 500);

    const jobIds = (data || []).map(s => s.job_id);
    if (jobIds.length === 0) return [];

    const { data: jobs } = await supabaseAdmin
      .from('jobs_with_details')
      .select('*')
      .in('id', jobIds);

    return (jobs || []) as JobWithDetails[];
  }

  // ── Categorías ──
  static async getCategories(): Promise<Category[]> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) { console.error('[JobsService.getCategories]', error); throw new AppError('Error al obtener las categorías', 500); }
    return (data || []) as Category[];
  }

  // ── Barrios ──
  static async getBarrios(): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('barrios')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) { console.error('[JobsService.getBarrios]', error); throw new AppError('Error al obtener los barrios', 500); }
    return data || [];
  }

  // ── Employer Stats ──
  static async getEmployerStats(userId: string): Promise<Record<string, number>> {
    const { data, error } = await supabaseAdmin
      .rpc('get_employer_stats', { p_user_id: userId });

    if (error || !data) throw new AppError('No tienes una empresa registrada', 404);
    return data as Record<string, number>;
  }

  // ── Stats ──
  static async getStats(): Promise<Record<string, number>> {
    const { data, error } = await supabaseAdmin
      .from('platform_stats')
      .select('*')
      .single();

    if (error) { console.error('[JobsService.getStats]', error); throw new AppError('Error al obtener estadísticas', 500); }
    return data as Record<string, number>;
  }

  // ── Helpers privados ──
  private static async verifyOwnership(jobId: string, userId: string): Promise<void> {
    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select('company_id')
      .eq('id', jobId)
      .single();

    if (!job) throw new AppError('Empleo no encontrado', 404);

    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('owner_id')
      .eq('id', job.company_id)
      .single();

    if (!company || company.owner_id !== userId) {
      throw new AppError('No tienes permisos para modificar esta oferta', 403);
    }
  }
}
