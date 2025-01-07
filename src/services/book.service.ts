import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export interface CreateBookInput {
  isbn: string;
  title: string;
  description?: string;
  totalCopies: number;
  categoryIds: string[];
  authorIds: string[];
}

export interface UpdateBookInput extends Partial<CreateBookInput> {}

export interface SearchBooksInput {
  query?: string;
  category?: string;
  author?: string;
  available?: boolean;
  page: number;
  limit: number;
}

export class BookService {
  async createBook(data: CreateBookInput) {
    const existingBook = await prisma.book.findUnique({
      where: { isbn: data.isbn },
    });

    if (existingBook) {
      throw new AppError(409, 'Book with this ISBN already exists');
    }

    return prisma.book.create({
      data: {
        isbn: data.isbn,
        title: data.title,
        description: data.description,
        totalCopies: data.totalCopies,
        availableCopies: data.totalCopies,
        categories: {
          create: data.categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
        authors: {
          create: data.authorIds.map((authorId) => ({
            author: { connect: { id: authorId } },
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        authors: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  async updateBook(id: string, data: UpdateBookInput) {
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    return prisma.book.update({
      where: { id },
      data: {
        isbn: data.isbn,
        title: data.title,
        description: data.description,
        totalCopies: data.totalCopies,
        ...(data.totalCopies && {
          availableCopies: data.totalCopies - (book.totalCopies - book.availableCopies),
        }),
        ...(data.categoryIds && {
          categories: {
            deleteMany: {},
            create: data.categoryIds.map((categoryId) => ({
              category: { connect: { id: categoryId } },
            })),
          },
        }),
        ...(data.authorIds && {
          authors: {
            deleteMany: {},
            create: data.authorIds.map((authorId) => ({
              author: { connect: { id: authorId } },
            })),
          },
        }),
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        authors: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  async deleteBook(id: string) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        borrowedBooks: {
          where: {
            returnedAt: null,
          },
        },
      },
    });

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    if (book.borrowedBooks.length > 0) {
      throw new AppError(400, 'Cannot delete book while copies are borrowed');
    }

    return prisma.book.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async searchBooks(params: SearchBooksInput) {
    const { query, category, author, available, page, limit } = params;
    const skip = (page - 1) * limit;

    const whereClause = {
      deletedAt: null,
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { isbn: { contains: query } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(category && {
        categories: {
          some: {
            category: {
              name: { equals: category, mode: 'insensitive' },
            },
          },
        },
      }),
      ...(author && {
        authors: {
          some: {
            author: {
              name: { contains: author, mode: 'insensitive' },
            },
          },
        },
      }),
      ...(available && {
        availableCopies: { gt: 0 },
      }),
    };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: whereClause,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          authors: {
            include: {
              author: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.book.count({ where: whereClause }),
    ]);

    return {
      books,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBookDetails(id: string) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        authors: {
          include: {
            author: true,
          },
        },
        borrowedBooks: {
          where: {
            returnedAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    return book;
  }
} 