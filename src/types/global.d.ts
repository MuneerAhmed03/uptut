declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASS: string;
      REDIS_URL: string;
      PORT: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }

  interface RateLimitMap extends Map<string, { count: number; resetTime: number }> {}

  var rateLimitMap: RateLimitMap;
} 