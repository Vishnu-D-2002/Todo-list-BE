const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { MongoDB_URL, PORT } = require("./utils");
const Note = require("./Models/Note");
const userRouter = require("./Routes/userRoute");

const app = express();

mongoose.set("strictQuery", false);

app.use(cors());
app.use(express.json());

console.log("Connecting to MongoDB...");

mongoose.connect(MongoDB_URL).then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server is running in http://localhost:${PORT}`);
  });
});

app.use("/", userRouter);

app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/notes", async (req, res) => {
  const note = new Note({
    title: req.body.title,
    description: req.body.description,
    userId:req.body.userId
  });
  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedNote = await Note.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedNote = await Note.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Note.findByIdAndDelete(id);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/notes/user/:userId", async (req, res) => {
  try {
    const notes = await Note.find({userId: req.params.userId});
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});