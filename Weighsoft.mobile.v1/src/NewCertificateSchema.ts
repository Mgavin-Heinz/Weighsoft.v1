/**
 * NewCertificateSchema.ts
 *
 * Zod validation schema for the New Certificate form (Step 1).
 * Extracted into its own file so it can be imported by both
 * NewCertificateForm.tsx and schema.test.ts without pulling in
 * React Native components.
 */

import { z } from 'zod';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const NewCertificateStep1Schema = z.object({
  ticketNo: z
    .string()
    .max(50, 'Ticket number cannot exceed 50 characters')
    .nullable()
    .optional(),

  effectiveDate: z
    .string({ required_error: 'Effective date is required' })
    .regex(DATE_REGEX, 'Date must be in YYYY-MM-DD format (e.g. 2024-06-01)'),

  productId: z
    .string({ required_error: 'Please select a product' })
    .min(1, 'Please select a product'),

  haulierId: z
    .string({ required_error: 'Please select a haulier' })
    .min(1, 'Please select a haulier'),

  vehicleReg: z
    .string()
    .max(20, 'Vehicle registration cannot exceed 20 characters')
    .optional()
    .or(z.literal('')),

  contractId: z.string().nullable().optional(),

  templateId: z
    .string({ required_error: 'Please select a certificate template' })
    .min(1, 'Please select a certificate template'),

  certificateTitle: z
    .string()
    .max(100, 'Title cannot exceed 100 characters')
    .default('Weighing Certificate'),

  notes: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
});

export type NewCertificateStep1Values = z.infer<typeof NewCertificateStep1Schema>;
