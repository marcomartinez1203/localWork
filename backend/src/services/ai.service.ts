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

  // --- Generative AI Features ---

  /**
   * Genera una carta de presentación para un empleo específico usando OpenRouter.
   */
  static async generateCoverLetter(profile: any, job: any): Promise<string> {
    if (!env.openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY no configurada');
    }

    const prompt = `Actúa como un candidato profesional aplicando a un empleo.
Oferta de empleo:
Título: ${job.title}
Descripción: ${job.description}
Requisitos: ${job.requirements || 'N/A'}

Perfil del candidato:
Nombre: ${profile.full_name}
Biografía: ${profile.bio || 'N/A'}
Habilidades: ${(profile.skills || []).join(', ')}

Escribe una carta de presentación persuasiva, profesional y concisa (máximo 3 párrafos).
La carta debe conectar las habilidades del candidato con los requisitos del empleo.
No agregues placeholders como [Nombre de la Empresa], adapta lo que puedas con la info provista.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.openRouterApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-pro', // u otro modelo libre disponible en openrouter
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) throw new Error('Error de OpenRouter: ' + response.statusText);
      
      const data = (await response.json()) as any;
      return data.choices?.[0]?.message?.content || 'No se pudo generar la carta.';
    } catch (err) {
      logger.error('Error generando carta de presentación', { error: err });
      throw new Error('Error al generar la carta de presentación mediante IA');
    }
  }

  /**
   * Sugiere mejoras al perfil de un usuario para hacerlo más atractivo.
   */
  static async suggestProfileImprovements(profile: any): Promise<string> {
    if (!env.openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY no configurada');
    }

    const prompt = `Actúa como un reclutador experto y coach de carrera.
Analiza este perfil de un trabajador y sugiere 3 a 5 puntos de mejora específicos y procesables para hacerlo más atractivo a los empleadores.
Sé constructivo, amigable y directo. Usa formato Markdown con viñetas.

Perfil:
Biografía: ${profile.bio || '(Vacío)'}
Habilidades: ${(profile.skills || []).join(', ') || '(Vacío)'}
Disponibilidad: ${profile.availability || '(Vacía)'}
Tipo de trabajo deseado: ${profile.work_type || '(Vacío)'}`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.openRouterApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-pro',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) throw new Error('Error de OpenRouter: ' + response.statusText);
      
      const data = (await response.json()) as any;
      return data.choices?.[0]?.message?.content || 'No se pudieron generar sugerencias.';
    } catch (err) {
      logger.error('Error sugiriendo mejoras de perfil', { error: err });
      throw new Error('Error al analizar el perfil mediante IA');
    }
  }
}
