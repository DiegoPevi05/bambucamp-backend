import { PrismaClient, User } from '@prisma/client';
import { SingUpRequest } from '../dto/user';

const prisma = new PrismaClient();

export const getAllUsers = async (): Promise<User[]> => {
  return await prisma.user.findMany();
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

export const createUser = async (data: SingUpRequest): Promise<User> => {
  return await prisma.user.create({
    data
  });
};

export const updateVerificationToken = async (email: string, token: string): Promise<User> => {
  return await prisma.user.update({
    where: { email },
    data: { 
      emailVerificationCode:token, 
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

export const updatePassword = async (email: string, hashedPassword:string, token:string): Promise<User> => {
  return await prisma.user.update({
    where: { email:email, passwordResetCode:token  },
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

