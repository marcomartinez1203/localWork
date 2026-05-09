// ============================================
// LocalWork — Chat Controller
// ============================================
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { ChatService } from '../services/chat.service';
import { AppError } from '../middleware/error.middleware';

export class ChatController {
  static async startConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applicationId = req.body.application_id;
      if (!applicationId) {
        throw new AppError('application_id es requerido', 400);
      }
      const result = await ChatService.startConversation(req.userId!, req.userRole, applicationId);
      res.status(result.created ? 201 : 200).json(result);
    } catch (err) { next(err); }
  }

  static async listConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ChatService.listConversations(req.userId!);
      res.json({ data });
    } catch (err) { next(err); }
  }

  static async createDirectRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const targetUserId = req.body.target_user_id;
      if (!targetUserId) throw new AppError('target_user_id es requerido', 400);
      const result = await ChatService.createDirectRequest(req.userId!, targetUserId);
      res.status(201).json(result);
    } catch (err) { next(err); }
  }

  static async listIncomingRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ChatService.listIncomingRequests(req.userId!);
      res.json({ data });
    } catch (err) { next(err); }
  }

  static async respondDirectRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const action = req.body.action;
      if (action !== 'accepted' && action !== 'rejected') {
        throw new AppError('action debe ser accepted o rejected', 400);
      }
      const result = await ChatService.respondDirectRequest(req.params.requestId, req.userId!, action);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async getRequestStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ChatService.getRequestStatus(req.userId!, req.params.targetUserId);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = Math.min(parseInt(req.query.per_page as string, 10) || 50, 100);
      const result = await ChatService.getMessages(req.params.conversationId, req.userId!, page, perPage);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const message = await ChatService.sendMessage(
        req.params.conversationId,
        req.userId!,
        {
          content: req.body.content,
          attachment_url: req.body.attachment_url,
          attachment_name: req.body.attachment_name,
          attachment_type: req.body.attachment_type,
        }
      );
      res.status(201).json(message);
    } catch (err) { next(err); }
  }

  static async markConversationAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const count = await ChatService.markConversationAsRead(req.params.conversationId, req.userId!);
      res.json({ updated: count });
    } catch (err) { next(err); }
  }

  static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const count = await ChatService.getUnreadCount(req.userId!);
      res.json({ count });
    } catch (err) { next(err); }
  }

  static async uploadAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('Debes adjuntar un archivo', 400);
      }
      const data = await ChatService.uploadAttachment(req.file, req.userId!);
      res.status(201).json(data);
    } catch (err) { next(err); }
  }
}
