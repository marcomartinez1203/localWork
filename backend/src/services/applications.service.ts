// ============================================
// LocalWork — Applications Service (Backend)
// ============================================
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { Application, ApplicationStatus, PaginatedResponse } from '../types';

export class ApplicationsService {

  static async apply(
    seekerId: string,
    jobId: string,
    coverLetter?: string,
    resumeUrl?: string
  ): Promise<Application> {
    // Verificar que el empleo existe y está activo
    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select('id, status')
      .eq('id', jobId)
      .single();

    if (!job || job.status !== 'active') {
      throw new AppError('Esta oferta no está disponible', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert({
        job_id: jobId,
        seeker_id: seekerId,
        cover_letter: coverLetter || null,
        resume_url: resumeUrl || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new AppError('Ya te postulaste a esta oferta', 409);
      }
      console.error('[ApplicationsService.apply]', error); throw new AppError('Error al crear la postulación', 500);
    }

    return data as Application;
  }

  static async getMyApplications(
    seekerId: string,
    page = 1,
    perPage = 10,
    status?: ApplicationStatus
  ): Promise<PaginatedResponse<Application & { job: { title: string; company_name: string } }>> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabaseAdmin
      .from('applications')
      .select(`
        *,
        job:jobs!inner(title, company_id,
          company:companies!inner(name)
        )
      `, { count: 'exact' })
      .eq('seeker_id', seekerId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) { console.error('[ApplicationsService.getMyApplications]', error); throw new AppError('Error al obtener postulaciones', 500); }

    return {
      data: (data || []) as (Application & { job: { title: string; company_name: string } })[],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    };
  }

  static async getForJob(
    jobId: string,
    userId: string,
    page = 1,
    perPage = 20
  ): Promise<PaginatedResponse<Application & { seeker: { full_name: string; email: string } }>> {
    // Verificar que el usuario es dueño de la empresa de este empleo
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
      throw new AppError('No tienes acceso a estas postulaciones', 403);
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, count, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        seeker:profiles!inner(full_name, email, phone, avatar_url, resume_url)
      `, { count: 'exact' })
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) { console.error('[ApplicationsService.getForJob]', error); throw new AppError('Error al obtener postulaciones', 500); }

    return {
      data: (data || []) as (Application & { seeker: { full_name: string; email: string } })[],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    };
  }

  static async updateStatus(
    applicationId: string,
    userId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<Application> {
    // Verificar propiedad
    const { data: app } = await supabaseAdmin
      .from('applications')
      .select('job_id')
      .eq('id', applicationId)
      .single();

    if (!app) throw new AppError('Postulación no encontrada', 404);

    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select('company_id')
      .eq('id', app.job_id)
      .single();

    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('owner_id')
      .eq('id', job?.company_id)
      .single();

    if (!company || company.owner_id !== userId) {
      throw new AppError('No tienes permisos', 403);
    }

    const updates: Record<string, unknown> = { status };
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin
      .from('applications')
      .update(updates)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) { console.error('[ApplicationsService.updateStatus]', error); throw new AppError('Error al actualizar el estado', 500); }
    return data as Application;
  }

  static async withdraw(applicationId: string, seekerId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('applications')
      .delete()
      .eq('id', applicationId)
      .eq('seeker_id', seekerId);

    if (error) { console.error('[ApplicationsService.withdraw]', error); throw new AppError('Error al retirar la postulación', 500); }
  }
}
