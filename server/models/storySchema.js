// src/models/story.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const StorySchema = new Schema({
  storyID: { type: String, required: true, unique: true },
  text: { type: [String], required: true },
  backgroundImg: { type: String},
  backgroundMusic: { type: String},
  nextID: { type: [String], required: true },
  levelEnd: { type: Boolean, required: true },
  choice: { type: [String]}
});

export default mongoose.model("Story", StorySchema);