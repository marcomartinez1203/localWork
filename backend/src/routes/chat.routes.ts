// ============================================
// LocalWork — Chat Routes
// ============================================
import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { ChatController } from '../controllers/chat.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

const attachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const messageIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { message: 'Límite de 100 mensajes por hora alcanzado para esta IP' },
});

router.post('/start', authenticate, requireRole('seeker', 'employer'), ChatController.startConversation);
router.get('/conversations', authenticate, requireRole('seeker', 'employer'), ChatController.listConversations);
router.get('/unread-count', authenticate, requireRole('seeker', 'employer'), ChatController.getUnreadCount);
router.get('/conversations/:conversationId/messages', authenticate, requireRole('seeker', 'employer'), ChatController.getMessages);
router.post('/conversations/:conversationId/messages', authenticate, requireRole('seeker', 'employer'), messageIpLimiter, ChatController.sendMessage);
router.patch('/conversations/:conversationId/read', authenticate, requireRole('seeker', 'employer'), ChatController.markConversationAsRead);
router.post('/attachments', authenticate, requireRole('seeker', 'employer'), attachmentUpload.single('file'), ChatController.uploadAttachment);

export default router;
