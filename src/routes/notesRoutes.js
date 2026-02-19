import { Router } from "express";
import { getNoteById, getAllNotes, createNote, deleteNote, updateNote } from "../controllers/notesController.js";

const router = Router();

// Маршрут отримання всіх нотаток
router.get("/notes", getAllNotes);

// Динамічний маршрут для отримання нотатки за ID
router.get("/notes/:noteId", getNoteById);

// Маршрут створення нової нотатки
router.post("/notes", createNote);

// Маршрут видалення нотатки
router.delete("/notes/:noteId", deleteNote);

// Маршрут оновлення нотатки
router.patch("/notes/:noteId", updateNote);




export default router;
