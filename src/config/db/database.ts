import { PrismaClient } from '.prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

class Database {
  private static instance: Database;
  private _prisma: PrismaClient;

  private constructor() {
    this._prisma = globalThis.prisma || new PrismaClient({
      log: ['query', 'error', 'warn'],
    });

    if (process.env.NODE_ENV === 'development') {
      globalThis.prisma = this._prisma;
    }
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  get prisma(): PrismaClient {
    return this._prisma;
  }

  async connect(): Promise<void> {
    try {
      await this._prisma.$connect();
      console.log('📦 Database connected successfully');
    } catch (error) {
      console.error('Database connection error:', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    await this._prisma.$disconnect();
    console.log('📦 Database disconnected successfully');
  }
}

export const db = Database.getInstance();
export const prisma = db.prisma; 