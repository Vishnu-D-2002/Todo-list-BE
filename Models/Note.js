const { default: mongoose } = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    userId: String,
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;