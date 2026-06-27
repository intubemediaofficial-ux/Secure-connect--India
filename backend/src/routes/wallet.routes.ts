import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new WalletController();

router.get('/balance', authenticate, controller.getBalance);
router.get('/transactions', authenticate, controller.getTransactions);
router.post('/recharge/create-order', authenticate, controller.createRechargeOrder);
router.post('/recharge/verify', authenticate, controller.verifyRecharge);
router.get('/expert/balance', authenticate, controller.getExpertBalance);
router.get('/expert/earnings', authenticate, controller.getExpertEarnings);
router.post('/expert/withdraw', authenticate, controller.requestWithdrawal);

export { router as walletRoutes };
