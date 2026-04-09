// ============================================
// LocalWork — Jobs Service (Backend)
// ============================================
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { Job, JobWithDetails, JobFilters, PaginatedResponse, Category } from '../types';

export class JobsService {

  static async list(filters: JobFilters): Promise<PaginatedResponse<JobWithDetails>> {
    const page = filters.page || 1;
    const perPage = filters.per_page || 9;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabaseAdmin
      .from('jobs_with_details')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

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
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
      );
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
    if (error) throw new AppError('Error al obtener los empleos', 500);

    return {
      data: (data || []) as JobWithDetails[],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    };
  }

  static async getById(jobId: string): Promise<JobWithDetails> {
    const { data, error } = await supabaseAdmin
      .from('jobs_with_details')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) throw new AppError('Empleo no encontrado', 404);
    return data as JobWithDetails;
  }

  static async create(companyId: string, jobData: Partial<Job>): Promise<Job> {
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
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        salary_text: jobData.salary_text,
        vacancies: jobData.vacancies || 1,
        status: jobData.status || 'active',
      })
      .select()
      .single();

    if (error) throw new AppError('Error al crear la oferta', 500);
    return data as Job;
  }

  static async update(jobId: string, userId: string, updates: Partial<Job>): Promise<Job> {
    // Verificar propiedad
    await this.verifyOwnership(jobId, userId);

    const allowed = [
      'title', 'description', 'requirements', 'benefits',
      'modality', 'location', 'salary_min', 'salary_max',
      'salary_text', 'vacancies', 'status', 'category_id',
    ] as const;

    const cleanUpdates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in updates) {
        cleanUpdates[key] = updates[key as keyof typeof updates];
      }
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update(cleanUpdates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw new AppError('Error al actualizar la oferta', 500);
    return data as Job;
  }

  static async delete(jobId: string, userId: string): Promise<void> {
    await this.verifyOwnership(jobId, userId);

    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) throw new AppError('Error al eliminar la oferta', 500);
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
    if (error) throw new AppError('Error al obtener tus ofertas', 500);

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
      throw new AppError('Error al guardar el empleo', 500);
    }
  }

  static async unsaveJob(userId: string, jobId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId);

    if (error) throw new AppError('Error al quitar el empleo guardado', 500);
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

    if (error) throw new AppError('Error al obtener las categorías', 500);
    return (data || []) as Category[];
  }

  // ── Employer Stats ──
  static async getEmployerStats(userId: string): Promise<Record<string, number>> {
    // Get company
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', userId)
      .single();

    if (!company) throw new AppError('No tienes una empresa registrada', 404);

    // Get all job IDs for this company
    const { data: jobs } = await supabaseAdmin
      .from('jobs')
      .select('id, status')
      .eq('company_id', company.id);

    const jobIds = (jobs || []).map(j => j.id);
    const activeCount = (jobs || []).filter(j => j.status === 'active').length;

    let totalApplications = 0;
    let totalSaves = 0;

    if (jobIds.length > 0) {
      const { count: appCount } = await supabaseAdmin
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .in('job_id', jobIds);
      totalApplications = appCount || 0;

      const { count: saveCount } = await supabaseAdmin
        .from('saved_jobs')
        .select('id', { count: 'exact', head: true })
        .in('job_id', jobIds);
      totalSaves = saveCount || 0;
    }

    return {
      active_jobs: activeCount,
      total_jobs: (jobs || []).length,
      total_applications: totalApplications,
      total_saves: totalSaves,
    };
  }

  // ── Stats ──
  static async getStats(): Promise<Record<string, number>> {
    const { data, error } = await supabaseAdmin
      .from('platform_stats')
      .select('*')
      .single();

    if (error) throw new AppError('Error al obtener estadísticas', 500);
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
