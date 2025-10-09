import { ComplaintForm, ContactForm, FaqDto, PaginatedFaqs, PaginatedReviews, PublicFaqDto, PublicReviewDto, ReviewDto } from '../dto/web';
import * as webRepository from '../repositories/WebRepository';
import * as tentService from '../services/tentService';
import * as experienceService from '../services/experienceService';

import { webContent } from '../dto/web';
import { Review } from '@prisma/client';
import { sendComplaintFormAdmin, sendComplaintFormConfirmation, sendContactFormAdmin, sendContactFormConfirmation } from '../config/email/mail';

export const contactForm = async (props: ContactForm, language: string) => {
  const { email, name, message } = props;

  await sendContactFormConfirmation({ email, name }, language);
  await sendContactFormAdmin({ email, name, message }, language);
}

export const complaintForm = async (props: ComplaintForm, language: string) => {
  const { email, name, phone, documentId, claimType, description, reservationCode } = props;

  await sendComplaintFormConfirmation({ email, name }, language);
  await sendComplaintFormAdmin({ email, name, phone, documentId, claimType, description, reservationCode }, language);
}

export const getWebContent = async () => {
  const webContent: webContent = {
    bundles: await experienceService.getAllPublicBundles(),
    tents: await tentService.getAllPublicTents(),
    faqs: await getAllPublicFaqs(),
    reviews: await getAllPublicReviews()
  }
  return webContent;
};


export const getAllPublicReviews = async () => {
  const reviews = await webRepository.getAllPublicReviews();

  const ReviewsPublic: PublicReviewDto[] = []

  reviews.forEach((review: Review) => {
    let reviewPublic: PublicReviewDto = {
      id: review.id,
      name: review.name,
      title: review.title,
      review: review.review,
      stars: review.stars,
      day: review.day,
      href: review.href,
      profile_image_url: review.profile_image_url
    }
    ReviewsPublic.push(reviewPublic);
  });

  return ReviewsPublic;

};

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllReviews = async (pagination: Pagination): Promise<PaginatedReviews> => {
  return await webRepository.getAllReviews(pagination);
};

export const createReview = async (data: ReviewDto) => {

  data.stars = Number(data.stars);
  data.day = new Date(data.day);

  return await webRepository.createReview(data);
};

export const deleteReview = async (id: number) => {
  return await webRepository.deleteReview(id);
};

export const getAllPublicFaqs = async () => {
  const faqs = await webRepository.getAllPublicFaqs();

  const FaqsPublic: PublicFaqDto[] = []

  faqs.forEach((faq) => {
    let reviewPublic: PublicFaqDto = {
      id: faq.id,
      question: faq.question,
      answer: faq.answer
    }
    FaqsPublic.push(reviewPublic);
  });

  return FaqsPublic;
};

export const getAllFaqs = async (pagination: Pagination): Promise<PaginatedFaqs> => {
  return await webRepository.getAllFaqs(pagination);
};

export const createFaq = async (data: FaqDto) => {

  return await webRepository.createFaq(data);
};

export const deleteFaq = async (id: number) => {
  return await webRepository.deleteFaq(id);
};
