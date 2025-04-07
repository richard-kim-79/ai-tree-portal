import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer | null = null;

export function initSocketServer(server: HttpServer) {
  if (!io) {
    io = new SocketServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('클라이언트 연결됨:', socket.id);

      socket.on('subscribe_post', (postId) => {
        socket.join(`post:${postId}`);
      });

      socket.on('unsubscribe_post', (postId) => {
        socket.leave(`post:${postId}`);
      });

      socket.on('disconnect', () => {
        console.log('클라이언트 연결 해제됨:', socket.id);
      });
    });
  }
  return io;
}

export function getSocketServer() {
  return io;
}

export function emitPostUpdate(postId: string, data: any) {
  if (io) {
    io.to(`post:${postId}`).emit('post_updated', data);
  }
}

export function emitPostCreated(data: any) {
  if (io) {
    io.emit('post_created', data);
  }
}

export function emitPostDeleted(postId: string) {
  if (io) {
    io.emit('post_deleted', postId);
  }
}

export function emitCommitCreated(data: any) {
  if (io) {
    io.emit('commit_created', data);
  }
} 