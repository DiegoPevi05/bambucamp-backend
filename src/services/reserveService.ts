import * as reserveRepository from '../repositories/ReserveRepository';
import { PaginatedReserve, ReserveDto, ReserveEntityType, ReserveExperienceDto, ReserveFilters, ReserveFormDto, ReserveOptions, ReserveProductDto, ReserveTentDto, createReserveExperienceDto, createReserveProductDto } from "../dto/reserve";
import *  as userRepository from '../repositories/userRepository';
import * as productService from './productService';
import * as experienceService from './experienceService';
import * as authService from './authService';
import * as utils from '../lib/utils';
import { BadRequestError, NotFoundError, UnauthorizedError } from "../middleware/errors";
import { sendNewReservationEmailUser, sendNewReservationEmailAdmin } from '../config/email/mail';
import { PaymentStatus, Reserve, ReserveStatus, Role, User } from '@prisma/client';
import { calculatePrice } from '../lib/utils';
import { PublicTent } from '../dto/tent';
import { generateSalesNote } from '../config/receipt/pdf';

interface Pagination {
  page: number;
  pageSize: number;
}

export const getCalendarDates = async (page: number) => {
  return await reserveRepository.getCalendarDates(page);
}

export const searchAvailableTents = async (dateFromInput: string, dateToInput: string) => {
  const dateFrom = new Date(dateFromInput);
  const dateTo = new Date(dateToInput);
  const tents = await reserveRepository.searchAvailableTents(dateFrom, dateTo);

  const TentsPublic: PublicTent[] = []

  tents.forEach((tent) => {

    let tentPublic: PublicTent = {
      ...tent,
      images: JSON.parse(tent.images ? tent.images : '[]'),
      custom_price: calculatePrice(tent.price, tent.custom_price)
    }
    TentsPublic.push(tentPublic);
  });

  return TentsPublic;
};

export const searchAdminAvailableTents = async (dateFromInput: string, dateToInput: string) => {
  const dateFrom = new Date(dateFromInput);
  const dateTo = new Date(dateToInput);
  const tents = await reserveRepository.searchAvailableTents(dateFrom, dateTo);

  tents.forEach((tent) => {
    tent.images = JSON.parse(tent.images ? tent.images : '[]');
  });

  return tents;
};

export const getAllMyReservesCalendarUser = async (page: number, userId: number) => {
  return await reserveRepository.getMyReservesByMonth(page, userId);
}

export const getAllMyReservesCalendar = async (page: number, userId?: number) => {
  return await reserveRepository.getMyReservesByMonth(page, userId);
}

export const getAllMyReservesUser = async (pagination: Pagination, userId: number) => {
  const MyReserves = await reserveRepository.getMyReserves(pagination, userId);

  if (MyReserves?.reserves) {
    utils.parseImagesInReserves(MyReserves.reserves);
  }

  return MyReserves;
};

export const getAllMyReserves = async (pagination: Pagination, userId?: number) => {
  const MyReserves = await reserveRepository.getMyReserves(pagination, userId);

  if (MyReserves?.reserves) {
    utils.parseImagesInReserves(MyReserves.reserves);
  }

  return MyReserves;
};

export const getAllReseveOptions = async (): Promise<ReserveOptions> => {
  const reserveOptions = await reserveRepository.getAllReserveOptions();

  reserveOptions?.tents?.forEach((tent) => {
    tent.images = JSON.parse(tent.images ? tent.images : '[]');

  })

  reserveOptions?.products?.forEach((product) => {
    product.images = JSON.parse(product.images ? product.images : '[]');
  })

  reserveOptions?.experiences?.forEach((experience) => {
    experience.images = JSON.parse(experience.images ? experience.images : '[]');
  })

  return reserveOptions;

}



export const getAllReserves = async (filters: ReserveFilters, pagination: Pagination): Promise<PaginatedReserve> => {
  return await reserveRepository.getAllReserves(filters, pagination);
};

export const getReserveById = async (id: number) => {
  return await reserveRepository.getReserveById(id);
};

