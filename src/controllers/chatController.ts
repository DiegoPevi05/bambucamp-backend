import { Request, Response } from 'express';
import * as chatService from '../services/chatService';
import {CustomError} from '../middleware/errors';

export const getMessages = async(req: Request, res: Response) => {
  try {
    const messages =  await chatService.getMessages(req.params.id);
    res.json(messages)
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchMessages") });
    }
  }
}

export const getAllWebChats = async (req: Request, res: Response) => {
  try {
    const { page = '1', pageSize = '10' } = req.query;

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const chats = await chatService.getChats(pagination);
    res.json(chats);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchChats") });
    }
  }
};
