function initializeSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`[SOCKET.IO] Client connected: ${socket.id}`);

    socket.on("join-emergency-services", () => {
      socket.join("emergency-services");
      console.log(
        `[SOCKET.IO] Client ${socket.id} joined emergency-services room`
      );
    });

    socket.on("emergency-ping", (dictLocationData) => {
      console.log(
        `[SOCKET.IO] DEBUG: emergency-ping handler entered by ${socket.id}`
      );

      io.to("emergency-services").emit("emergency-alert", {
        strReporterId: socket.id,
        dblLatitude: dictLocationData.dblLatitude,
        dblLongitude: dictLocationData.dblLongitude,
      });

      console.log(
        `[SOCKET.IO] Emergency alert broadcast to emergency-services room`
      );
    });

    socket.on("disconnect", () => {
      console.log(`[SOCKET.IO] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initializeSocketHandlers };