export const createReserveByUser = async (data: ReserveFormDto, language: string):Promise<{external_id:string, gross_import:number}> => {

  data.price_is_calculated = true;
  data.payment_status = PaymentStatus.UNPAID;
  data.reserve_status = ReserveStatus.NOT_CONFIRMED;
  const reserve = await createReserve(data, language);

  if (reserve == null) {

    throw new BadRequestError("error.failedToCreateReserve")
  }


  await sendNewReservationEmailUser({ email: data.user_email ?? "", firstName: data.user_firstname ?? "" }, reserve, language);

  await sendNewReservationEmailAdmin({ email: data.user_email ?? "", firstName: data.user_firstname ?? "" }, reserve, language);

  return {
    external_id: reserve.external_id,
    gross_import: reserve.gross_import
  }

};


export const createReserve = async (data: ReserveFormDto, language: string): Promise<ReserveDto | null> => {
  const user = await authService.createReserveUser(data);

  const reserveDto: ReserveDto = {
    userId: user.id,
    eta: data.eta ? new Date(data.eta) : new Date(),
    external_id: "",
    dateSale: new Date(),
    tents: [],
    experiences: [],
    products: [],
    price_is_calculated: data.price_is_calculated ?? true,
    discount_code_id: Number(data.discount_code_id ?? 0),
    discount_code_name: data.discount_code_name ?? "",
    net_import: Number(data.net_import ?? 0),
    discount: Number(data.discount ?? 0),
    gross_import: Number(data.gross_import ?? 0),
    canceled_reason: data.canceled_reason ?? "",
    canceled_status: data.canceled_status ?? false,
    payment_status: data.payment_status ?? PaymentStatus.UNPAID,
    reserve_status: data.reserve_status ?? ReserveStatus.CONFIRMED,
  };

  const [tentsDb, productsDb, experiencesDb] = await Promise.all([
    utils.getTents(data.tents),
    utils.getProducts(data.products),
    utils.getExperiences(data.experiences),
  ]);

  const tentsAvailable = await utils.checkAvailability(data.tents);
  if (!tentsAvailable) throw new BadRequestError("error.noTentsAvailable");

  utils.normalizeTimesInTents(data.tents);

  const tentsDbMap = new Map(tentsDb.map(t => [t.id, t]));
  const tentsWithQuantities = data.tents.map(tent => {
    const tentDB = tentsDbMap.get(tent.idTent);
    if (!tentDB) throw new NotFoundError("error.noAllTentsFound");

    const { nightlyBase, kids_price, additional_people_price } = utils.computeTentNightly(
      tentDB,
      { kids: tent.kids, additional_people: tent.additional_people }
    );

    reserveDto.tents.push({
      idTent: tentDB.id,
      name: tentDB.title,
      price: nightlyBase,
      nights: tent.nights,
      dateFrom: tent.dateFrom,
      dateTo: tent.dateTo,
      additional_people: tent.additional_people,
      additional_people_price,
      kids: tent.kids,
      kids_price,
      confirmed: false,
    });

    return {
      tent: tentDB,
      nights: Number(tent.nights ?? 0),
      additional_people: tent.additional_people,
      kids: tent.kids,
    };
  });

  const productsWithQuantities = data.products.map(product => {
    const productDB = productsDb.find(p => p.id === product.idProduct);
    if (!productDB) throw new NotFoundError("error.noAllProductsFound");

    reserveDto.products.push({
      idProduct: productDB.id,
      name: productDB.name,
      price: utils.calculatePrice(productDB.price, productDB.custom_price),
      quantity: product.quantity,
      confirmed: false,
    });

    return {
      product: productDB,
      quantity: product.quantity,
    };
  });

  utils.normalizeTimesInExperience(data.experiences);

  const experiencesWithQuantities = data.experiences.map(experience => {
    const experienceDB = experiencesDb.find(e => e.id === experience.idExperience);
    if (!experienceDB) throw new NotFoundError("error.noAllExperiencesFound");

    reserveDto.experiences.push({
      idExperience: experienceDB.id,
      name: experienceDB.name,
      price: utils.calculatePrice(experienceDB.price, experienceDB.custom_price),
      quantity: experience.quantity,
      day: experience.day,
      confirmed: false,
    });

    return {
      experience: experienceDB,
      quantity: experience.quantity,
    };
  });

  const computedPrice = utils.calculateReservePrice(
    tentsWithQuantities,
    productsWithQuantities,
    experiencesWithQuantities
  );

  if (reserveDto.price_is_calculated) {
    reserveDto.gross_import = computedPrice.total;
    const { netImport, discount, discount_name } = await utils.applyDiscount(
      reserveDto.gross_import,
      data.discount_code_id
    );
    reserveDto.net_import = netImport;
    reserveDto.discount = discount;
    reserveDto.discount_code_name = discount_name ?? "";
  } else {
    const { netImport, discount, discount_name } = await utils.applyDiscount(
      data.gross_import,
      data.discount_code_id,
      data.discount
    );
    reserveDto.gross_import = data.gross_import;
    reserveDto.net_import = netImport;
    reserveDto.discount = discount;
    reserveDto.discount_code_name = discount_name ?? "";
  }

  const reserve = await reserveRepository.createReserve(reserveDto);

  if (reserveDto.reserve_status === ReserveStatus.CONFIRMED && reserve?.id) {
    await authService.confirmReservation(reserve.id, language);
  }

  return reserve;
};

