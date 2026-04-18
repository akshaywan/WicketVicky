const REALTIME_URL = import.meta.env.VITE_REALTIME_URL ?? 'ws://localhost:8000/ws';

export function createRealtimeClient(onMessage) {
  const socket = new WebSocket(REALTIME_URL);

  socket.addEventListener('message', (event) => {
    try {
      onMessage(JSON.parse(event.data));
    } catch {
      onMessage(event.data);
    }
  });

  return socket;
}
