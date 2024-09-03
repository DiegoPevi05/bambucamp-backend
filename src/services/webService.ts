import {FaqDto, PublicFaqDto, PublicReviewDto, ReviewDto} from '../dto/web';
import * as webRepository from '../repositories/WebRepository';
import * as tentService  from '../services/tentService';
import * as promotionService from '../services/promotionService';
import { webContent } from '../dto/web';

export const getWebContent = async () => {
  const webContent:webContent = {
    tents: await tentService.getAllPublicTents(),
    promotions:await promotionService.getAllPublicPromotions(),
    faqs:await getAllFaqs(),
    reviews: await getAllReviews()
  }
  return webContent;
};


export const getAllReviews = async () => {
  const reviews = await webRepository.getAllReviews();

  const ReviewsPublic:PublicReviewDto[]  = [] 

  reviews.forEach((review) => {
    let reviewPublic:PublicReviewDto = {
      id:review.id,
      name: review.name,
      title:review.title,
      review:review.review,
      stars:review.stars,
      day:review.day,
      href:review.href,
      profile_image_url:review.profile_image_url
    }
    ReviewsPublic.push(reviewPublic);
  });

  return ReviewsPublic;

};

export const createReview = async (data: ReviewDto) => {

  data.stars        = Number(data.stars);
  data.day          = new Date(data.day);

  return await webRepository.createReview(data);
};

export const deleteReview = async (id: number) => {
  return await webRepository.deleteReview(id);
};

export const getAllFaqs = async () => {
  const faqs = await webRepository.getAllFaqs();

  const FaqsPublic:PublicFaqDto[]  = [] 

  faqs.forEach((faq) => {
    let reviewPublic:PublicFaqDto = {
      id:faq.id,
      question:faq.question,
      answer:faq.answer
    }
    FaqsPublic.push(reviewPublic);
  });

  return FaqsPublic;
};

export const createFaq = async (data: FaqDto) => {

  return await webRepository.createFaq(data);
};

export const deleteFaq = async (id: number) => {
  return await webRepository.deleteFaq(id);
};
