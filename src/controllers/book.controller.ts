import { Request, Response, NextFunction } from "express";
import { BookService } from "../services/book.service";
import {
  createBookSchema,
  updateBookSchema,
  searchBooksSchema,
  deleteBookSchema,
} from "../models/book.schema";

const bookService = new BookService();

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createBookSchema.parse(req.body);
    const book = await bookService.createBook(validatedData);

    res.status(201).json({
      status: "success",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const validatedData = updateBookSchema.parse(req.body);
    const book = await bookService.updateBook(id, validatedData);

    res.json({
      status: "success",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = deleteBookSchema.parse(req.params);
    await bookService.deleteBook(validatedData.isbn);

    res.json({
      status: "success",
      message: "Book deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const searchBooks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = searchBooksSchema.parse(req.query);
    const result = await bookService.findBooks({
      search: validatedData.query,
      categoryIds: validatedData.category
        ? [validatedData.category]
        : undefined,
      authorIds: validatedData.author ? [validatedData.author] : undefined,
      available: validatedData.available,
      skip: (validatedData.page - 1) * validatedData.limit,
      take: validatedData.limit,
    });

    res.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { isbn } = req.params;
    const book = await bookService.findBookById(isbn);

    if (!book) {
      return res.status(404).json({
        status: "error",
        message: "Book not found",
      });
    }

    res.json({
      status: "success",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};
