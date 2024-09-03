import { PrismaClient, Review, Faq   } from "@prisma/client";
import {FaqDto, ReviewDto} from "../dto/web";

const prisma = new PrismaClient();

export const getAllReviews = async (): Promise<Review[]> => {
  return await prisma.review.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
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


export const getAllFaqs = async (): Promise<Faq[]> => {
  return await prisma.faq.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
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


