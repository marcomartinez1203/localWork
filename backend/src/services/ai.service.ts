// ============================================
// LocalWork — AI Service (Embeddings)
// ============================================
import { HfInference } from '@huggingface/inference';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Cliente de HuggingFace. Si no hay API key (ej. desarrollo local sin key),
// la generación de embeddings simplemente retornará un array vacío silenciosamente.
const hf = env.hfApiKey ? new HfInference(env.hfApiKey) : null;

// Modelo elegido por ser extremadamente rápido, gratuito y diseñado para embeddings (384 dimensiones)
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

export class AIService {
  
  /**
   * Genera el embedding (vector numérico) para un texto dado.
   * Si no hay API key o HuggingFace falla, retorna null.
   */
  static async generateEmbedding(text: string): Promise<number[] | null> {
    if (!hf || !text.trim()) return null;

    try {
      // Limpiar texto de tags HTML o saltos de línea innecesarios
      const cleanText = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
      
      const output = await hf.featureExtraction({
        model: EMBEDDING_MODEL,
        inputs: cleanText,
      });

      // El modelo devuelve un array. Dependiendo del batching, puede ser 1D o 2D.
      const embedding = Array.isArray(output[0]) ? output[0] : output;
      return embedding as number[];
    } catch (err) {
      logger.error('Error generando embedding con HuggingFace', { error: err });
      return null;
    }
  }

  /**
   * Construye el texto consolidado que representa a un Trabajador
   */
  static buildProfileText(profile: { bio?: string; skills?: string[]; experience?: any[] }): string {
    const parts = [];
    if (profile.bio) parts.push(profile.bio);
    if (profile.skills && profile.skills.length > 0) parts.push(`Habilidades: ${profile.skills.join(', ')}`);
    
    if (profile.experience && profile.experience.length > 0) {
      const expText = profile.experience.map(e => `${e.role || ''} en ${e.company || ''}`).join('. ');
      parts.push(`Experiencia: ${expText}`);
    }
    
    return parts.join('. ');
  }

  /**
   * Construye el texto consolidado que representa a un Empleo
   */
  static buildJobText(job: { title: string; description: string; requirements?: string }): string {
    return [
      job.title,
      job.description,
      job.requirements || ''
    ].join('. ');
  }
}
