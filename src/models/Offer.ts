import { Schema, Document, model } from 'mongoose';

interface IOfferModel extends Document {
  offerType: string;
  merchants: any[];
  title: string;
  description: string;
  images: string[];
  minValue: number;
  offerAmount: number;
  offerPercentage: number;
  startValidity: Date;
  endValidity: Date;
  promoCode: string;
  promoType: string;
  bank: any[];
  bins: any[];
  postalCode: string;
  isActive: boolean;
}

const offerSchema = new Schema(
  {
    offerType: {
      type: String,
      required: true
    },
    merchants: [{
      type: Schema.Types.ObjectId,
      ref: 'Merchant'
    }],
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    images: {
      type: [String]
    },
    minValue: {
      type: Number,
      required: true
    },
    offerAmount: {
      type: Number
    },
    offerPercentage: {
      type: Number,
      required: true
    },
    startValidity: {
      type: Date
    },
    endValidity: {
      type: Date
    },
    promoCode: {
      type: String,
      required: true
    },
    promoType: {
      type: String,
      required: true
    },
    bank: [{
      type: String
    }],
    bins: [{
      type: Number
    }],
    postalCode: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean
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

export const Offer = model<IOfferModel>('Offer', offerSchema);
