// ============================================
// LocalWork — Upload Routes
// ============================================
import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../config/supabase';
import { AuthenticatedRequest } from '../types';
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

export default router;
