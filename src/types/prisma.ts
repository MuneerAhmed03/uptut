import type { PrismaClient } from '.prisma/client';

export type { PrismaClient };

export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>; 