export const updateReserve = async (id: number, data: ReserveFormDto) => {
  const existingReserve = await reserveRepository.getReserveById(id);
  if (!existingReserve) throw new NotFoundError('error.noReservefoundInDB');

  const user = await userRepository.getUserById(data.userId);
  if (!user) throw new NotFoundError('error.noUserFoundInDB');

  existingReserve.userId = user.id;
  if (data.eta) existingReserve.eta = new Date(data.eta);
  if (data.reserve_status) existingReserve.reserve_status = data.reserve_status;
  if (data.payment_status) existingReserve.payment_status = data.payment_status;
  if (data.discount_code_id) existingReserve.discount_code_id = data.discount_code_id;
  if (data.discount_code_name) existingReserve.discount_code_name = data.discount_code_name;
  if (data.price_is_calculated != null) existingReserve.price_is_calculated = data.price_is_calculated;
  if (data.gross_import) existingReserve.gross_import = Number(data.gross_import);
  if (data.discount) existingReserve.discount = Number(data.discount);
  if (data.net_import) existingReserve.net_import = Number(data.net_import);

  // Normalize times
  utils.normalizeTimesInTents(data.tents);
  utils.normalizeTimesInExperience(data.experiences);

  const [tentsDb, productsDb, experiencesDb] = await Promise.all([
    utils.getTents(data.tents),
    utils.getProducts(data.products),
    utils.getExperiences(data.experiences),
  ]);

  const tentsAvailable = await utils.checkAvailability(data.tents);
  if (!tentsAvailable) throw new BadRequestError("error.noTentsAvailable");

  const tentsDbMap = new Map(tentsDb.map(t => [t.id, t]));

  const reserve_tents: ReserveTentDto[] = data.tents.map(t => {
    const tentDB = tentsDbMap.get(t.idTent)!;
    const { nightlyBase, kids_price, additional_people_price } = utils.computeTentNightly(tentDB, {
      kids: t.kids,
      additional_people: t.additional_people,
    });

    return {
      id: t.id,
      idTent: t.idTent,
      name: tentDB.title,
      price: nightlyBase,
      nights: t.nights,
      dateFrom: t.dateFrom,
      dateTo: t.dateTo,
      additional_people: t.additional_people,
      additional_people_price,
      kids: t.kids,
      kids_price,
      confirmed: false,
    };
  });

  const reserve_products: ReserveProductDto[] = data.products.map(p => {
    const productDB = productsDb.find(prod => prod.id === p.idProduct)!;
    return {
      id: p.id,
      idProduct: p.idProduct,
      name: productDB.name,
      price: utils.calculatePrice(productDB.price, productDB.custom_price),
      quantity: p.quantity,
      confirmed: false,
    };
  });

  const reserve_experiences: ReserveExperienceDto[] = data.experiences.map(e => {
    const experienceDB = experiencesDb.find(exp => exp.id === e.idExperience)!;
    return {
      id: e.id,
      idExperience: e.idExperience,
      name: experienceDB.name,
      price: utils.calculatePrice(experienceDB.price, experienceDB.custom_price),
      quantity: e.quantity,
      day: e.day,
      confirmed: false,
    };
  });

  const tentsWithQuantities = data.tents.map(t => {
    const tentDB = tentsDbMap.get(t.idTent)!;
    return {
      tent: tentDB,
      nights: t.nights,
      additional_people: t.additional_people,
      kids: t.kids,
    };
  });

  const productsWithQuantities = data.products.map(p => ({
    product: productsDb.find(prod => prod.id === p.idProduct)!,
    quantity: p.quantity,
  }));

  const experiencesWithQuantities = data.experiences.map(e => ({
    experience: experiencesDb.find(exp => exp.id === e.idExperience)!,
    quantity: e.quantity,
  }));

  const priceComputation = utils.calculateReservePrice(
    tentsWithQuantities,
    productsWithQuantities,
    experiencesWithQuantities
  );

  if (data.price_is_calculated) {
    existingReserve.gross_import = priceComputation.total;

    const { netImport, discount, discount_name } = await utils.applyDiscount(
      existingReserve.gross_import,
      existingReserve.discount_code_id
    );

    existingReserve.discount = discount;
    existingReserve.discount_code_name = discount_name ?? "";
    existingReserve.net_import = netImport;
  } else {
    const { netImport, discount, discount_name } = await utils.applyDiscount(
      existingReserve.gross_import,
      existingReserve.discount_code_id,
      existingReserve.discount
    );

    existingReserve.discount = discount;
    existingReserve.discount_code_name = discount_name ?? "";
    existingReserve.net_import = netImport;
  }

  await reserveRepository.upsertReserveDetails(
    existingReserve.id,
    reserve_tents,
    reserve_products,
    reserve_experiences
  );

  return await reserveRepository.updateReserve(id, existingReserve);
};

