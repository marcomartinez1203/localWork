// ============================================
// LocalWork — Applications Routes
// ============================================
import { Router } from 'express';
import multer from 'multer';
import { ApplicationsController } from '../controllers/applications.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF o Word (.pdf, .doc, .docx)'));
    }
  },
});

router.post('/',                   authenticate, requireRole('seeker'),   resumeUpload.single('resume'), ApplicationsController.apply);
router.get('/mine',                authenticate, requireRole('seeker'),   ApplicationsController.getMyApplications);
router.get('/job/:jobId',          authenticate, requireRole('employer'), ApplicationsController.getForJob);
router.patch('/:id/status',        authenticate, requireRole('employer'), ApplicationsController.updateStatus);
router.delete('/:id',             authenticate, requireRole('seeker'),   ApplicationsController.withdraw);

export default router;
