import {Role} from "@prisma/client";

export interface UserDto {
  id:number;
  firstName:string;
  lastName:string;
  phoneNumber:string;
  email:string;
  password?:string;
  role?:Role;
}

export interface SingInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  token: string;
  user: UserDto;
}

export interface SingUpRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UserFilters {
  firstName?: string;
  lastName?:string;
  email?: string;
  role?: Role;
}

export interface PublicUser {
  id: number;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isDisabled: boolean;
  lastLogin: Date | null;
  lastPasswordChanged: Date | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedUsers {
  users: PublicUser[];
  totalPages: number;
  currentPage: number;
}
