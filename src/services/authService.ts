import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository';
import { UserDto} from '../dto/user';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/email/mail';
import { randomUUID } from 'crypto';
import {BadRequestError, NotFoundError} from '../middleware/errors';


const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

/*************************SIGN UP FUNCTION************************************/
export const signUp = async (data: UserDto) => {

  const userExistant = await userRepository.getUserByEmail(data.email);

  if(userExistant){
    throw new BadRequestError('error.userAlreadyExist');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user =  await userRepository.createUser({ ...data, password: hashedPassword });

  const token = randomUUID().slice(0, 6);

  await userRepository.updateVerificationToken(user.email,token)

  await sendVerificationEmail({email:data.email, firstName:data.firstName}, token);

};

/*************************VERIFY EMAIL FUNCTION************************************/
export const verifyEmail = async(email:string,token:string) => {
  const user = await userRepository.getUserByEmail(email);

  if(!user){
    throw new NotFoundError('error.noUserFoundInDB')
  }

  if (user.emailVerified) {
    throw new BadRequestError('error.emailAlreadyVerified');
  }

  if(user.emailVerificationCodeExpiry){
    const now = new Date();
    const expiryDate = user.emailVerificationCodeExpiry;

    if(expiryDate.getTime() <= now.getTime()){
      throw new BadRequestError("error.verificationCodeIsAlreadyExpired")
    }
  }

  if(user.emailVerificationCode != token){
     throw new BadRequestError('error.codeInvalid')
  }

  await userRepository.updateEmailVerified(user.email);

  return;
}
/*************************RESET PASSWORD FUNCTION************************************/
export const resetPassword = async (email: string) => {
  const user = await userRepository.getUserByEmail(email);
  if (!user) {
    throw new NotFoundError('error.noUserFoundInDB');
  };

  if (!user.emailVerified) {
    throw new BadRequestError('error.emailNotVerified');
  };

  const token = randomUUID().slice(0, 6);
  await userRepository.updatePasswordResetToken(email, token);

  await sendPasswordResetEmail({ email: user.email, firstName: user.firstName }, token);

  return;
};

/*************************VERIFY PASSWORD RESET CODE************************************/
export const verifyPasswordResetCode = async (email: string, token: string) => {
  const user = await userRepository.getUserByEmail(email);

  if (!user) {
    throw new NotFoundError('error.noUserFoundInDB');
  }

  if(user.passwordResetCodeExpiry){
    const now = new Date();
    const expiryDate = user.passwordResetCodeExpiry;

    if(expiryDate.getTime() <= now.getTime()){
      throw new BadRequestError("error.verificationCodeIsAlreadyExpired")
    }
  }

  if(user.passwordResetCode != token){
     throw new BadRequestError("error.codeInvalid")
  }

  return;
};

/*************************UPDATE PASSWORD FUNCTION************************************/
export const updatePassword = async (email: string, password: string, token:string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  await userRepository.updatePassword(email, hashedPassword, token);
  return;
};


/*************************SIGN IN FUNCTION************************************/
export const signIn = async (email: string, password: string) => {
  const user = await userRepository.getUserByEmail(email);
  if (!user) {
    throw new BadRequestError('error.InvalidEmailOrPassword');
  }

  if (!user.emailVerified) {
    throw new BadRequestError('error.emailNotVerified');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new BadRequestError('error.InvalidEmailOrPassword');
  }

  // Update the lastLogin field
  await userRepository.updateLastLogin(user.id);

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

  return { 
    token, 
    user: { 
      id: user.id, 
      firstName: user.firstName, 
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role
    } 
  };
};
