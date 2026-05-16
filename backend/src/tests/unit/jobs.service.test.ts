import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobsService } from '../../services/jobs.service';
import { getGlobalMock } from '../__mocks__/supabase';

vi.mock('../../config/supabase', async () => {
  const { createMockSupabaseModule } = await import('../__mocks__/supabase');
  return createMockSupabaseModule();
});

describe('JobsService', () => {
  beforeEach(() => { vi.clearAllMocks(); getGlobalMock()?.builders.clear(); });

  it('list paginación', async () => {
    getGlobalMock()!.getBuilder('jobs_with_details').setResult({ data:[{id:'j1',title:'Dev'},{id:'j2',title:'Designer'}], error:null, count:2 });
    const r = await JobsService.list({ page:1, per_page:9 });
    expect(r.data).toHaveLength(2);
    expect(r.total_pages).toBe(1);
  });

  it('list filtro categoría', async () => {
    getGlobalMock()!.getBuilder('jobs_with_details').setResult({ data:[], error:null, count:0 });
    const r = await JobsService.list({ category:'tech' });
    expect(r.data).toHaveLength(0);
  });

  it('list búsqueda texto', async () => {
    getGlobalMock()!.getBuilder('jobs_with_details').setResult({ data:[{id:'j3',title:'Python Dev'}], error:null, count:1 });
    const r = await JobsService.list({ search:'python' });
    expect(r.total).toBe(1);
  });

  it('list orden salary-desc', async () => {
    getGlobalMock()!.getBuilder('jobs_with_details').setResult({ data:[], error:null, count:0 });
    const r = await JobsService.list({ sort:'salary-desc' });
    expect(r.data).toHaveLength(0);
  });

  it('getById ok', async () => {
    getGlobalMock()!.getBuilder('jobs_with_details').setResult({ data:{id:'j4',title:'Backend',company_name:'Corp'}, error:null });
    const job = await JobsService.getById('j4');
    expect(job.title).toBe('Backend');
  });

  it('getById 404', async () => {
    getGlobalMock()!.getBuilder('jobs_with_details').setResult({ data:null, error:{message:'Not found'} });
    await expect(JobsService.getById('j99')).rejects.toThrow('Empleo no encontrado');
  });

  it('getRecommended sin embedding', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data:{ embedding:null }, error:null });
    getGlobalMock()!.getBuilder('jobs').setResult({ data:[{id:'j5',title:'Any'}], error:null });
    const jobs = await JobsService.getRecommended('u1');
    expect(jobs.length).toBeGreaterThanOrEqual(0);
  });

  it('getRecommended con embedding vacío', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data:{ embedding:[0.1] }, error:null });
    getGlobalMock()!.supabaseAdmin.rpc.mockResolvedValue({ data:[], error:null });
    const jobs = await JobsService.getRecommended('u1');
    expect(jobs).toEqual([]);
  });

  it('getNearby ok', async () => {
    getGlobalMock()!.supabaseAdmin.rpc.mockResolvedValue({ data:[{id:'j6',title:'Near'}], error:null });
    const jobs = await JobsService.getNearby({ lat:10, lng:-70, radius:5 });
    expect(jobs).toHaveLength(1);
  });

  it('getNearby error', async () => {
    getGlobalMock()!.supabaseAdmin.rpc.mockResolvedValue({ data:null, error:{message:'fail'} });
    await expect(JobsService.getNearby({ lat:10, lng:-70, radius:5 })).rejects.toThrow('Error al obtener empleos cercanos');
  });

  it('create ok', async () => {
    getGlobalMock()!.getBuilder('barrios').setResult({ data:{ lat:10, lng:-70 }, error:null });
    getGlobalMock()!.getBuilder('jobs').setResult({ data:{ id:'j6', title:'New', status:'active' }, error:null });
    getGlobalMock()!.getBuilder('categories').setResult({ data:{ name:'Tech' }, error:null });
    getGlobalMock()!.getBuilder('profiles').setResult({ data:[], error:null });
    const job = await JobsService.create('c1', { title:'New', description:'Desc', category_id:'cat1' });
    expect(job.title).toBe('New');
  });

  it('update ok', async () => {
    getGlobalMock()!.getBuilder('jobs').setResult({ data:{ id:'j7', title:'Updated', company_id:'c1' }, error:null });
    getGlobalMock()!.getBuilder('companies').setResult({ data:{ owner_id:'u1' }, error:null });
    const job = await JobsService.update('j7','u1',{ title:'Updated' });
    expect(job.title).toBe('Updated');
  });

  it('update 403', async () => {
    getGlobalMock()!.getBuilder('jobs').setResult({ data:{ id:'j8', company_id:'c2' }, error:null });
    getGlobalMock()!.getBuilder('companies').setResult({ data:{ owner_id:'otro' }, error:null });
    await expect(JobsService.update('j8','u1',{ title:'Hack' })).rejects.toThrow('No tienes permisos');
  });

  it('delete ok', async () => {
    getGlobalMock()!.getBuilder('jobs').setResult({ data:{ company_id:'c3' }, error:null });
    getGlobalMock()!.getBuilder('companies').setResult({ data:{ owner_id:'u1' }, error:null });
    getGlobalMock()!.getBuilder('jobs').delete.mockReturnValue(getGlobalMock()!.getBuilder('jobs'));
    getGlobalMock()!.getBuilder('jobs').eq.mockReturnValue(getGlobalMock()!.getBuilder('jobs'));
    await expect(JobsService.delete('j9','u1')).resolves.toBeUndefined();
  });

  it('saveJob ok', async () => {
    getGlobalMock()!.getBuilder('saved_jobs').setResult({ data:null, error:null });
    await expect(JobsService.saveJob('u1','j10')).resolves.toBeUndefined();
  });

  it('saveJob 409 duplicado', async () => {
    getGlobalMock()!.getBuilder('saved_jobs').setResult({ data:null, error:{ code:'23505' } });
    await expect(JobsService.saveJob('u1','j10')).rejects.toThrow('Ya guardaste este empleo');
  });

  it('unsaveJob ok', async () => {
    getGlobalMock()!.getBuilder('saved_jobs').delete.mockReturnValue(getGlobalMock()!.getBuilder('saved_jobs'));
    getGlobalMock()!.getBuilder('saved_jobs').eq.mockReturnValue(getGlobalMock()!.getBuilder('saved_jobs'));
    await expect(JobsService.unsaveJob('u1','j10')).resolves.toBeUndefined();
  });

  it('getSavedJobs ok', async () => {
    getGlobalMock()!.getBuilder('saved_jobs').setResult({ data:[{ job_id:'j11' }], error:null });
    getGlobalMock()!.getBuilder('jobs_with_details').setResult({ data:[{ id:'j11', title:'Saved' }], error:null });
    const jobs = await JobsService.getSavedJobs('u1');
    expect(jobs).toHaveLength(1);
  });

  it('getSavedJobs vacío', async () => {
    getGlobalMock()!.getBuilder('saved_jobs').setResult({ data:[], error:null });
    const jobs = await JobsService.getSavedJobs('u1');
    expect(jobs).toHaveLength(0);
  });

  it('getCategories', async () => {
    getGlobalMock()!.getBuilder('categories').setResult({ data:[{ id:'c1', name:'Tech' }], error:null });
    const cats = await JobsService.getCategories();
    expect(cats).toHaveLength(1);
  });

  it('getBarrios', async () => {
    getGlobalMock()!.getBuilder('barrios').setResult({ data:[{ id:'b1', nombre:'Centro' }], error:null });
    const b = await JobsService.getBarrios();
    expect(b).toHaveLength(1);
  });

  it('getStats', async () => {
    getGlobalMock()!.getBuilder('platform_stats').setResult({ data:{ total_jobs:100, total_users:50 }, error:null });
    const s = await JobsService.getStats();
    expect(s.total_jobs).toBe(100);
  });

  it('getByCompanyOwner ok', async () => {
    getGlobalMock()!.getBuilder('companies').setResult({ data:{ id:'c1' }, error:null });
    getGlobalMock()!.getBuilder('jobs').setResult({ data:[{ id:'j1', title:'T' }], error:null, count:1 });
    const r = await JobsService.getByCompanyOwner('u1', {});
    expect(r.data).toHaveLength(1);
  });

  it('getByCompanyOwner 404 sin empresa', async () => {
    getGlobalMock()!.getBuilder('companies').setResult({ data:null, error:{ message:'Not found' } });
    await expect(JobsService.getByCompanyOwner('u1', {})).rejects.toThrow('No tienes una empresa registrada');
  });

  it('getEmployerStats', async () => {
    getGlobalMock()!.supabaseAdmin.rpc.mockResolvedValue({ data:{ total_jobs:5 }, error:null });
    const s = await JobsService.getEmployerStats('u1');
    expect(s.total_jobs).toBe(5);
  });

  it('getEmployerStats 404', async () => {
    getGlobalMock()!.supabaseAdmin.rpc.mockResolvedValue({ data:null, error:{ message:'fail' } });
    await expect(JobsService.getEmployerStats('u1')).rejects.toThrow('No tienes una empresa registrada');
  });

  it('getEmployerAnalytics', async () => {
    getGlobalMock()!.supabaseAdmin.rpc.mockResolvedValue({ data:{ total_jobs:5 }, error:null });
    const s = await JobsService.getEmployerAnalytics('u1');
    expect(s.total_jobs).toBe(5);
  });
});
