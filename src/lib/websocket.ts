import { WebSocketServer } from 'ws';
import { typeDefs } from '../graphql/schema';
import { resolvers } from '../graphql/resolvers';
import { createSchema } from 'graphql-yoga';
import type { Context } from 'graphql-ws';

const wsSchema = createSchema({
  typeDefs,
  resolvers,
});

export function startWebSocketServer() {
  const wsServer = new WebSocketServer({
    port: 4000,
    path: '/graphql'
  });

  const server = {
    schema: wsSchema,
    onConnect: (ctx: Context) => {
      console.log('Client connected');
    },
    onDisconnect: (ctx: Context) => {
      console.log('Client disconnected');
    },
  };

  wsServer.on('connection', (socket) => {
    console.log('Client connected to WebSocket server');
    
    socket.on('message', (message) => {
      console.log('Received message:', message.toString());
    });

    socket.on('close', () => {
      console.log('Client disconnected from WebSocket server');
    });
  });

  console.log('WebSocket Server is running on ws://localhost:4000/graphql');
} 