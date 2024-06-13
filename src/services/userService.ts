import bcrypt from 'bcryptjs';
import * as userRepository from '../repositories/userRepository';
import { SingUpRequest } from '../dto/user';

export const getAllUsers = async () => {
  return await userRepository.getAllUsers();
};

export const getUserById = async (id: number) => {
  return await userRepository.getUserById(id);
};

export const createUser = async (data: SingUpRequest) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  await userRepository.createUser({ ...data, password: hashedPassword });
};

export const disableUser = async (id: number) => {
  return await userRepository.disableUser(id);
};

export const enableUser = async (id: number) => {
  return await userRepository.enableUser(id);
};

export const deleteUser = async (id: number) => {
  return await userRepository.deleteUser(id);
};

