import { Schema, model, Types } from "mongoose";

const questionSchema = new Schema(
  {
    course: {
      type: Types.ObjectId,
      ref: "Course",
      reuired: true,
    },
    chapter: {
      type: Types.ObjectId,
      ref: "Chapter",
      reuired: true,
    },
    curriculum: {
      type: Types.ObjectId,
      ref: "Curriculum",
      reuired: true,
    },
    quiz: {
      type: Types.ObjectId,
      ref: "Quiz",
      reuired: true,
    },
    order: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "mcq", "file"],
      required: true,
    },
    text: String,
    imageUrl: {
      type: String,
    },
    imageBlobName: {
      type: String,
    },
    multiple: Boolean,

    optionsNumber: { Number },
    sorted: { type: Boolean, required: true },
  },

  { timestamps: true }
);

const questionModel = model("Question", questionSchema);
export default questionModel;
