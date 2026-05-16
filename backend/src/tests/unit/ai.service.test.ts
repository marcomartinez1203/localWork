import { describe, it, expect } from 'vitest';
import { AIService } from '../../services/ai.service';

describe('AIService', () => {
  it('generateEmbedding null sin hfApiKey', async () => {
    expect(await AIService.generateEmbedding('x')).toBeNull();
  });
  it('generateEmbedding null con texto vacío', async () => {
    expect(await AIService.generateEmbedding('   ')).toBeNull();
  });
  it('buildProfileText completo', () => {
    const t = AIService.buildProfileText({ bio:'Dev', skills:['JS'], experience:[{role:'A', company:'C'}] });
    expect(t).toContain('Dev');
    expect(t).toContain('Habilidades: JS');
    expect(t).toContain('Experiencia');
  });
  it('buildProfileText vacío', () => {
    expect(AIService.buildProfileText({})).toBe('');
  });
  it('buildJobText completo', () => {
    const t = AIService.buildJobText({ title:'T', description:'D', requirements:'R' });
    expect(t).toBe('T. D. R');
  });
});
