// ============================================
// LocalWork — Applications Service (Backend)
// ============================================
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { Application, ApplicationStatus, PaginatedResponse } from '../types';
import { NotificationsService } from './notifications.service';

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
      .select('id, status, title, company_id')
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

    // Notificar al empleador (fire-and-forget)
    void (async () => {
      try {
        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('owner_id')
          .eq('id', job.company_id)
          .single();
        if (company?.owner_id) {
          await NotificationsService.create(
            company.owner_id,
            'application_received',
            'Nueva postulación recibida',
            `Alguien se postuló a tu oferta "${job.title}".`,
            { job_id: jobId, application_id: data.id }
          );
        }
      } catch (err) {
        console.error('[ApplicationsService.apply] notification error', err);
      }
    })();

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

  static async getMineForJob(
    seekerId: string,
    jobId: string
  ): Promise<Application | null> {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('seeker_id', seekerId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) {
      console.error('[ApplicationsService.getMineForJob]', error);
      throw new AppError('Error al consultar la postulación', 500);
    }

    return (data as Application | null) || null;
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
    // Verificar propiedad y obtener datos necesarios para la notificación
    const { data: app } = await supabaseAdmin
      .from('applications')
      .select('job_id, seeker_id')
      .eq('id', applicationId)
      .single();

    if (!app) throw new AppError('Postulación no encontrada', 404);

    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select('company_id, title')
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

    // Notificar al seeker del cambio de estado
    const STATUS_MESSAGES: Record<ApplicationStatus, string> = {
      pending:     'Tu postulación está pendiente de revisión.',
      reviewed:    'Tu postulación fue revisada por el empleador.',
      shortlisted: '¡Fuiste preseleccionado/a para esta oferta!',
      interview:   '¡Te han invitado a una entrevista!',
      accepted:    '¡Felicitaciones! Fuiste contratado/a.',
      rejected:    'Tu postulación no fue seleccionada en esta ocasión.',
      completed:   'Tu contrato ha finalizado. ¡Califica tu experiencia!',
    };

    NotificationsService.create(
      app.seeker_id,
      'application_status_changed',
      'Tu postulación fue actualizada',
      `${STATUS_MESSAGES[status]} — Oferta: "${job?.title ?? ''}"`,
      { job_id: app.job_id, application_id: applicationId, status }
    ).catch(err => console.error('[ApplicationsService.updateStatus] notification error', err));

    // Send rating_request notifications when contract is completed
    if (status === 'completed') {
      // Get seeker name for employer notification
      const { data: seekerProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', app.seeker_id)
        .single();

      // Notify seeker to rate the employer/company
      NotificationsService.create(
        app.seeker_id,
        'rating_request',
        'Califica tu experiencia',
        `Tu contrato en "${job?.title ?? ''}" ha finalizado. ¡Califica a la empresa!`,
        { application_id: applicationId, job_id: app.job_id }
      ).catch(err => console.error('[ApplicationsService] rating_request notification error', err));

      // Notify employer to rate the worker
      NotificationsService.create(
        userId,
        'rating_request',
        'Califica al trabajador',
        `El contrato de ${seekerProfile?.full_name ?? 'el trabajador'} en "${job?.title ?? ''}" finalizó. ¡Califícalo!`,
        { application_id: applicationId, job_id: app.job_id, seeker_id: app.seeker_id }
      ).catch(err => console.error('[ApplicationsService] rating_request notification error', err));
    }

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
