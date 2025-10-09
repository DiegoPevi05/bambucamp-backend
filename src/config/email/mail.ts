import nodemailer, { TransportOptions } from 'nodemailer';
import {ReserveDto} from '../../dto/reserve';
import { generateComplaintFormTemplateAdmin, generateComplaintFormTemplateUser, generateContactFormTemplateUser,generateContactFormTemplateAdmin, generateVerificationLinkTemplate, generateResetPasswordTemplate, generateReservationTemplate, generateNewReservationTemplateUser  } from './helper';

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
    //console.log('Email sent: ' + info.response);
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

const sendComplaintFormConfirmation = async(props:{ email:string, name:string }, language:string) => {
  const { email, name } = props;
  const chosenLanguage = language === 'es' ? 'es' : 'en';

  const emailTemplate = generateComplaintFormTemplateUser(name, chosenLanguage);

  await sendEmail(email, language === 'en' ? 'We received your complaint' : 'Hemos recibido tu reclamo', emailTemplate);
}

const sendComplaintFormAdmin = async(props:{ email:string, name:string, phone:string, documentId:string, claimType:string, description:string, reservationCode?:string }, language:string) => {
  const { email, name, phone, documentId, claimType, description, reservationCode } = props;
  const chosenLanguage = language === 'es' ? 'es' : 'en';

  const emailTemplate = generateComplaintFormTemplateAdmin({
    name,
    email,
    phone,
    documentId,
    claimType,
    description,
    reservationCode,
  }, chosenLanguage);

  await sendEmail(ADMIN_EMAIL , language === 'en' ? 'New complaint received' : 'Nuevo reclamo recibido', emailTemplate);
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

const sendNewReservationEmailUser = async(user: { email:string, firstName:string}, reserve:ReserveDto, language:string  ) => {

  const { email, firstName } = user;
  const chosenLanguage = language === 'es' ? 'es' : 'en'; 

  let emailTemplate = generateNewReservationTemplateUser(firstName, reserve,chosenLanguage);

  await sendEmail(email, language === 'en' ? 'Thanks for your reserve' : 'Gracias por realizar tu reserva', emailTemplate);
}

const sendNewReservationEmailAdmin = async(user: { email:string, firstName:string }, reserve:ReserveDto, language:string  ) => {

  const { email, firstName } = user;
  const chosenLanguage = language === 'es' ? 'es' : 'en'; 

  let title = language == "es" ? "Nueva Reserva" : "New Reserve"
  let greeting_message_1  = language == "es" ? `El usuario ${firstName}, con correo ${email} ha realizado una reserva, puedes confirmarla en el panel de administrador` : `User ${firstName}, with email ${email} has made a new reservation, you can confirm it in the admin panel` ;
  let greeting_message_2  = language == "es" ? "Aqui estan los detalles de la reserva." : "Here’s their reservation details"  

  let emailTemplate = generateReservationTemplate(title,greeting_message_1,greeting_message_2,"", reserve,chosenLanguage);

  await sendEmail(ADMIN_EMAIL, language === 'en' ? 'New Reservation' : 'Nueva reserva', emailTemplate);
}

const sendConfirmationReservationEmail = async(user: { email:string, firstName:string, password:string }, reserve:ReserveDto, language:string  ) => {
  const { email, password } = user;
  const chosenLanguage = language === 'es' ? 'es' : 'en'; 
  let title = language == "es" ? "Gracias por tu confianza" : "Thanks for your trust"
  let greeting_message_1  = language == "es" ? "Esperamos disfrutes tu reserva." : "Hope you enjoy your reservation " ;
  let greeting_message_2  = language == "es" ? "Aqui estan los detalles de tu reserva." : "Here’s your reservation details"  

  const admin_panel_link = `${CLIENT_HOSTNAME}/dashboard`;
  let greeting_message_3  = language == "es" ? `Puedes ingresar al panel para hacer seguimiento de tu reserva con el siguiente  <a href="${admin_panel_link} target="_blank"> enlace</a>, tu contraseña de cliente es ${password}, el usuario para ingresar es el correo con el que has hecho la reserva.` : `You can access to the dashboard to do the follow up of your reservation in the following link  <a href="${admin_panel_link} target="_blank"> link</a>, your client password is ${password}, the user to log in the emaila address wich you made the reserve.`;  

  let emailTemplate = generateReservationTemplate(title,greeting_message_1,greeting_message_2,greeting_message_3, reserve,chosenLanguage);

  await sendEmail(email, language === 'en' ? 'Reservation confirmed' : 'Reservacion confirmada', emailTemplate);
}


export {
  sendContactFormConfirmation,
  sendContactFormAdmin,
  sendComplaintFormConfirmation,
  sendComplaintFormAdmin,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNewReservationEmailUser,
  sendNewReservationEmailAdmin,
  sendConfirmationReservationEmail
};
