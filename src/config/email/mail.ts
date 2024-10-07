import nodemailer, { TransportOptions } from 'nodemailer';
import {ReserveDto} from '../../dto/reserve';
import { generateContactFormTemplateUser,generateContactFormTemplateAdmin, generateVerificationLinkTemplate, generateResetPasswordTemplate, generateReservationTemplate  } from './helper';

// Load SMTP configuration from environment variables
const CLIENT_HOSTNAME =  process.env.CLIENT_HOSTNAME || 'http://localhost:5174';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "diegopevi05@gmail.com";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

interface MailOptions extends TransportOptions {
  host: string | undefined;
  port: number;
  secure: boolean;
  auth: {
    user: string | undefined;
    pass: string | undefined;
  };
}

// Define SMTP transport options
const transportOptions: MailOptions = {
  host: smtpHost,
  port: smtpPort,
  secure: true, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
};

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport(transportOptions);

// Utility function to send an email
const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: smtpUser,
    to,
    subject,
    html,
  };

  try {
    const info:any = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};

const sendContactFormConfirmation = async(props:{ email:string, name:string }, language:string) => {
  const { email, name } = props;
  const chosenLanguage = language === 'es' ? 'es' : 'en'; 

  let emailTemplate = generateContactFormTemplateUser(name,chosenLanguage);

  await sendEmail(email, language === 'en' ? 'Thanks for contact us' : 'Gracias por contactarnos', emailTemplate);

}

const sendContactFormAdmin = async(props:{ email:string, name:string, message:string }, language:string) => {
  const { email, name, message } = props;
  const chosenLanguage = language === 'es' ? 'es' : 'en'; 

  let emailTemplate = generateContactFormTemplateAdmin(name,email,message,chosenLanguage);

  await sendEmail(ADMIN_EMAIL , language === 'en' ? 'Someone wants to contact' : 'Alguien quiere contactarte', emailTemplate);

}

// Function to send verification email
const sendVerificationEmail = async (user: { email: string; firstName: string }, verificationCode: string, language:string) => {
  const { email, firstName } = user;
  const verificationLink = `${CLIENT_HOSTNAME}/validated-account?email=${user.email}&code=${verificationCode}`;
  const chosenLanguage = language === 'es' ? 'es' : 'en'; 

  let emailTemplate = generateVerificationLinkTemplate(firstName,verificationLink,chosenLanguage)

  await sendEmail(email, language === 'en' ? 'Verify Your Email' : 'Validar Correo Electronico', emailTemplate);
};



// Function to send password reset email
const sendPasswordResetEmail = async (user: { email: string; firstName: string }, resetCode: string, language:string) => {

  const { email, firstName } = user;
  const chosenLanguage = language === 'es' ? 'es' : 'en'; 

  let emailTemplate = generateResetPasswordTemplate(firstName, resetCode, chosenLanguage);

  await sendEmail(email, language === 'en' ? 'Reset Your Password' : 'Recuperar contraseña', emailTemplate);
};

const sendReservationEmail = async(user: { email:string, firstName:string }, reserve:ReserveDto, language:string  ) => {

  const { email } = user;
  const chosenLanguage = language === 'es' ? 'es' : 'en'; 

  let emailTemplate = generateReservationTemplate(reserve,chosenLanguage);

  await sendEmail(email, language === 'en' ? 'Reservation confirmed' : 'Reservacion confirmada', emailTemplate);
}

export {
  sendContactFormConfirmation,
  sendContactFormAdmin,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendReservationEmail
};
