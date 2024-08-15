import bcrypt from 'bcryptjs';
import * as userRepository from '../repositories/userRepository';
import { UserFilters, PaginatedUsers, UserDto } from '../dto/user';
import {BadRequestError} from '../middleware/errors';

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllUsers = async (filters: UserFilters, pagination: Pagination): Promise<PaginatedUsers> => {
  return await userRepository.getAllUsers(filters, pagination);
};

export const getUserById = async (id: number) => {
  return await userRepository.getUserById(id);
};

export const createUser = async (data: UserDto) => {

  const userExistant = await userRepository.getUserByEmail(data.email);

  if(userExistant){
    throw new BadRequestError('User already Exist');
  }

  let hashedPassword: string;

  if(data.password != undefined){
    hashedPassword =  await bcrypt.hash(data?.password, 10);
  }else{
    throw new BadRequestError('Password is necesary');
  }  

  await userRepository.createUser({ ...data, password: hashedPassword });
};

export const updateUser = async(userId:Number, data:UserDto) => {

  const user = await userRepository.getUserByEmail(data.email);

  let hashedPassword: string | undefined;

  if(data.password){
    hashedPassword = await bcrypt.hash(data.password, 10);
    data.password  = hashedPassword;
  }else{
    data.password = user?.password ? user?.password : "";
  }

  await userRepository.updateUser(userId,data);
}

export const disableUser = async (id: number) => {
  return await userRepository.disableUser(id);
};

export const enableUser = async (id: number) => {
  return await userRepository.enableUser(id);
};

export const deleteUser = async (id: number) => {
  return await userRepository.deleteUser(id);
};

