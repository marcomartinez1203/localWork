// ============================================
// LocalWork — Upload Routes
// ============================================
import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../config/supabase';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Usa: JPG, PNG, WebP o PDF'));
    }
  },
});

// Upload avatar
router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No se proporcionó un archivo' });
        return;
      }

      // Only allow image types for avatars
      const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!imageTypes.includes(req.file.mimetype)) {
        res.status(400).json({ message: 'Solo se permiten imágenes (JPG, PNG, WebP) para el perfil' });
        return;
      }

      const ext = req.file.originalname.split('.').pop();
      const path = `avatars/${req.userId}.${ext}`;

      const { error } = await supabaseAdmin.storage
        .from('uploads')
        .upload(path, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabaseAdmin.storage
        .from('uploads')
        .getPublicUrl(path);

      // Update profile
      await supabaseAdmin
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', req.userId);

      res.json({ url: urlData.publicUrl });
    } catch (err) {
      next(err);
    }
  }
);

// Upload resume/CV
router.post(
  '/resume',
  authenticate,
  upload.single('resume'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No se proporcionó un archivo' });
        return;
      }

      // Only allow PDF for resumes
      if (req.file.mimetype !== 'application/pdf') {
        res.status(400).json({ message: 'Solo se permiten archivos PDF para el currículum' });
        return;
      }

      const ext = req.file.originalname.split('.').pop();
      const path = `resumes/${req.userId}_${Date.now()}.${ext}`;

      const { error } = await supabaseAdmin.storage
        .from('uploads')
        .upload(path, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabaseAdmin.storage
        .from('uploads')
        .getPublicUrl(path);

      res.json({ url: urlData.publicUrl });
    } catch (err) {
      next(err);
    }
  }
);
// Upload company logo
router.post(
  '/company-logo',
  authenticate,
  upload.single('logo'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No se proporcionó un archivo' });
        return;
      }

      // Only allow image types for logos
      const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!imageTypes.includes(req.file.mimetype)) {
        res.status(400).json({ message: 'Solo se permiten imágenes (JPG, PNG, WebP)' });
        return;
      }

      // Get the user's company
      const { data: company } = await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('owner_id', req.userId!)
        .single();

      if (!company) {
        res.status(404).json({ message: 'No tienes una empresa registrada' });
        return;
      }

      const ext = req.file.originalname.split('.').pop();
      const path = `logos/${company.id}.${ext}`;

      const { error } = await supabaseAdmin.storage
        .from('uploads')
        .upload(path, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabaseAdmin.storage
        .from('uploads')
        .getPublicUrl(path);

      // Update company logo_url
      await supabaseAdmin
        .from('companies')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', company.id);

      res.json({ url: urlData.publicUrl });
    } catch (err) {
      next(err);
    }
  }
);

// ==========================================
// 4. Subida de Documento de Identidad (Verification)
// ==========================================
const identityFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no válido. Sube un PDF, JPG o PNG.'));
  }
};
const uploadIdentity = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: identityFilter });

router.post('/identity', authenticate, uploadIdentity.single('document'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se ha subido ningún documento' });
      return;
    }

    const fileExt = req.file.originalname.split('.').pop() || 'pdf';
    const fileName = `${req.userId}-${Date.now()}.${fileExt}`;
    const filePath = `identity_docs/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw new AppError('Error al subir documento en Supabase', 500);
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('uploads').getPublicUrl(filePath);

    // Update profile verification status to pending
    await supabaseAdmin
      .from('profiles')
      .update({
        identity_document_url: publicUrlData.publicUrl,
        verification_status: 'pending'
      })
      .eq('id', req.userId!);

    res.json({ message: 'Documento subido. En revisión.', status: 'pending' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 5. Portafolio Visual (hasta 5 imágenes)
// ==========================================
const portfolioFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPG, PNG, WebP).'));
  }
};
const uploadPortfolio = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: portfolioFilter });

router.post('/portfolio', authenticate, uploadPortfolio.single('image'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se ha subido ninguna imagen' });
      return;
    }

    // Get current portfolio
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('portfolio_images')
      .eq('id', req.userId!)
      .single();

    const current: string[] = Array.isArray(profile?.portfolio_images) ? profile.portfolio_images : [];

    if (current.length >= 5) {
      res.status(400).json({ message: 'Máximo 5 imágenes en el portafolio' });
      return;
    }

    const fileExt = req.file.originalname.split('.').pop() || 'jpg';
    const fileName = `${req.userId}-${Date.now()}.${fileExt}`;
    const filePath = `portfolio/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new AppError('Error al subir imagen', 500);
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('uploads').getPublicUrl(filePath);
    const newImages = [...current, publicUrlData.publicUrl];

    await supabaseAdmin
      .from('profiles')
      .update({ portfolio_images: newImages })
      .eq('id', req.userId!);

    res.json({ images: newImages });
  } catch (err) {
    next(err);
  }
});

router.delete('/portfolio', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const imageUrl = req.body.image_url as string;
    if (!imageUrl) {
      res.status(400).json({ message: 'URL de imagen requerida' });
      return;
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('portfolio_images')
      .eq('id', req.userId!)
      .single();

    const current: string[] = Array.isArray(profile?.portfolio_images) ? profile.portfolio_images : [];
    const updated = current.filter(img => img !== imageUrl);

    // Delete from storage
    try {
      const pathMatch = imageUrl.match(/\/uploads\/(.+)$/);
      if (pathMatch?.[1]) {
        await supabaseAdmin.storage.from('uploads').remove([decodeURIComponent(pathMatch[1])]);
      }
    } catch { /* best effort */ }

    await supabaseAdmin
      .from('profiles')
      .update({ portfolio_images: updated })
      .eq('id', req.userId!);

    res.json({ images: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
