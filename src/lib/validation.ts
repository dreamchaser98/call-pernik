import { z } from 'zod';

export const signalCreateSchema = z.object({
  categoryId: z.string().min(1, 'Моля, изберете категория'),
  typeId: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().optional().default(''),
  settlement: z.string().optional().default(''),
  district: z.string().optional().default(''),
  street: z.string().optional().default(''),
  streetNum: z.string().optional().default(''),
  block: z.string().optional().default(''),
  entrance: z.string().optional().default(''),
  floor: z.string().optional().default(''),
  apartment: z.string().optional().default(''),
  shortDesc: z.string().min(5, 'Краткото описание трябва да е поне 5 символа').max(200),
  fullDesc: z.string().optional().default(''),
  senderName: z.string().min(2, 'Моля, въведете вашето име'),
  senderEmail: z.string().email('Невалиден имейл адрес').optional().or(z.literal('')),
  senderPhone: z.string().optional().default(''),
  gdprConsent: z.literal(true, {
    errorMap: () => ({ message: 'Трябва да се съгласите с обработката на лични данни' }),
  }),
});

export type SignalCreateInput = z.infer<typeof signalCreateSchema>;
