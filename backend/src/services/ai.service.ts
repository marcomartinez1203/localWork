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

  // --- Generative AI Features (via OpenRouter) ---

  /**
   * Llama a OpenRouter con el modelo gratuito indicado.
   */
  private static async callOpenRouter(prompt: string, maxTokens = 800): Promise<string> {
    const apiKey = env.openRouterApiKey;
    if (!apiKey || apiKey.includes('tu-api-key')) {
      throw new Error('OPENROUTER_API_KEY no configurada correctamente');
    }

    const body = JSON.stringify({
      model: 'moonshotai/kimi-k2:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://local-work-six.vercel.app',
        'X-Title': 'LocalWork',
      },
      body,
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('OpenRouter error', { status: response.status, body: errText });
      throw new Error(`OpenRouter respondió con ${response.status}`);
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Genera una carta de presentación para un empleo específico usando OpenRouter.
   */
  static async generateCoverLetter(profile: any, job: any): Promise<string> {
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
      return await AIService.callOpenRouter(prompt, 800) || 'No se pudo generar la carta.';
    } catch (err) {
      logger.error('Error generando carta de presentación', { error: err });
      throw new Error('Error al generar la carta de presentación mediante IA');
    }
  }

  /**
   * Sugiere mejoras al perfil de un usuario para hacerlo más atractivo.
   */
  static async suggestProfileImprovements(profile: any): Promise<string> {
    const prompt = `Actúa como un reclutador experto y coach de carrera.
Analiza este perfil de un trabajador y sugiere 3 a 5 puntos de mejora específicos y procesables para hacerlo más atractivo a los empleadores.
Sé constructivo, amigable y directo. Usa formato de lista con viñetas.

Perfil:
Biografía: ${profile.bio || '(Vacío)'}
Habilidades: ${(profile.skills || []).join(', ') || '(Vacío)'}
Disponibilidad: ${profile.availability || '(Vacía)'}
Tipo de trabajo deseado: ${profile.work_type || '(Vacío)'}`;

    try {
      return await AIService.callOpenRouter(prompt, 800) || 'No se pudieron generar sugerencias.';
    } catch (err) {
      logger.error('Error sugiriendo mejoras de perfil', { error: err });
      throw new Error('Error al analizar el perfil mediante IA');
    }
  }

  /**
   * Verifica si un nombre legal y cédula coinciden con el texto extraído (OCR) del documento de identidad.
   */
  static async verifyIdentityMatch(legalName: string, idNumber: string, ocrText: string): Promise<boolean> {
    if (!hf) {
      throw new Error('HUGGINGFACE_API_KEY no configurada');
    }

    const prompt = `Eres un experto analista de documentos de identidad de Colombia.
Tu tarea es verificar si la identidad provista por el usuario coincide con el texto sucio extraído mediante OCR de su foto de la cédula.
Debes ser tolerante a errores de lectura OCR (por ejemplo, '0' en vez de 'O', ruido, caracteres especiales) y nombres invertidos o incompletos, pero estrictamente debes poder confirmar que se trata de la misma persona.

Datos del usuario:
- Nombre Legal: ${legalName}
- Cédula: ${idNumber}

Texto extraído por OCR del documento:
"""
${ocrText}
"""

Responde ÚNICAMENTE con la palabra "SI" si estás seguro de que el documento pertenece a esa persona, o "NO" si no hay coincidencia o es dudoso. No añadas ninguna otra explicación.`;

    try {
      const response = await hf.chatCompletion({
        model: 'meta-llama/Llama-3.2-3B-Instruct',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1
      });

      const reply = (response.choices?.[0]?.message?.content || '').trim().toUpperCase();
      return reply.startsWith('SI');
    } catch (err) {
      logger.error('Error en verifyIdentityMatch', { error: err });
      return false; // Fallback to manual if AI fails
    }
  }
}
