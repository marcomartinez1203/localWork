import Tesseract from 'tesseract.js';
import { AIService } from './ai.service';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

export class VerificationService {
  /**
   * Process an uploaded ID image, extract text using OCR, and verify against the provided legal name.
   */
  static async processIdentityVerification(
    userId: string,
    legalName: string,
    idNumber: string,
    imageBuffer: Buffer
  ): Promise<{ status: string; reason?: string }> {
    try {
      logger.info('Starting OCR process for verification', { userId });
      
      // 1. OCR Extraction using Tesseract
      // We use eng+spa. Worker is initialized automatically by Tesseract.recognize
      const ocrResult = await Tesseract.recognize(imageBuffer, 'spa+eng', {
        logger: m => logger.debug('Tesseract progress', { progress: m })
      });
      
      const extractedText = ocrResult.data.text;
      
      if (!extractedText || extractedText.trim().length < 10) {
        return { status: 'rejected', reason: 'No se pudo extraer texto claro de la imagen. Por favor toma una foto más nítida.' };
      }

      logger.info('OCR extracted text length', { length: extractedText.length });

      // 2. Validate extracted text with AI
      const isMatch = await AIService.verifyIdentityMatch(legalName, idNumber, extractedText);

      // 3. Update Profile
      const status = isMatch ? 'verified' : 'pending_manual';
      
      await supabaseAdmin.from('profiles').update({
        legal_name: legalName,
        id_number: idNumber,
        verification_status: status
      }).eq('id', userId);

      return {
        status,
        reason: isMatch 
          ? 'Identidad verificada automáticamente con éxito.' 
          : 'Revisión manual requerida. Los datos no coincidieron con suficiente claridad en el documento.'
      };
      
    } catch (err) {
      logger.error('Error during identity verification process', { error: err });
      throw new Error('Ocurrió un error al procesar el documento. Intenta nuevamente.');
    }
  }
}
