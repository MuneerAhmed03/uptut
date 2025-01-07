import { CronJob } from 'cron';
import { BorrowService } from './borrow.service';
import { logger } from '../utils/logger';

export class SchedulerService {
  private borrowService: BorrowService;
  private reminderJob: CronJob;

  constructor() {
    this.borrowService = new BorrowService();
    
    this.reminderJob = new CronJob('0 0 * * *', async () => {
      try {
        const remindersSent = await this.borrowService.sendDueReminders();
        logger.info(`Sent ${remindersSent} due date reminders`);
      } catch (error) {
        logger.error('Error sending due date reminders:', error);
      }
    });
  }

  startJobs() {
    this.reminderJob.start();
    logger.info('Scheduler jobs started');
  }

  stopJobs() {
    this.reminderJob.stop();
    logger.info('Scheduler jobs stopped');
  }
} 