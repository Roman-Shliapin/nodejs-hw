import express from "express";
import cors from "cors";
import pino from "pino-http";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cors());
app.use(
  pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat: '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
        hideObject: true,
      },
    },
  }),
);

// Маршрут отримання всіх нотаток
app.get("/notes", (req, res) => {
  res.status(200).json({ message: "Retrieved all notes" });
});
// Динамічний маршрут для отримання нотатки за ID
app.get("/notes/:noteId", (req, res) => {
  const { noteId } = req.params;
  res.status(200).json({ message: `Retrieved note with ID: ${noteId}` });
});
// Тестовий маршрут для симуляції помилки
app.get("/test-error", () => {
  throw new Error('Simulated server error');
});



// Middleware неіснуючих запитів
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
// Middleware обробки помилок
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
