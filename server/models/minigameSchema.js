// models/minigameSchema.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const MinigameSchema = new Schema({
  minigameId: {
    type: String,
    required: true,
    unique: true,
    enum: ["M1", "M2", "M3", "M4", "M5", "M6", "M7"],
  },
  timer: {
    type: Number, // store timer in seconds
    default: 300, // 5 minutes
    required: true,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  tries: {
    type: Number,
    default: function() {
      // Only M4, M5, M6 have tries
      if (["M4", "M5", "M6"].includes(this.minigameId)) return 3;
      return null;
    },
    min: 0,
    max: 3,
    required: function() {
      return ["M4", "M5", "M6"].includes(this.minigameId);
    },
  },
});

export default mongoose.model("Minigame", MinigameSchema);
