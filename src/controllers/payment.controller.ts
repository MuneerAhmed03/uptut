import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PaymentService } from '../services/payment.service';

const paymentSchema = z.object({
  transactionId: z.string().uuid(),
  paymentMethod: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'CASH']),
});

const paymentService = new PaymentService();

export const getFines = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const result = await paymentService.getFines(userId);

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const payFine = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = paymentSchema.parse(req.body);
    const userId = req.user!.id;

    const result = await paymentService.payFine(
      userId,
      validatedData.transactionId,
      validatedData.paymentMethod
    );

    res.json({
      status: 'success',
      message: 'Fine paid successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const status = req.query.status as string | undefined;

    const result = await paymentService.getPaymentHistory(userId, status);

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const generateInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user!.id;

    const invoice = await paymentService.generateInvoice(userId, transactionId);

    res.json({
      status: 'success',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}; 