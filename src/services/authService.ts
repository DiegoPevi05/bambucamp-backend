import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository';
import * as reserveRepository from '../repositories/ReserveRepository';
import * as utils from '../lib/utils';
import { UserDto } from '../dto/user';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/email/mail';
import { randomUUID } from 'crypto';
import { BadRequestError, NotFoundError } from '../middleware/errors';
import { ReserveFormDto } from '../dto/reserve';
import { Role, User } from '@prisma/client';
import { sendConfirmationReservationEmail } from '../config/email/mail';


const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

/*************************SIGN UP FUNCTION************************************/
export const signUp = async (data: UserDto, language: string) => {

  const userExistant = await userRepository.getUserByEmail(data.email.toLowerCase());

  if (userExistant) {
    throw new BadRequestError('error.userAlreadyExist');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await userRepository.createUser({ ...data, email: data.email.toLowerCase(), password: hashedPassword });

  const token = randomUUID().slice(0, 6);

  await userRepository.updateVerificationToken(user.email, token)

  await sendVerificationEmail({ email: data.email, firstName: data.firstName }, token, language);

};

/*************************VERIFY EMAIL FUNCTION************************************/
export const verifyEmail = async (email: string, token: string) => {
  const user = await userRepository.getUserByEmail(email.toLowerCase());

  if (!user) {
    throw new NotFoundError('error.noUserFoundInDB')
  }

  if (user.emailVerified) {
    throw new BadRequestError('error.emailAlreadyVerified');
  }

  if (user.emailVerificationCodeExpiry) {
    const now = new Date();
    const expiryDate = user.emailVerificationCodeExpiry;

    if (expiryDate.getTime() <= now.getTime()) {
      throw new BadRequestError("error.verificationCodeIsAlreadyExpired")
    }
  }

  if (user.emailVerificationCode != token) {
    throw new BadRequestError('error.codeInvalid')
  }

  await userRepository.updateEmailVerified(user.email);

  return;
}
/*************************RESET PASSWORD FUNCTION************************************/
export const resetPassword = async (email: string, language: string) => {
  const user = await userRepository.getUserByEmail(email.toLowerCase());
  if (!user) {
    throw new NotFoundError('error.noUserFoundInDB');
  };


  if (!user.emailVerified) {
    throw new BadRequestError('error.emailNotVerified');
  };

  if (user.passwordResetCodeExpiry != undefined && user.passwordResetCodeExpiry != null && user.passwordResetCodeExpiry > new Date()) {
    throw new BadRequestError('error.resetCodeSent');
  }


  const token = randomUUID().slice(0, 6).toUpperCase();
  await userRepository.updatePasswordResetToken(user.email, token);

  await sendPasswordResetEmail({ email: user.email, firstName: user.firstName }, token, language);

  return;
};

/*************************VERIFY PASSWORD RESET CODE************************************/
export const verifyPasswordResetCode = async (email: string, token: string) => {
  const user = await userRepository.getUserByEmail(email.toLowerCase());

  if (!user) {
    throw new NotFoundError('error.noUserFoundInDB');
  }

  if (user.passwordResetCodeExpiry) {
    const now = new Date();
    const expiryDate = user.passwordResetCodeExpiry;

    if (expiryDate.getTime() <= now.getTime()) {
      throw new BadRequestError("error.verificationCodeIsAlreadyExpired")
    }
  }

  if (user.passwordResetCode != token) {
    throw new BadRequestError("error.codeInvalid")
  }

  return;
};

/*************************UPDATE PASSWORD FUNCTION************************************/
export const updatePassword = async (email: string, password: string, token: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  await userRepository.updatePassword(email.toLowerCase(), hashedPassword, token);
  return;
};


/*************************SIGN IN FUNCTION************************************/
export const signIn = async (email: string, password: string) => {
  const user = await userRepository.getUserByEmail(email.toLowerCase());
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
      role: user.role,
      document_id: user.document_id,
      document_type: user.document_type
    }
  };
};

/*************************CREATE RESERVE USER FUNCTION************************************/

export const createReserveUser = async (data: ReserveFormDto): Promise<User> => {

  const userExistant = await userRepository.getUserByEmail(data.user_email ? data.user_email.toLowerCase() : "");
  if (!userExistant) {

    return await userRepository.createClientUser(
      {
        role: Role.CLIENT,
        document_type: data.user_document_type ?? "",
        document_id: data.user_document_id ?? "",
        firstName: data.user_firstname ?? "",
        lastName: data.user_lastname ?? "",
        phoneNumber: data.user_phone_number ?? "",
        email: data.user_email ?? "",
        password: randomUUID().slice(0, 6),
        isDisabled: false,
        emailVerified: false
      }
    );
  }

  return userExistant;
}

/*************************VERIFY USER AND NOTIFY USER ************************************/
export const confirmReservation = async (reserveId: number, language: string) => {

  const reserve = await reserveRepository.getReserveDtoById(reserveId);

  if (!reserve) {
    throw new NotFoundError('error.noReservefoundInDB');
  }

  const user = await userRepository.getUserById(reserve.userId);

  if (!user) {
    throw new NotFoundError('error.noUserFoundInDB')
  }

  const password = utils.generateRandomPassword();
  const hashedPassword = await bcrypt.hash(password, 10);

  if (!user.emailVerified) {
    await userRepository.updateEmailVerified(user.email);
    await userRepository.updatePasswordWithoutToken(user.email.toLowerCase(), hashedPassword);
  }

  await sendConfirmationReservationEmail({ email: user.email, firstName: user.firstName, password }, reserve, language)
}

