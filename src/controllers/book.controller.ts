import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/book.service';
import { z } from 'zod';

const bookService = new BookService();

const bookSchema = z.object({
  isbn: z.string().min(10, 'ISBN must be at least 10 characters'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  totalCopies: z.number().int().positive(),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  authorIds: z.array(z.string()).min(1, 'At least one author is required'),
});

const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  available: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
});

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = bookSchema.parse(req.body);
    const book = await bookService.createBook(validatedData);

    res.status(201).json({
      status: 'success',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = bookSchema.partial().parse(req.body);
    const book = await bookService.updateBook(id, validatedData);

    res.json({
      status: 'success',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await bookService.deleteBook(id);

    res.json({
      status: 'success',
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const searchBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = searchSchema.parse(req.query);
    const result = await bookService.findBooks({
      search: validatedData.query,
      categoryIds: validatedData.category ? [validatedData.category] : undefined,
      authorIds: validatedData.author ? [validatedData.author] : undefined,
      available: validatedData.available,
      skip: (validatedData.page - 1) * validatedData.limit,
      take: validatedData.limit,
    });

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const book = await bookService.findBookById(id);

    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found',
      });
    }

    res.json({
      status: 'success',
      data: book,
    });
  } catch (error) {
    next(error);
  }
}; 