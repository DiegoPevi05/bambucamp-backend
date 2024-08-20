import { Server as SocketIOServer, Socket } from 'socket.io';
import { createChannel, createMessage, getChannel, updateChannel, deleteChannel } from '../repositories/ChatRepository';

export default function chatHandler(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    let currentChannel: string;

    socket.on('joinChannel', async (channelId: string) => {
      currentChannel = channelId;

      let channel = await getChannel(currentChannel);
      if (!channel) {
        channel = await createChannel(currentChannel);
      }
      socket.join(currentChannel);
    });

    socket.on('sendMessage', async (message: string) => {
      if (currentChannel) {
        const chatMessage = await createMessage(currentChannel, socket.id, message);
        await updateChannel(currentChannel, new Date()); // Update last active timestamp
        io.to(currentChannel).emit('receiveMessage', chatMessage);
      }
    });

    socket.on('disconnect', async () => {
      if (currentChannel) {
        const channel = await getChannel(currentChannel);
        if (channel && new Date().getTime() - channel.lastActive.getTime() > 3600000) {
          await deleteChannel(currentChannel);
        }
      }
    });
  });
}
