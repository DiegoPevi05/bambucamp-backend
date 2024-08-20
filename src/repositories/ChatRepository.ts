import { PrismaClient, ChatChannel, ChatMessage } from '@prisma/client';

const prisma = new PrismaClient();

interface Pagination {
  page: number;
  pageSize: number;
}

export const createChannel = async(id: string): Promise<ChatChannel> => {
  return prisma.chatChannel.create({
    data: { id },
  });
}



export const getChannel = async(id: string): Promise<ChatChannel | null> => {
  return prisma.chatChannel.findUnique({
    where: { id },
    include: { messages: true }, // Include messages if needed
  });
}

export const createMessage = async(channelId: string, userId: string, user_type:string, userName:string, message: string): Promise<ChatMessage> => {
  return prisma.chatMessage.create({
    data: {
      user:userId,
      message,
      user_type,
      username:userName,
      channel: { connect: { id: channelId } },
    },
  });
}

export const getMessages = async(channelId: string): Promise<ChatMessage[]> => {
  return prisma.chatMessage.findMany({
    where: { channelId },
    orderBy: { timestamp: 'asc' },
  });
}

export const updateChannel = async(channelId: string, lastActive: Date): Promise<ChatChannel> => {
  return prisma.chatChannel.update({
    where: { id: channelId },
    data: { lastActive },
  });
}

export const deleteChannel = async(channelId: string): Promise<ChatChannel> => {
  return prisma.chatChannel.delete({
    where: { id: channelId },
  });
}

interface Pagination {
  page: number;
  pageSize: number;
}

export const getChannels = async(pagination:Pagination):Promise<{ id:string, lastMessage:string, lastActive:Date }[]> => {
    
    const { page, pageSize } = pagination;

    const channels = await prisma.chatChannel.findMany({
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    const chatList = channels.map(channel => ({
      id: channel.id,
      lastMessage: channel.messages[0]?.message || 'No messages yet',
      lastActive: channel.lastActive,
    }));

    return chatList;
}
