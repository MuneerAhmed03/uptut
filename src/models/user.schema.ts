import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters').optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').optional(),
}).refine(
  (data) => {
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Current password is required when setting a new password",
  }
);

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>; 