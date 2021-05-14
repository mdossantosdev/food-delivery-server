import { Schema, Document, model } from 'mongoose';

interface ICategoryModel extends Document {
  id: number;
  title: string;
  images: string[];
}

const categorySchema = new Schema(
  {
    id: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    images: {
      type: [String]
    }
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      }
    },
    timestamps: true
  }
);

export const Category = model<ICategoryModel>('Offer', categorySchema);
