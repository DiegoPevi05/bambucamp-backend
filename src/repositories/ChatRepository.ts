import { PrismaClient, ChatChannel, ChatMessage } from '@prisma/client';

const prisma = new PrismaClient();

interface Pagination {
  page: number;
  pageSize: number;
}

export async function createChannel(id: string): Promise<ChatChannel> {
  return prisma.chatChannel.create({
    data: { id },
  });
}


export async function getChannel(id: string): Promise<ChatChannel | null> {
  return prisma.chatChannel.findUnique({
    where: { id },
    include: { messages: true }, // Include messages if needed
  });
}

export async function createMessage(channelId: string, user: string, message: string): Promise<ChatMessage> {
  return prisma.chatMessage.create({
    data: {
      user,
      message,
      channel: { connect: { id: channelId } },
    },
  });
}

export async function getMessages(channelId: string): Promise<ChatMessage[]> {
  return prisma.chatMessage.findMany({
    where: { channelId },
    orderBy: { timestamp: 'asc' },
  });
}

export async function updateChannel(channelId: string, lastActive: Date): Promise<ChatChannel> {
  return prisma.chatChannel.update({
    where: { id: channelId },
    data: { lastActive },
  });
}

export async function deleteChannel(channelId: string): Promise<ChatChannel> {
  return prisma.chatChannel.delete({
    where: { id: channelId },
  });
}
