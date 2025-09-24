import fs from 'fs';
import path from 'path';
import { ReserveDto } from '../../dto/reserve';
import * as utils from '../../lib/utils';

// Load SMTP configuration from environment variables
const CLIENT_HOSTNAME = process.env.CLIENT_HOSTNAME || 'http://localhost:5174';

const escapeHtmlAttr = (s: string) =>
  s.replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Generic replacer for ALL placeholders using a single pass + global regex
const replaceAllPlaceholders = (tpl: string, data: Record<string, string>) => {
  const keys = Object.keys(data).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (keys.length === 0) return tpl;
  const re = new RegExp(`{{(${keys.join("|")})}}`, "g");
  return tpl.replace(re, (_, key) => data[key]);
};

const formatImagePath = (image: string): string => {
  image = image.replace(/\\/g, '/'); // Assign the result of replace to image
  image = image.replace("public", `${CLIENT_HOSTNAME}/backend-public`); // Same here
  return image;
};

type TemplateData = {
  header: string;
  footer: string;
};

export const generateTemplate = (language: string): TemplateData => {
  const data_email = {
    homepage: escapeHtmlAttr(CLIENT_HOSTNAME),
    logo_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/backend-public/logo.png`),
    tent_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/backend-public/tent.jpeg`),

    reservation_label: language === "es" ? "RESERVAR" : "RESERVATION",
    reservation_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/booking`),

    glampings_label: language === "es" ? "GLAMPINGS" : "GLAMPINGS",
    glampings_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/booking`),

    extras_label: language === "es" ? "EXPERIENCIAS" : "EXPERIENCES",
    extras_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/booking`),

    about_header_label: language === "es" ? "NOSOTROS" : "ABOUT",
    about_header_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/about`),

    home_label: language === "es" ? "Inicio" : "Home",
    home_link: escapeHtmlAttr(CLIENT_HOSTNAME),

    about_label: language === "es" ? "Nosotros" : "About Us",
    about_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/about`),

    activities_label: language === "es" ? "Actividades" : "Activities",
    activities_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/services/aventura`),

    contact_us_label: language === "es" ? "Contactanos" : "Contact Us",
    contact_us_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/contact`),

    facebook: escapeHtmlAttr("https://www.facebook.com/bambucamp"),
    instagram: escapeHtmlAttr("https://www.instagram.com/bambucamp_glamping/"),

    politics_label_1: language === "es"
      ? "Estas recibiendo este correo porque has visitado nuestro sitio web o nos has pedido el newsletter regular. Asegúrate que nuestros mensajes te lleguen a tu bandeja principal (y no se vayan a la bandeja de spam o no deseado)."
      : "You are receiving this email because you have visited our site or asked us about the regular newsletter. Make sure our messages get to your Inbox (and not your bulk or junk folders).",

    politics_label_2: language === "es" ? "Política de Privacidad" : "Privacy Policy",
    politics_link: escapeHtmlAttr(CLIENT_HOSTNAME),

    footer_caption: language === "es"
      ? "Bambucamp Glamping Todos los derechos reservados."
      : "Bambucamp Glamping all rights reserved.",

    currentYear: new Date().getFullYear().toString(), // match {{currentYear}} exactly
  };

  const templateHeaderPath = path.join(__dirname, "templates/header.html");
  const templateFooterPath = path.join(__dirname, "templates/footer.html");

  let templateContentHeader = fs.readFileSync(templateHeaderPath, "utf8");
  let templateContentFooter = fs.readFileSync(templateFooterPath, "utf8");

  // 2) Single-pass replacements for ALL placeholders present in the files
  templateContentHeader = replaceAllPlaceholders(templateContentHeader, data_email);
  templateContentFooter = replaceAllPlaceholders(templateContentFooter, data_email);

  return { header: templateContentHeader, footer: templateContentFooter };
};

export const generateContactFormTemplateUser = (name: string, language: string): string => {

  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/contact-form-user-email.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate.replace('{{title}}', language == "es" ? "Formulario Web de Contacto" : "Web Contact Form");
  emailTemplate = emailTemplate.replace('{{greeting_hi}}', language == "es" ? "Hola" : "Hi");
  emailTemplate = emailTemplate.replace('{{greeting_message}}', language == "es" ? "Gracias por contactarnos estaremos en contacto muy pronto." : "Thanks for contact us we will be in touch very soon.");

  emailTemplate = emailTemplate.replace('{{name}}', name);

  // Inject header and footer into content
  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;
}

export const generateContactFormTemplateAdmin = (name: string, email: string, message: string, language: string): string => {

  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/contact-form-admin-email.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate.replace('{{title}}', language == "es" ? "Formulario Web de Contacto" : "Web Contact Form");
  emailTemplate = emailTemplate.replace('{{greeting}}', language == "es" ? `Hola ,${name} con email ${email} te ha dejado un mensaje` : `Hi ,${name} with email ${email} leave you a message.`);
  emailTemplate = emailTemplate.replace('{{message}}', message);

  // Inject header and footer into content
  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;
}

export const generateComplaintFormTemplateUser = (name: string, language: string): string => {

  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/complaint-form-user-email.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate.replace('{{title}}', language == "es" ? "Libro de Reclamaciones" : "Complaint Form");
  emailTemplate = emailTemplate.replace('{{greeting_hi}}', language == "es" ? "Hola" : "Hi");
  emailTemplate = emailTemplate.replace('{{greeting_message}}', language == "es" ? "Hemos recibido tu reclamo y nos pondremos en contacto muy pronto." : "We have received your complaint and will contact you shortly.");

  emailTemplate = emailTemplate.replace('{{name}}', name);

  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;
}

export const generateComplaintFormTemplateAdmin = (
  complaint: { name: string; email: string; phone: string; documentId: string; claimType: string; description: string; reservationCode?: string },
  language: string
): string => {

  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/complaint-form-admin-email.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate.replace('{{title}}', language == "es" ? "Nuevo reclamo recibido" : "New Complaint Form");
  const intro = language == "es" ? "Se ha recibido un nuevo registro en el libro de reclamaciones con los siguientes datos:" : "A new complaint has been submitted with the following details:";
  emailTemplate = emailTemplate.replace('{{intro}}', intro);
  emailTemplate = emailTemplate.replace('{{name}}', complaint.name);
  emailTemplate = emailTemplate.replace('{{email}}', complaint.email);
  emailTemplate = emailTemplate.replace('{{phone}}', complaint.phone);
  emailTemplate = emailTemplate.replace('{{documentId}}', complaint.documentId);
  emailTemplate = emailTemplate.replace('{{claimType}}', complaint.claimType);
  emailTemplate = emailTemplate.replace('{{description}}', complaint.description);
  const reservationLabel = complaint.reservationCode && complaint.reservationCode.trim().length > 0 ? complaint.reservationCode : (language == "es" ? "No proporcionado" : "Not provided");
  emailTemplate = emailTemplate.replace('{{reservationCode}}', reservationLabel);
  emailTemplate = emailTemplate.replace('{{label_name}}', language == "es" ? "Nombre:" : "Name:");
  emailTemplate = emailTemplate.replace('{{label_email}}', language == "es" ? "Email:" : "Email:");
  emailTemplate = emailTemplate.replace('{{label_phone}}', language == "es" ? "Teléfono:" : "Phone:");
  emailTemplate = emailTemplate.replace('{{label_document}}', language == "es" ? "Documento:" : "Document:");
  emailTemplate = emailTemplate.replace('{{label_claim_type}}', language == "es" ? "Tipo de reclamo:" : "Claim type:");
  emailTemplate = emailTemplate.replace('{{label_reservation}}', language == "es" ? "Código de reserva:" : "Reservation code:");
  emailTemplate = emailTemplate.replace('{{label_description}}', language == "es" ? "Descripción:" : "Description:");

  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;
}

export const generateVerificationLinkTemplate = (name: string, verificationLink: string, language: string): string => {

  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/verification-email.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate.replace('{{title}}', language == "es" ? "Verificacion de Cuenta" : "Verification of Account");
  emailTemplate = emailTemplate.replace('{{greeting_hi}}', language == "es" ? "Hola" : "Hi");
  emailTemplate = emailTemplate.replace('{{greeting_message}}', language == "es" ? "Por favor verifica tu correo electronico haciendo click en el enlace abajo" : "Please verify your email clicking in the link");
  emailTemplate = emailTemplate.replace('{{verification_link_label}}', language == "es" ? "Verificar Correo" : "Verify Email");

  emailTemplate = emailTemplate.replace('{{verification_link}}', verificationLink);
  emailTemplate = emailTemplate.replace('{{name}}', name);

  // Inject header and footer into content
  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;
}


export const generateResetPasswordTemplate = (name: string, code: string, language: string): string => {

  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/reset-password.html.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate.replace('{{title}}', language == "es" ? "Restauracion de Cuenta" : "Restoration of Account");
  emailTemplate = emailTemplate.replace('{{greeting_hi}}', language == "es" ? "Hola" : "Hi");
  emailTemplate = emailTemplate.replace('{{greeting_message}}', language == "es" ? "Aqui esta tu codigo de restauracion de contraseña" : "Here’s your restoration password code");
  emailTemplate = emailTemplate.replace('{{code}}', code);
  emailTemplate = emailTemplate.replace('{{name}}', name);

  // Inject header and footer into content
  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;
}

export const generateNewReservationTemplateUser = (firstName: string, reserve: ReserveDto, language: string): string => {
  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/new-reserve.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate.replace('{{title}}', language == "es" ? "Gracias por realizar tu reserva" : "Thanks for your reservation");
  emailTemplate = emailTemplate.replace('{{greeting_message}}', language == "es" ? `Hola ${firstName}, tu reserva se encuentra en proceso, sigue los siguientes pasos para confirmar tu reserva.` : `Hi ${firstName}, your reservation is in process, folow the indications to confirm your reservation.`);
  emailTemplate = emailTemplate.replace('{{indications_header}}', language == "es" ? "Por favor, realiza el pago del 50% en cualquiera de las siguientes cuentas, una vez realizado el pago enviar el comprobante de pago mediante whatsapp a +51 120-000-000: " : "Please make a 50% payment to one of the following accounts, once the payment is made send the payment receipt through whatsapp to +51 120-000-000: ");
  emailTemplate = emailTemplate.replace('{{indication_1}}', "BBVA 1-00-0000-00000-0 o BCP 1-00-000-0000-00000.");
  emailTemplate = emailTemplate.replace('{{indication_2}}', language == "es" ? "Yape +51 120-200-400" : "Plin +51 120-200-200");

  emailTemplate = emailTemplate.replace('{{subtotal_label}}', language == "es" ? "SubTotal" : "SubTotal");
  emailTemplate = emailTemplate.replace('{{discount_label}}', language == "es" ? "Descuento" : "Discount");
  emailTemplate = emailTemplate.replace('{{total_label}}', language == "es" ? "Total" : "Total");

  emailTemplate = emailTemplate.replace('{{reserve_label}}', language == "es" ? "RESERVA" : "RESERVE");
  emailTemplate = emailTemplate.replace('{{idReserve}}', reserve.external_id);
  emailTemplate = emailTemplate.replace('{{grossImport}}', utils.formatPrice(reserve.gross_import));
  emailTemplate = emailTemplate.replace('{{discounted}}', reserve.discount.toString() + "%");
  emailTemplate = emailTemplate.replace('{{netImport}}', utils.formatPrice(reserve.net_import));

  // Inject header and footer into content
  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;
};


export const generateReservationTemplate = (title: string, greeting_message_1: string, greeting_message_2: string, greeting_message_3: string, reserve: ReserveDto, language: string): string => {

  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/reservation.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');

  emailTemplate = emailTemplate.replace('{{title}}', title);
  emailTemplate = emailTemplate.replace('{{greeting_message_1}}', greeting_message_1);
  emailTemplate = emailTemplate.replace('{{greeting_message_2}}', greeting_message_2);
  emailTemplate = emailTemplate.replace('{{greeting_message_3}}', greeting_message_3);

  emailTemplate = emailTemplate.replace('{{reserve_label}}', language == "es" ? "RESERVA" : "RESERVE");
  emailTemplate = emailTemplate.replace('{{experiences_label}}', language == "es" ? "Experiencias" : "Experiencies");
  emailTemplate = emailTemplate.replace('{{products_label}}', language == "es" ? "Productos" : "Products");
  emailTemplate = emailTemplate.replace('{{subtotal_label}}', language == "es" ? "SubTotal" : "SubTotal");
  emailTemplate = emailTemplate.replace('{{discount_label}}', language == "es" ? "Descuento" : "Discount");
  emailTemplate = emailTemplate.replace('{{total_label}}', language == "es" ? "Total" : "Total");

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
                                        href="${CLIENT_HOSTNAME}"><img class="email-reserve-block-image-img"
                                          src=${`${formatImagePath(tent.tentDB?.images[0] ?? "none")}`}
                                          alt=${"image-reserve-" + tent.idTent}"image-reserve" ></a></td>
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
                                        <span class="email-reserve-content-label">${language == "es" ? "Desde" : "From"}</span>:&nbsp;${utils.formatDate(tent.dateFrom)}&nbsp;<br>
                                        <span class="email-reserve-content-label">${language == "es" ? "Hasta" : "To"}</span>:&nbsp;${utils.formatDate(tent.dateTo)}&nbsp;<br>
                                        <span class="email-reserve-content-label">${language == "es" ? "Personas" : "People"}</span>:&nbsp;${tent.nights}&nbsp;<br>
                                        <span class="email-reserve-content-label">${language == "es" ? "Precio" : "Price"}</span>:&nbsp;${utils.formatPrice(tent.price)}/${language == "es" ? "por" : "per"}&nbsp;${language == "es" ? "noche" : "night"}<br>
                                        <span class="email-reserve-content-label">${language == "es" ? "Qty. noches" : "Qty. nights"}</span>:&nbsp;${tent.nights}<br>
                                        <span class="email-reserve-content-label">&nbsp;${utils.formatPrice(tent.price)}&nbsp;x&nbsp;${tent.nights}&nbsp;${language == "es" ? "noches" : "nights"}</span><br>
                                        <span class="email-reserve-content-label">${language == "es" ? "Total" : "Total"}</span>:&nbsp;${utils.formatPrice(tent.price * tent.nights)}<br>
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
                  <span class="email-reserve-content-label">${language == "es" ? "Dia" : "Day"}</span>:&nbsp;${utils.formatDateToYYYYMMDD(experience.day)}&nbsp;
              </p>
              <p class="email-reserve-content-experience-paragraph">
                  <span class="email-reserve-content-label">${language == "es" ? "Precio" : "price"}</span>:&nbsp;${utils.formatPrice(experience.price)}/${language == "es" ? "por" : "per"}&nbsp;${language == "es" ? "cantidad" : "quantity"}
              </p>
              <p class="email-reserve-content-experience-paragraph">
                  <span class="email-reserve-content-label">${language == "es" ? "Cantidad" : "Quantity"}</span>:&nbsp;${experience.quantity}&nbsp;
              </p>
              <p class="email-reserve-content-experience-paragraph">
                  <span class="email-reserve-content-label">${language == "es" ? "Total" : "Total"}</span>:&nbsp;${utils.formatPrice(experience.price * experience.quantity)}
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
              <span class="email-reserve-content-label">${language == "es" ? "Precio" : "price"}</span>:&nbsp;${utils.formatPrice(product.price)}/${language == "es" ? "por" : "per"}&nbsp;${language == "es" ? "cantidad" : "quantity"}
            </p>
            <p class="email-reserve-content-product-paragraph">
                <span class="email-reserve-content-label">${language == "es" ? "Cantidad" : "Quantity"}</span>:&nbsp;${product.quantity}&nbsp;
            </p>
            <p class="email-reserve-content-product-paragraph">
                <span class="email-reserve-content-label">${language == "es" ? "Total" : "Total"}</span>:&nbsp;${utils.formatPrice(product.quantity * product.price)}
            </p>
          </td>
        </tr>
    `;
    productsHtml += productHtml;
  });

  emailTemplate = emailTemplate.replace('{{products}}', productsHtml);

  // Replace the placeholder in the template with the generated tents HTML
  emailTemplate = emailTemplate.replace('{{idReserve}}', reserve.external_id);
  emailTemplate = emailTemplate.replace('{{grossImport}}', utils.formatPrice(reserve.gross_import));
  emailTemplate = emailTemplate.replace('{{discounted}}', reserve.discount.toString() + "%");
  emailTemplate = emailTemplate.replace('{{netImport}}', utils.formatPrice(reserve.net_import));



  // Inject header and footer into content
  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;

}


