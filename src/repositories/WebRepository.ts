import { PrismaClient, Review, Faq   } from "@prisma/client";
import {FaqDto, PaginatedFaqs, PaginatedReviews, ReviewDto} from "../dto/web";

const prisma = new PrismaClient();

export const getAllPublicReviews = async (): Promise<Review[]> => {
  return await prisma.review.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
};

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllReviews = async (pagination:Pagination): Promise<PaginatedReviews> => {
  const { page, pageSize } = pagination;
  
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const totalCount = await prisma.review.count({
    orderBy: {
      createdAt: 'desc',
    },
  });

  const reviews = await prisma.review.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    reviews,
    totalPages,
    currentPage: page,
  };
};

export const createReview = async (data: ReviewDto): Promise<Review> => {
  return await prisma.review.create({
    data
  });
};

export const deleteReview = async (id: number): Promise<Review> => {
  return await prisma.review.delete({
    where: { id }
  });
};


export const getAllPublicFaqs = async (): Promise<Faq[]> => {
  return await prisma.faq.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getAllFaqs = async (pagination:Pagination):Promise<PaginatedFaqs> => {
  const { page, pageSize } = pagination;
  
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const totalCount = await prisma.faq.count({
    orderBy: {
      createdAt: 'desc',
    },
  });

  const faqs = await prisma.faq.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    faqs,
    totalPages,
    currentPage: page,
  };
};

export const createFaq = async (data: FaqDto): Promise<Faq> => {
  return await prisma.faq.create({
    data
  });
};

export const deleteFaq = async (id: number): Promise<Faq> => {
  return await prisma.faq.delete({
    where: { id }
  });
};


