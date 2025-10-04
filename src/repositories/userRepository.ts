import { PrismaClient, User } from '@prisma/client';
import { UserFilters, PaginatedUsers, UserDto, UserFormDto } from '../dto/user';

const prisma = new PrismaClient();

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllUsers = async (filters: UserFilters, pagination: Pagination): Promise<PaginatedUsers> => {
  const { firstName, lastName, email, role } = filters;
  const { page, pageSize } = pagination;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const totalCount = await prisma.user.count({
    where: {
      ...(firstName && { firstName: { contains: firstName, mode: 'insensitive' } }),
      ...(lastName && { lastName: { contains: lastName, mode: 'insensitive' } }),
      ...(email && { email: { contains: email, mode: 'insensitive' } }),
      ...(role && { role }), // Direct equality check for enum
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const users = await prisma.user.findMany({
    where: {
      ...(firstName && { firstName: { contains: firstName, mode: 'insensitive' } }),
      ...(lastName && { lastName: { contains: lastName, mode: 'insensitive' } }),
      ...(email && { email: { contains: email, mode: 'insensitive' } }),
      ...(role && { role }), // Direct equality check for enum
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      isDisabled: true,
      lastLogin: true,
      lastPasswordChanged: true,
      emailVerified: true,
      document_id: true,
      document_type: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    users,
    totalPages,
    currentPage: page,
  };

};

export const updateLastLogin = async (userId: number) => {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
  });
};

export const getUserById = async (id: number): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { id }
  });
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { email }
  });
};

export const createUser = async (data: UserDto): Promise<User> => {
  return await prisma.user.create({
    data
  });
};

export const createClientUser = async (data: UserFormDto): Promise<User> => {
  return await prisma.user.create({
    data
  })
}


export const updateUser = async (userId: Number, data: UserDto): Promise<User> => {
  return await prisma.user.update({
    where: { id: Number(userId) },
    data: data
  });
}

export const updateVerificationToken = async (email: string, token: string): Promise<User> => {
  return await prisma.user.update({
    where: { email },
    data: {
      emailVerificationCode: token,
      emailVerificationCodeExpiry: new Date(Date.now() + 3600000)
    }
  });
};

export const updatePasswordResetToken = async (email: string, token: string): Promise<User> => {
  return await prisma.user.update({
    where: { email },
    data: {
      passwordResetCode: token,
      passwordResetCodeExpiry: new Date(Date.now() + 3600000)
    }
  });
}

export const updatePassword = async (email: string, hashedPassword: string, token: string): Promise<User> => {
  return await prisma.user.update({
    where: { email: email, passwordResetCode: token },
    data: { password: hashedPassword }
  });
};

export const updatePasswordWithoutToken = async (email: string, hashedPassword: string): Promise<User> => {
  return await prisma.user.update({
    where: { email: email },
    data: { password: hashedPassword }
  });
};


export const updateEmailVerified = async (email: string): Promise<User> => {
  return await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true
    }
  });
};

export const disableUser = async (id: number): Promise<User> => {
  return await prisma.user.update({
    where: { id },
    data: {
      isDisabled: true
    }
  });
};

export const enableUser = async (id: number): Promise<User> => {
  return await prisma.user.update({
    where: { id },
    data: {
      isDisabled: false
    }
  });
};

export const deleteUser = async (id: number): Promise<User> => {
  return await prisma.user.delete({
    where: { id }
  });
};