export const deleteReserve = async (id: number) => {
  return await reserveRepository.deleteReserve(id);
};

export const AddProductReserveByUser = async (userId: number, data: createReserveProductDto[]) => {

  const reserveId = data[0].reserveId;
  const reserve = await reserveRepository.getReserveById(reserveId);

  if (!reserve) {
    throw new NotFoundError('error.noReservefoundInDB');
  }

  if (reserve.userId !== userId) {
    throw new UnauthorizedError('error.unauthorized');
  }

  const updatedProducts = await Promise.all(data.map(async productData => {
    const product = await productService.getProductById(productData.idProduct);

    if (!product) {
      throw new NotFoundError("error.noProductFoundInDB");
    }

    productData.name = product.name;
    productData.price = utils.calculatePrice(product.price, product.custom_price);
    productData.confirmed = false;
    return productData;
  }));


  await AddProductReserve(reserve, updatedProducts);  // Pass reserve object to avoid duplicate search
};

export const AddProductReserve = async (reserve: Reserve | null, data: createReserveProductDto[]) => {
  // If reserve is not provided, fetch it from the repository
  let priceIsConfirmed: boolean = false;

  if (!reserve) {
    priceIsConfirmed = true;
    const reserveId = data[0].reserveId;
    reserve = await reserveRepository.getReserveById(reserveId);

    if (!reserve) {
      throw new NotFoundError('error.noReservefoundInDB');
    }
  }

  const processedProducts = await Promise.all(data.map(async productData => {
    const isStock = await productService.checkProductStock(productData.idProduct, productData.quantity);
    if (!isStock) {
      throw new NotFoundError('error.noProductsFoundInStock');
    }
    if (priceIsConfirmed) {
      productData.confirmed = true;
    }
    return productData;
  })
  );

  return await reserveRepository.AddProductReserve(processedProducts);
};

