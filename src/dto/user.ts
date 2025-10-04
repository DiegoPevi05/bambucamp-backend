import { Role } from "@prisma/client";

export interface UserDto {
  id: number;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  document_type: string;
  document_id: string;
  isDisabled: boolean;
  lastLogin: Date | null;
  lastPasswordChanged: Date | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser extends Omit<UserDto, 'password'> { };

export interface UserFormDto extends Omit<UserDto, 'id' | 'lastLogin' | 'lastPasswordChanged' | 'createdAt' | 'updatedAt'> { };

export interface PublicUserSignInResponse extends Omit<UserDto, 'password' | 'isDisabled' | 'lastLogin' | 'lastPasswordChanged' | 'emailVerified' | 'createdAt' | 'updatedAt'> { };

export interface SignInRequest extends Pick<UserDto, 'email' | 'password'> { };

export interface SignInResponse {
  token: string;
  user: PublicUserSignInResponse;
};

export interface SingUpRequest extends Omit<UserDto, 'id' | 'isDisabled' | 'lastLogin' | 'lastPasswordChanged' | 'emailVerified' | 'createdAt' | 'updatedAt' | 'role'> {
  role?: Role;
};

export interface UserFilters {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
};

export interface PaginatedUsers {
  users: PublicUser[];
  totalPages: number;
  currentPage: number;
};
