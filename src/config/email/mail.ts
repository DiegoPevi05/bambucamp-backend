import nodemailer, { TransportOptions } from 'nodemailer';
import fs from 'fs';
import path from 'path';
import {ReserveDto} from '../../dto/reserve';
import * as utils from '../../lib/utils';

// Load SMTP configuration from environment variables
const HOSTNAME = process.env.HOSTNAME || `http://localhost:${process.env.PORT}`;
const CLIENT_HOSTNAME =  process.env.CLIENT_HOSTNAME || 'http://localhost:5174';

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

// Function to send verification email
const sendVerificationEmail = async (user: { email: string; firstName: string }, verificationCode: string, language:string) => {
  const verificationLink = `${CLIENT_HOSTNAME}/validated-account?email=${user.email}&code=${verificationCode}`;
  const chosenLanguage = language === 'es' ? 'es' : 'en'; 
  const templatePath = path.join(__dirname, `templates/verification-email-${chosenLanguage}.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders with actual values
  emailTemplate = emailTemplate.replace('{{name}}', user.firstName);
  emailTemplate = emailTemplate.replace('{{verificationLink}}', verificationLink);
  emailTemplate = emailTemplate.replace('{{currentYear}}', new Date().getFullYear().toString());

  await sendEmail(user.email, language === 'en' ? 'Verify Your Email' : 'Validar Correo Electronico', emailTemplate);
};



// Function to send password reset email
const sendPasswordResetEmail = async (user: { email: string; firstName: string }, resetCode: string, language:string) => {

  const chosenLanguage = language === 'es' ? 'es' : 'en'; 

  const templatePath = path.join(__dirname, `templates/reset-password-${chosenLanguage}.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders with actual values
  emailTemplate = emailTemplate.replace('{{name}}', user.firstName);
  emailTemplate = emailTemplate.replace('{{code}}', resetCode);
  emailTemplate = emailTemplate.replace('{{currentYear}}', new Date().getFullYear().toString());

  await sendEmail(user.email, language === 'en' ? 'Reset Your Password' : 'Recuperar contraseña', emailTemplate);
};

const sendReservationEmail = async(user: { email:string, firstName:string }, reserve:ReserveDto, language:string  ) => {

  const chosenLanguage = language === 'es' ? 'es' : 'en'; 
  const templatePath = path.join(__dirname, `templates/reservation-${chosenLanguage}.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');

  let tentsHtml = '';

  reserve.tents.forEach(tent => {
    const tentHtml = `
                  <tr>
                    <td class="email-reserve-content-structure">
                      <table cellpadding="0" cellspacing="0" class="email-reserve-content-left">
                        <tbody>
                          <tr>
                            <td class="email-reserve-content-structure-frame">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td align="center" class="email-reserve-block-image"
                                      ><a target="_blank"
                                        href="https://viewstripo.email"><img class="email-reserve-block-image-img"
                                          src="https://tlr.stripocdn.email/content/guids/CABINET_66f950c6b738d24a0c0ae438e5a17e95/images/70881620388152279.jpg"
                                          alt=${"image-reserve-"+tent.idTent}"image-reserve" ></a></td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table cellpadding="0" cellspacing="0" class="email-reserve-content-right">
                        <tbody>
                          <tr>
                            <td class="email-reserve-content-container-frame">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td class="email-reserve-content-header">
                                      <h3>${tent.name}</h3>
                                      <p class="email-reserve-content-paragraph">
                                        <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Desde" : "From" }</span>:&nbsp;${utils.formatDate(tent.dateFrom)}&nbsp;<br>
                                        <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Hasta" : "To" }</span>:&nbsp;${utils.formatDate(tent.dateTo)}&nbsp;<br>
                                        <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Personas" : "People" }</span>:&nbsp;${tent.nights}&nbsp;<br>
                                        <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Precio" : "Price" }</span>:&nbsp;${utils.formatPrice(tent.price)}/${chosenLanguage == "es" ? "por" : "per" }&nbsp;${chosenLanguage == "es" ? "noche" : "night" }<br>
                                        <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Qty. noches" : "Qty. nights" }</span>:&nbsp;${tent.nights}<br>
                                        <span class="email-reserve-content-label">&nbsp;${utils.formatPrice(tent.price)}&nbsp;x&nbsp;${tent.nights}&nbsp;${chosenLanguage == "es" ? "noches" : "nights" }</span><br>
                                        <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Total" : "Total" }</span>:&nbsp;${utils.formatPrice(tent.price*tent.nights)}<br>
                                      </p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
    `;
    tentsHtml += tentHtml;
  });

  // Replace the placeholder in the template with the generated tents HTML
  emailTemplate = emailTemplate.replace('{{tents}}', tentsHtml);

  let experiencesHtml = '';

  reserve.experiences.forEach(experience => {
    const experienceHtml = `
          <tr>
            <td class="email-reserve-content-header">
              <p class="email-reserve-content-experience-paragraph">
                <span class="email-reserve-content-label">${experience.name}</span>&nbsp;
              </p>
              <p class="email-reserve-content-experience-paragraph">
                  <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Dia" : "Day" }</span>:&nbsp;${utils.formatDateToYYYYMMDD(experience.day)}&nbsp;
              </p>
              <p class="email-reserve-content-experience-paragraph">
                  <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Precio" : "price" }</span>:&nbsp;${utils.formatPrice(experience.price)}/${chosenLanguage == "es" ? "por" : "per" }&nbsp;${chosenLanguage == "es" ? "cantidad" : "quantity" }
              </p>
              <p class="email-reserve-content-experience-paragraph">
                  <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Cantidad" : "Quantity" }</span>:&nbsp;${experience.quantity}&nbsp;
              </p>
              <p class="email-reserve-content-experience-paragraph">
                  <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Total" : "Total" }</span>:&nbsp;${utils.formatPrice(experience.price * experience.quantity)}
              </p>
            </td>
          </tr>
    `;
    experiencesHtml += experienceHtml;
  });

  // Replace the placeholder in the template with the generated tents HTML
  emailTemplate = emailTemplate.replace('{{experiences}}', experiencesHtml);

  let productsHtml = '';

  reserve.products.forEach(product => {
    const productHtml = `
        <tr>
          <td class="email-reserve-content-header">
            <p class="email-reserve-content-product-paragraph">
              <span class="email-reserve-content-label">${product.name}</span>&nbsp;
            </p>
            <p class="email-reserve-content-product-paragraph">
              <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Precio" : "price" }</span>:&nbsp;${utils.formatPrice(product.price)}/${chosenLanguage == "es" ? "por" : "per" }&nbsp;${chosenLanguage == "es" ? "cantidad" : "quantity" }
            </p>
            <p class="email-reserve-content-product-paragraph">
                <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Cantidad" : "Quantity" }</span>:&nbsp;${product.quantity}&nbsp;
            </p>
            <p class="email-reserve-content-product-paragraph">
                <span class="email-reserve-content-label">${chosenLanguage == "es" ? "Total" : "Total" }</span>:&nbsp;${utils.formatPrice(product.quantity * product.price)}
            </p>
          </td>
        </tr>
    `;
    productsHtml += productHtml;
  });

  emailTemplate = emailTemplate.replace('{{products}}', productsHtml);

  // Replace the placeholder in the template with the generated tents HTML
  emailTemplate = emailTemplate.replace('{{idReserve}}', "BAMBU-001");
  emailTemplate = emailTemplate.replace('{{netImport}}', utils.formatPrice(reserve.net_import));
  emailTemplate = emailTemplate.replace('{{discounted}}', reserve.discount.toString()+"%");
  emailTemplate = emailTemplate.replace('{{grossImport}}', utils.formatPrice(reserve.gross_import));
  emailTemplate = emailTemplate.replace('{{currentYear}}', new Date().getFullYear().toString());

  await sendEmail(user.email, language === 'en' ? 'Reservation confirmed' : 'Reservacion confirmada', emailTemplate);
}

export {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendReservationEmail
};
