import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt ,{ JwtPayload } from 'jsonwebtoken';
import { User } from '@prisma/client';
import * as userRepository from "../repositories/userRepository";
import * as chatRepository from '../repositories/ChatRepository';

interface Pagination {
  page: number;
  pageSize: number;
}

export const getChats = async (pagination:Pagination) => {
  return await chatRepository.getChannels(pagination)
}

export const getMessages = async(channelId:string) => {
  return await chatRepository.getMessages(channelId);
}

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const chatHandler = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    let currentChannel: string;
    let currentUserId: string | null = null;
    let currentUserName: string | null = null;

    // Capture user token when they connect
    socket.on('authenticate', async (token: string) => {
      try {
        const payload = jwt.verify(token,JWT_SECRET) as JwtPayload;
        const user: User | null = await userRepository.getUserById(payload.userId);
        if (user){
          currentUserId = user.id.toString(); // Capture authenticated user ID
          currentUserName = user.firstName;
        };
      } catch (err) {
        console.error('Invalid token', err);
      }
    });

    socket.on('joinChannel', async (channelId: string) => {
      currentChannel = channelId;

      let channel = await chatRepository.getChannel(currentChannel.toString());
      if (!channel) {
        channel = await chatRepository.createChannel(currentChannel);
        io.emit('newChatMessage', channel);
      }
      socket.join(currentChannel);
    });

    socket.on('sendMessage', async (message: string) => {
      if (currentChannel) {
        const senderId = currentUserId || socket.id;
        const user_type = currentUserId ?  "authenticated" : "external";
        const userName = currentUserName != null ? currentUserName : "user";
        const chatMessage = await chatRepository.createMessage(currentChannel, senderId, user_type, userName ,message);
        await chatRepository. updateChannel(currentChannel, new Date()); // Update last active timestamp
        io.to(currentChannel).emit('receiveMessage', chatMessage);
      }
    });

    socket.on('disconnect', async () => {
      if (currentChannel) {
        const channel = await chatRepository.getChannel(currentChannel);
        if (channel && new Date().getTime() - channel.lastActive.getTime() > 3600000) {
          await chatRepository.deleteChannel(currentChannel);
        }
      }
    });
  });
}
