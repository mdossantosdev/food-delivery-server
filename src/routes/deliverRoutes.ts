import express, { Request, Response } from 'express';
import { deliverRegister, deliverLogin } from '../controllers/deliverController'

const router = express.Router();

router.post('/register', deliverRegister);
router.post('/login', deliverLogin);

router.get('/', (req: Request, res: Response) => {
  return res.json({ message: 'Hello from Deliver' });
});

export default router;