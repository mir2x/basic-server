import { Socket, Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "@shared/logger";
import { Decoded, decodeToken } from "@utils/jwt";
import { HttpError } from "http-errors";

const onlineUsers = new Map<string, string>();
let io: SocketIOServer;

const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    console.log(token);
    if (!token) {
      return next(new Error("Unauthorized"));
    }
    let decoded: Decoded;
    try {
      decoded = decodeToken("accessxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", token);
      socket.userId = decoded.id;
    } catch (e: any) {
      return next(e);
    }
    next();
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.userId;
    logger.info(`⚡ User connected: ${userId}`);
    onlineUsers.set(userId, socket.id);

    socket.on("disconnect", () => {
      onlineUsers.forEach((value: string, key: string) => {
        if (value == socket.id) {
          onlineUsers.delete(key);
          logger.info(`❌ User ${key} went offline`);
        }
      });
    });
  });
};

export { initializeSocket as default, io, onlineUsers };
