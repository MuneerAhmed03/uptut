import { prisma } from '../config/database';
import type { Book, Prisma } from '.prisma/client';

interface CreateBookInput {
  isbn: string;
  title: string;
  description?: string;
  totalCopies: number;
  authorIds: string[];
  categoryIds: string[];
}

interface UpdateBookInput {
  title?: string;
  description?: string;
  totalCopies?: number;
  authorIds?: string[];
  categoryIds?: string[];
}

export class BookService {
  async createBook(data: CreateBookInput): Promise<Book> {
    const existingBook = await prisma.book.findUnique({
      where: { isbn: data.isbn },
    });

    if (existingBook) {
      throw new Error('Book with this ISBN already exists');
    }

    return prisma.book.create({
      data: {
        isbn: data.isbn,
        title: data.title,
        description: data.description,
        totalCopies: data.totalCopies,
        availableCopies: data.totalCopies,
        authors: {
          create: data.authorIds.map((authorId) => ({
            author: {
              connect: { id: authorId },
            },
          })),
        },
        categories: {
          create: data.categoryIds.map((categoryId) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
      },
      include: {
        authors: {
          include: {
            author: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async updateBook(id: string, data: UpdateBookInput): Promise<Book> {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        authors: true,
        categories: true,
      },
    });

    if (!book) {
      throw new Error('Book not found');
    }

    if (data.authorIds) {
      await prisma.authorsOnBooks.deleteMany({
        where: { bookId: id },
      });
    }
    
    if (data.categoryIds) {
      await prisma.categoriesOnBooks.deleteMany({
        where: { bookId: id },
      });
    }

    return prisma.book.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        totalCopies: data.totalCopies,
        availableCopies: data.totalCopies,
        authors: data.authorIds
          ? {
              create: data.authorIds.map((authorId) => ({
                author: {
                  connect: { id: authorId },
                },
              })),
            }
          : undefined,
        categories: data.categoryIds
          ? {
              create: data.categoryIds.map((categoryId) => ({
                category: {
                  connect: { id: categoryId },
                },
              })),
            }
          : undefined,
      },
      include: {
        authors: {
          include: {
            author: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async deleteBook(id: string): Promise<void> {
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
      throw new Error('Book not found');
    }

    if (book.borrowedBooks.length > 0) {
      throw new Error('Cannot delete book with active borrowings');
    }

    await prisma.book.delete({
      where: { id },
    });
  }

  async findBookById(id: string): Promise<Book | null> {
    return prisma.book.findUnique({
      where: { id },
      include: {
        authors: {
          include: {
            author: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        borrowedBooks: {
          where: {
            returnedAt: null,
          },
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findBooks(params: {
    search?: string;
    categoryIds?: string[];
    authorIds?: string[];
    available?: boolean;
    skip?: number;
    take?: number;
  }): Promise<{ books: Book[]; total: number }> {
    const where: Prisma.BookWhereInput = {
      OR: params.search
        ? [
            { title: { contains: params.search, mode: 'insensitive' } },
            { isbn: { contains: params.search, mode: 'insensitive' } },
          ]
        : undefined,
      categories: params.categoryIds
        ? {
            some: {
              categoryId: {
                in: params.categoryIds,
              },
            },
          }
        : undefined,
      authors: params.authorIds
        ? {
            some: {
              authorId: {
                in: params.authorIds,
              },
            },
          }
        : undefined,
      availableCopies: params.available ? { gt: 0 } : undefined,
    };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: {
          authors: {
            include: {
              author: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          title: 'asc',
        },
      }),
      prisma.book.count({ where }),
    ]);

    return { books, total };
  }
} 