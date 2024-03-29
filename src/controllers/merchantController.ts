import { Request, Response } from 'express';
import { Merchant, Food, Order, Offer } from '../models';
import { validatePassword, generateToken } from '../helpers';
import {
  IMerchantLoginInput,
  IEditMerchantInput,
  ICreateFoodItemInput,
  ICreateOfferInput
} from '../interfaces';

export const merchantLogin = async (req: Request, res: Response) => {
  try {
    const { email, password }: IMerchantLoginInput = req.body;

    const merchant = await Merchant.findOne({ email }).select('+password');

    if (!merchant) return res.status(401).json({ message: 'Incorrect email or password' });

    const isMatch = await validatePassword(password, merchant.password);

    if (!isMatch) return res.status(401).json({ message: 'Incorrect email or password' });

    const payload = {
      _id: merchant._id,
      email: merchant.email,
      name: merchant.name
    };

    const token = generateToken(payload);

    return res.status(200).json({ token });
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

export const getMerchantProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const merchant = await Merchant.findById(user?._id);

    return res.status(200).json(merchant);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

export const updateMerchantProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { name, foodType, address, phone }: IEditMerchantInput = req.body;

    const merchantField = {} as IEditMerchantInput;

    if (name) merchantField.name = name;
    if (foodType) merchantField.foodType = foodType;
    if (address) merchantField.address = address;
    if (phone) merchantField.phone = phone;

    const updateMerchant = await Merchant.findByIdAndUpdate(
      user?._id,
      { $set: merchantField },
      { new: true, upsert: true }
    );

    return res.status(200).json(updateMerchant);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

export const updateMerchantCoverImage = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const merchant = await Merchant.findById(user?._id);

    if (!merchant) return res.status(400).json({ message: 'Unable to update merchant profile!' });

    const files = req.files as Express.Multer.File[];
    const images = files.map((file: Express.Multer.File) => {
      return `${req.protocol}://${req.get('host')}/images/${file.filename}`;
    });

    merchant.images.push(...images);

    const saveResult = await merchant.save();

    return res.status(200).json(saveResult);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

export const updateMerchantService = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { latitude, longitude } = req.body;

    const merchant = await Merchant.findById(user?._id);

    if (!merchant) return res.status(400).json({ message: 'Unable to update merchant profile!' });

    merchant.serviceAvailable = !merchant.serviceAvailable;

    if (latitude && longitude) {
      merchant.latitude = latitude;
      merchant.longitude = longitude;
    }

    const saveResult = await merchant.save();

    return res.status(200).json(saveResult);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

export const addFoodItem = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { name, description, category, foodType, readyTime, price }: ICreateFoodItemInput = req.body;

    const merchant = await Merchant.findById(user?._id);

    if (!merchant) return res.status(400).json({ message: 'Unable to update merchant profile!'});

    const files = req.files as [Express.Multer.File];
    const images = files.map((file: Express.Multer.File) => {
      return `${req.protocol}://${req.get('host')}/images/${file.filename}`;
    });

    const foodItem = await Food.create({
      merchantId: merchant._id,
      name,
      description,
      category,
      foodType,
      readyTime,
      price,
      rating: 0,
      images
    });

    merchant.foods.push(foodItem);

    const merchantProfile = await merchant.save();

    return res.status(201).json(merchantProfile);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

export const getFoods = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const foods = await Food.find({ merchantId: user?._id });

    if (foods.length === 0) return res.status(404).json({ message: 'Foods not found!' });

    return res.status(200).json(foods);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const orders = await Order.find({ merchantId: user?._id }).populate('items.food');

    if (!orders) return res.status(404).json({ message: 'Orders not found' });

    return res.status(200).json(orders);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate('items.food');

    if (!order) return res.status(404).json({ message: 'Order not found!' });

    return res.status(200).json(order);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

export const processOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status, remarks, time } = req.body;

    if (!orderId) return res.status(404).json({ message: 'Unable to process order!' });

    const order = await Order.findById(orderId).populate('food');

    if (!order) return res.status(404).json({ message: 'Order not found!' });

    order.orderStatus = status;
    order.remarks = remarks;
    if (time) order.readyTime = time;

    const orderResult = await order.save();

    return res.status(200).json(orderResult);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

export const addOffer = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const {
      offerType,
      title,
      description,
      minValue,
      offerAmount,
      offerPercentage,
      startValidity,
      endValidity,
      promoCode,
      promoType,
      bank,
      postalCode,
      isActive
    }: ICreateOfferInput = req.body;

    const merchant = await Merchant.findById(user?._id);

    if (!merchant) return res.status(404).json({ message: 'Merchant does not exist!' });

    const files = req.files as Express.Multer.File[];
    const images = files.map((file: Express.Multer.File) => {
      return `${req.protocol}://${req.get('host')}/images/${file.filename}`;
    });

    const offer = await Offer.create({
      merchants: [merchant],
      offerType,
      title,
      description,
      images,
      minValue,
      offerAmount,
      offerPercentage,
      startValidity,
      endValidity,
      promoCode,
      promoType,
      bank,
      postalCode,
      isActive
    });

    return res.status(201).json(offer);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

export const getOffers = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const offers = await Offer.find().populate('merchants');

    if (offers.length === 0) return res.status(404).json({ message: 'Offers not available!' });

    let currentOffer = Array();

    offers.map(item => {
      if (item.merchants) {
        item.merchants.map(merchant => {
          if (String(merchant._id) === user?._id) currentOffer.push(item);
        })
      }

      if (item.offerType === 'GENERIC') currentOffer.push(item);
    })

    return res.status(200).json(currentOffer);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

export const editOffer = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const offerId = req.params.id;

    if (!offerId) return res.status(404).json({ message: 'Offer not founds!' });

    const {
      offerType,
      title,
      description,
      minValue,
      offerAmount,
      offerPercentage,
      startValidity,
      endValidity,
      promoCode,
      promoType,
      bank,
      postalCode,
      isActive
    }: ICreateOfferInput = req.body;

    const currentOffer = await Offer.findById(offerId);

    if (!currentOffer) return res.status(404).json({ message: 'Offer not founds!' });

    const merchant = await Merchant.findById(user?._id);

    if (!merchant) return res.status(404).json({ message: 'Merchant does not exist!' });

    currentOffer.offerType = offerType;
    currentOffer.title = title;
    currentOffer.description = description;
    currentOffer.minValue = minValue;
    currentOffer.offerAmount = offerAmount;
    currentOffer.offerPercentage = offerPercentage;
    currentOffer.startValidity = startValidity;
    currentOffer.endValidity = endValidity;
    currentOffer.promoCode = promoCode;
    currentOffer.promoType = promoType;
    currentOffer.bank = bank;
    currentOffer.postalCode = postalCode;
    currentOffer.isActive = isActive;

    const result = await currentOffer.save()

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return res.status(500).send('Server Error');
  }
};