export const deleteProductReserve = async (id: number) => {
  return await reserveRepository.deleteProductReserve(id);
};

export const AddExperienceReserveByUser = async (userId: number, data: createReserveExperienceDto[]) => {

  // Assume all data objects belong to the same reserve
  const reserveId = data[0].reserveId;
  const reserve = await reserveRepository.getReserveById(reserveId);

  if (!reserve) {
    throw new NotFoundError('error.noReservefoundInDB');
  }

  if (reserve.userId !== userId) {
    throw new UnauthorizedError('error.unauthorized');
  }

  const updatedExperiences = await Promise.all(data.map(async experienceData => {
    const experience = await experienceService.getExperienceById(experienceData.idExperience);

    if (!experience) {
      throw new NotFoundError("error.noExperienceFoundInDB");
    }

    experienceData.name = experience.name;
    experienceData.price = utils.calculatePrice(experience.price, experience.custom_price);
    experienceData.confirmed = false;
    return experienceData;
  }));

  // Pass the entire array to the AddExperienceReserve function
  await AddExperienceReserve(reserve, updatedExperiences);
};


export const AddExperienceReserve = async (reserve: Reserve | null, data: createReserveExperienceDto[]) => {
  // If reserve is not provided, fetch it from the repository (assuming all belong to the same reserve)
  let priceIsConfirmed: boolean = false;

  if (!reserve) {
    priceIsConfirmed = true;
    const reserveId = data[0].reserveId;
    reserve = await reserveRepository.getReserveById(reserveId);

    if (!reserve) {
      throw new NotFoundError('error.noReservefoundInDB');
    }
  }

  const processedExperiences = data.map(experienceData => {
    if (experienceData.day) {
      const date_parsed = new Date(experienceData.day);
      date_parsed.setUTCHours(17, 0, 0, 0);  // This modifies the date in place
      experienceData.day = date_parsed;
    }

    if (priceIsConfirmed) {
      experienceData.confirmed = true;
    }

    return experienceData;
  });

  // Pass the entire array to the repository method
  return await reserveRepository.AddExperienceReserve(processedExperiences);
};

export const deleteExperienceReserve = async (id: number) => {
  return await reserveRepository.deleteExperienceReserve(id);
};

export const downloadReserveBill = async (reserveId: number, user: User | undefined, t: (key: string) => string): Promise<Buffer> => {

  if (!user) throw new UnauthorizedError('error.unauthorized');

  const reserve = await reserveRepository.getReserveDtoById(reserveId);

  if (!reserve) {
    throw new NotFoundError('error.noReservefoundInDB');
  }

  if (user.role === Role.CLIENT && user.id != reserve.userId) {
    throw new UnauthorizedError('error.unauthorized')
  }

  if (reserve.reserve_status != ReserveStatus.COMPLETE || reserve.payment_status != PaymentStatus.PAID) {
    throw new BadRequestError('error.reserveNotPayOrComplete')
  }

  const buffer = await generateSalesNote(reserve, t);

  if (!buffer) throw new BadRequestError("error.failedToGeneratePDF");

  return buffer;

}


export const confirmEntity = async (entityType: ReserveEntityType, reserveId: number, language: string, entityId?: number) => {



  switch (entityType) {
    case ReserveEntityType.RESERVE:

      await authService.confirmReservation(reserveId, language);

      return await reserveRepository.confirmReserve(reserveId);

    case ReserveEntityType.TENT:
      if (!entityId) throw new BadRequestError('validation.idRequired');
      // Confirm a specific tent
      return await reserveRepository.confirmTent(entityId);


    case ReserveEntityType.PRODUCT:
      if (!entityId) throw new BadRequestError('validation.idRequired');
      // Confirm a specific product
      return await reserveRepository.confirmProduct(entityId);

    case ReserveEntityType.EXPERIENCE:
      if (!entityId) throw new BadRequestError('validation.idRequired');
      // Confirm a specific experience
      return await reserveRepository.confirmExperience(entityId);

    default:
      throw new BadRequestError('error.InvalidTypeProvided');
  }
};





