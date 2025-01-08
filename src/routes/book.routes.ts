import { Router } from 'express';
import {
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  getBookDetails,
} from '../controllers/book.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

router.get('/search', cacheMiddleware(300), searchBooks);
router.get('/:isbn', cacheMiddleware(3600), getBookDetails);

router.use(authenticate);
router.post('/', authorize('ADMIN'), createBook);
router.put('/:isbn', authorize('ADMIN'), updateBook);
router.delete('/:isbn', authorize('ADMIN'), deleteBook);

export default router; 