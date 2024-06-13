import {Role} from "@prisma/client";

export interface UserDto {
  id:number;
  firstName:string;
  lastName:string;
  phoneNumber:string;
  email:string;
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
