import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

interface NotificationUpdate {
  notificationId: string;
  productId: string;
  channel: string;
  status: string;
  destination: string;
  correlationId: string;
  timestamp: string;
}

interface MetricsUpdate {
  productId?: string;
  channel?: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
  correlationId: string;
  timestamp: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribeProduct: (productId: string) => void;
  unsubscribeProduct: (productId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  subscribeProduct: () => {},
  unsubscribeProduct: () => {},
});

export function useSocket() {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3002';
    const correlationId = uuidv4();

    const newSocket = io(wsUrl, {
      extraHeaders: {
        'x-correlation-id': correlationId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });

    newSocket.on('connect', () => {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        service: 'dashboard-ui',
        context: 'SocketProvider',
        correlationId,
        message: 'WebSocket connected',
      }));
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        service: 'dashboard-ui',
        context: 'SocketProvider',
        correlationId,
        message: 'WebSocket disconnected',
      }));
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        service: 'dashboard-ui',
        context: 'SocketProvider',
        correlationId,
        message: 'WebSocket connection error',
        error: error.message,
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const subscribeProduct = useCallback((productId: string) => {
    if (socket) {
      const correlationId = uuidv4();
      socket.emit('subscribe:product', { productId, correlationId });
    }
  }, [socket]);

  const unsubscribeProduct = useCallback((productId: string) => {
    if (socket) {
      const correlationId = uuidv4();
      socket.emit('unsubscribe:product', { productId, correlationId });
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, subscribeProduct, unsubscribeProduct }}>
      {children}
    </SocketContext.Provider>
  );
}

export type { NotificationUpdate, MetricsUpdate };
