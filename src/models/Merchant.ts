import mongoose, { Schema, Document, model } from 'mongoose';

interface IMerchant extends Document {
  name: string;
  foodType?: string[];
  address?: string;
  phone: string;
  email: string;
  password: string;
  owner: string;
  serviceAvailable?: boolean;
  coverImages?: string[];
  rating?: number;
  foods: any;
}

const merchantSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    foodType: {
      type: [String]
    },
    address: {
      type: String
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 10
    },
    owner: {
      type: String,
      required: true
    },
    serviceAvailable: {
      type: Boolean
    },
    coverImages: {
      type: [String]
    },
    rating: {
      type: Number
    },
    foods: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Food'
    }],
  },
  { timestamps: true }
);

export const Merchant = model<IMerchant>('Merchant', merchantSchema);
