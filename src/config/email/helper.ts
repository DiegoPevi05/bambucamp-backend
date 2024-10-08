import fs from 'fs';
import path from 'path';
import {ReserveDto} from '../../dto/reserve';
import * as utils from '../../lib/utils';

// Load SMTP configuration from environment variables
const CLIENT_HOSTNAME =  process.env.CLIENT_HOSTNAME || 'http://localhost:5174';

type TemplateData = {
  header: string;
  footer: string;
};

export const generateTemplate = (language: string): TemplateData => {
  const data_email = {
    homepage: CLIENT_HOSTNAME,
    logo_link: `${CLIENT_HOSTNAME}/backend-public/logo.png`,
    tent_link: `${CLIENT_HOSTNAME}/backend-public/tent.jpg`,
    reservation_label: language === "es" ? "RESERVAR" : "RESERVATION",
    reservation_link: `${CLIENT_HOSTNAME}/booking`,
    glampings_label: language === "es" ? "GLAMPINGS" : "GLAMPINGS",
    glampings_link: `${CLIENT_HOSTNAME}/booking`,
    extras_label: language === "es" ? "EXPERIENCIAS" : "EXPERIENCES",
    extras_link: `${CLIENT_HOSTNAME}/booking`,
    blog_label: language === "es" ? "BLOG" : "BLOG",
    blog_link: CLIENT_HOSTNAME,
    home_label: language === "es" ? "Inicio" : "Home",
    home_link: CLIENT_HOSTNAME,
    about_label: language === "es" ? "Nosotros" : "About Us",
    about_link: CLIENT_HOSTNAME,
    activities_label: language === "es" ? "Actividades" : "Activities",
    activities_link: CLIENT_HOSTNAME,
    contact_us_label: language === "es" ? "Contactanos" : "Contact Us",
    contact_us_link: CLIENT_HOSTNAME,
    checkout_label: language === "es" ? "Checkout" : "Checkout",
    checkout_link: CLIENT_HOSTNAME,
    facebook: "https://www.facebook.com/bambucamp",
    instagram: "https://www.instagram.com/bambucamp_glamping/",
    politics_label_1: language === "es" ? "Estas recibiendo este correo porque has visitado nuestro sitio web o nos has pedido el newsletter regular. Asegúrate que nuestros mensajes te lleguen a tu bandeja principal (y no se vayan a la bandeja de spam o no deseado)." : "You are receiving this email because you have visited our site or asked us about the regular newsletter. Make sure our messages get to your Inbox (and not your bulk or junk folders).",
    politics_label_2: language === "es" ? "Política de Privacidad" : "Privacy Policy",
    politics_link: CLIENT_HOSTNAME,
    footer_caption: language === "es" ? "Bambucamp Glamping Todos los derechos reservados." : "Bambucamp Glamping all rights reserved.",
    current_year: new Date().getFullYear().toString(),
  };

  const templateHeaderPath = path.join(__dirname, 'templates/header.html');
  const templateFooterPath = path.join(__dirname, 'templates/footer.html');

  let templateContentHeader = fs.readFileSync(templateHeaderPath, 'utf8');
  let templateContentFooter = fs.readFileSync(templateFooterPath, 'utf8');

  // Replace placeholders in header
  templateContentHeader = templateContentHeader.replace('{{homepage}}', data_email.homepage)
    .replace('{{logo_link}}', data_email.logo_link)
    .replace('{{reservation_label}}', data_email.reservation_label)
    .replace('{{reservation_link}}', data_email.reservation_link)
    .replace('{{glampings_label}}', data_email.glampings_label)
    .replace('{{glampings_link}}', data_email.glampings_link)
    .replace('{{extras_label}}', data_email.extras_label)
    .replace('{{extras_link}}', data_email.extras_link)
    .replace('{{blog_label}}', data_email.blog_label)
    .replace('{{blog_link}}', data_email.blog_link);

  // Replace placeholders in footer
  templateContentFooter = templateContentFooter.replace('{{home_link}}', data_email.home_link)
    .replace('{{logo_link}}', data_email.logo_link)
    .replace('{{home_label}}', data_email.home_label)
    .replace('{{about_label}}', data_email.about_label)
    .replace('{{about_link}}', data_email.about_link)
    .replace('{{activities_label}}', data_email.activities_label)
    .replace('{{activities_link}}', data_email.activities_link)
    .replace('{{contact_us_label}}', data_email.contact_us_label)
    .replace('{{contact_us_link}}', data_email.contact_us_link)
    .replace('{{checkout_label}}', data_email.checkout_label)
    .replace('{{checkout_link}}', data_email.checkout_link)
    .replace('{{homepage}}', data_email.homepage)
    .replace('{{tent_link}}', data_email.tent_link)
    .replace('{{politics_label_1}}', data_email.politics_label_1)
    .replace('{{politics_label_2}}', data_email.politics_label_2)
    .replace('{{footer_caption}}', data_email.footer_caption)
    .replace('{{currentYear}}', data_email.current_year);

  return { header: templateContentHeader, footer: templateContentFooter };
};

export const generateContactFormTemplateUser = (name:string , language:string):string => {

  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/contact-form-user-email.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate.replace('{{title}}', language == "es" ? "Formulario Web de Contacto" : "Web Contact Form" );
  emailTemplate = emailTemplate.replace('{{greeting_hi}}', language == "es" ? "Hola" : "Hi" );
  emailTemplate = emailTemplate.replace('{{greeting_message}}', language == "es" ? "Gracias por contactarnos estaremos en contacto muy pronto." : "Thanks for contact us we will be in touch very soon." );

  emailTemplate = emailTemplate.replace('{{name}}', name);

  // Inject header and footer into content
  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;
}

export const generateContactFormTemplateAdmin = (name:string, email:string, message:string, language:string):string =>  {

  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/contact-form-admin-email.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate.replace('{{title}}', language == "es" ? "Formulario Web de Contacto" : "Web Contact Form" );
  emailTemplate = emailTemplate.replace('{{greeting}}', language == "es" ? `Hola ,${name} con email ${email} te ha dejado un mensaje` : `Hi ,${name} with email ${email} leave you a message.`);
  emailTemplate = emailTemplate.replace('{{message}}', message);

  // Inject header and footer into content
  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;
}

export const generateVerificationLinkTemplate = (name:string , verificationLink:string, language:string):string => {

  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/verification-email.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate.replace('{{title}}', language == "es" ? "Verificacion de Cuenta" : "Verification of Account" );
  emailTemplate = emailTemplate.replace('{{greeting_hi}}', language == "es" ? "Hola" : "Hi" );
  emailTemplate = emailTemplate.replace('{{greeting_message}}', language == "es" ? "Por favor verifica tu correo electronico haciendo click en el enlace abajo" : "Please verify your email clicking in the link" );
  emailTemplate = emailTemplate.replace('{{verification_link_label}}', language == "es" ? "Verificar Correo" : "Verify Email");

  emailTemplate = emailTemplate.replace('{{verification_link}}', verificationLink);
  emailTemplate = emailTemplate.replace('{{name}}', name);

  // Inject header and footer into content
  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;
}


export const generateResetPasswordTemplate = (name:string , code:string, language:string):string => {

  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/reset-password.html.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate.replace('{{title}}', language == "es" ? "Restauracion de Cuenta" : "Restoration of Account" );
  emailTemplate = emailTemplate.replace('{{greeting_hi}}', language == "es" ? "Hola" : "Hi" );
  emailTemplate = emailTemplate.replace('{{greeting_message}}', language == "es" ? "Aqui esta tu codigo de restauracion de contraseña" : "Here’s your restoration password code" );
  emailTemplate = emailTemplate.replace('{{code}}', code);
  emailTemplate = emailTemplate.replace('{{name}}', name);

  // Inject header and footer into content
  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;
}

export const generateNewReservationTemplateUser = (firstName:string,reserve:ReserveDto, language:string):string => {
  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/new-reserve.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate.replace('{{title}}', language == "es" ? "Gracias por realizar tu reserva" : "Thanks for your reservation" );
  emailTemplate = emailTemplate.replace('{{greeting_message}}', language == "es" ? `Hola ${firstName}, tu reserva se encuentra en proceso, sigue los siguientes pasos para confirmar tu reserva.` : `Hi ${firstName}, your reservation is in process, folow the indications to confirm your reservation.` );
  emailTemplate = emailTemplate.replace('{{indications_header}}', language == "es" ? "Por favor, realiza el pago del 50% en cualquiera de las siguientes cuentas, una vez realizado el pago enviar el comprobante de pago mediante whatsapp a +51 120-000-000: " : "Please make a 50% payment to one of the following accounts, once the payment is made send the payment receipt through whatsapp to +51 120-000-000: " );
  emailTemplate = emailTemplate.replace('{{indication_1}}',"BBVA 1-00-0000-00000-0 o BCP 1-00-000-0000-00000.");
  emailTemplate = emailTemplate.replace('{{indication_2}}', language == "es" ? "Yape +51 120-200-400" : "Plin +51 120-200-200" );

  emailTemplate = emailTemplate.replace('{{subtotal_label}}', language == "es" ? "SubTotal" : "SubTotal" );
  emailTemplate = emailTemplate.replace('{{discount_label}}', language == "es" ? "Descuento" : "Discount" );
  emailTemplate = emailTemplate.replace('{{total_label}}', language == "es" ? "Total" : "Total" );

  emailTemplate = emailTemplate.replace('{{reserve_label}}', language == "es" ? "RESERVA" : "RESERVE" );
  emailTemplate = emailTemplate.replace('{{idReserve}}', reserve.external_id);
  emailTemplate = emailTemplate.replace('{{grossImport}}', utils.formatPrice(reserve.gross_import));
  emailTemplate = emailTemplate.replace('{{discounted}}', reserve.discount.toString()+"%");
  emailTemplate = emailTemplate.replace('{{netImport}}', utils.formatPrice(reserve.net_import));

  // Inject header and footer into content
  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;
};


export const generateReservationTemplate = (title:string, greeting_message_1:string, greeting_message_2:string,greeting_message_3:string,reserve:ReserveDto,language:string):string => {

  const { header, footer } = generateTemplate(language);

  const templatePath = path.join(__dirname, `templates/reservation.html`);
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');

  emailTemplate = emailTemplate.replace('{{title}}', title);
  emailTemplate = emailTemplate.replace('{{greeting_message_1}}', greeting_message_1);
  emailTemplate = emailTemplate.replace('{{greeting_message_2}}', greeting_message_2);
  emailTemplate = emailTemplate.replace('{{greeting_message_3}}', greeting_message_3);

  emailTemplate = emailTemplate.replace('{{reserve_label}}', language == "es" ? "RESERVA" : "RESERVE" );
  emailTemplate = emailTemplate.replace('{{experiences_label}}', language == "es" ? "Experiencias" : "Experiencies" );
  emailTemplate = emailTemplate.replace('{{products_label}}', language == "es" ? "Productos" : "Products" );
  emailTemplate = emailTemplate.replace('{{subtotal_label}}', language == "es" ? "SubTotal" : "SubTotal" );
  emailTemplate = emailTemplate.replace('{{discount_label}}', language == "es" ? "Descuento" : "Discount" );
  emailTemplate = emailTemplate.replace('{{total_label}}', language == "es" ? "Total" : "Total" );

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
                                        <span class="email-reserve-content-label">${language == "es" ? "Desde" : "From" }</span>:&nbsp;${utils.formatDate(tent.dateFrom)}&nbsp;<br>
                                        <span class="email-reserve-content-label">${language == "es" ? "Hasta" : "To" }</span>:&nbsp;${utils.formatDate(tent.dateTo)}&nbsp;<br>
                                        <span class="email-reserve-content-label">${language == "es" ? "Personas" : "People" }</span>:&nbsp;${tent.nights}&nbsp;<br>
                                        <span class="email-reserve-content-label">${language == "es" ? "Precio" : "Price" }</span>:&nbsp;${utils.formatPrice(tent.price)}/${language == "es" ? "por" : "per" }&nbsp;${language == "es" ? "noche" : "night" }<br>
                                        <span class="email-reserve-content-label">${language == "es" ? "Qty. noches" : "Qty. nights" }</span>:&nbsp;${tent.nights}<br>
                                        <span class="email-reserve-content-label">&nbsp;${utils.formatPrice(tent.price)}&nbsp;x&nbsp;${tent.nights}&nbsp;${language == "es" ? "noches" : "nights" }</span><br>
                                        <span class="email-reserve-content-label">${language == "es" ? "Total" : "Total" }</span>:&nbsp;${utils.formatPrice(tent.price*tent.nights)}<br>
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
                  <span class="email-reserve-content-label">${language == "es" ? "Dia" : "Day" }</span>:&nbsp;${utils.formatDateToYYYYMMDD(experience.day)}&nbsp;
              </p>
              <p class="email-reserve-content-experience-paragraph">
                  <span class="email-reserve-content-label">${language == "es" ? "Precio" : "price" }</span>:&nbsp;${utils.formatPrice(experience.price)}/${language == "es" ? "por" : "per" }&nbsp;${language == "es" ? "cantidad" : "quantity" }
              </p>
              <p class="email-reserve-content-experience-paragraph">
                  <span class="email-reserve-content-label">${language == "es" ? "Cantidad" : "Quantity" }</span>:&nbsp;${experience.quantity}&nbsp;
              </p>
              <p class="email-reserve-content-experience-paragraph">
                  <span class="email-reserve-content-label">${language == "es" ? "Total" : "Total" }</span>:&nbsp;${utils.formatPrice(experience.price * experience.quantity)}
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
              <span class="email-reserve-content-label">${language == "es" ? "Precio" : "price" }</span>:&nbsp;${utils.formatPrice(product.price)}/${language == "es" ? "por" : "per" }&nbsp;${language == "es" ? "cantidad" : "quantity" }
            </p>
            <p class="email-reserve-content-product-paragraph">
                <span class="email-reserve-content-label">${language == "es" ? "Cantidad" : "Quantity" }</span>:&nbsp;${product.quantity}&nbsp;
            </p>
            <p class="email-reserve-content-product-paragraph">
                <span class="email-reserve-content-label">${language == "es" ? "Total" : "Total" }</span>:&nbsp;${utils.formatPrice(product.quantity * product.price)}
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
  emailTemplate = emailTemplate.replace('{{discounted}}', reserve.discount.toString()+"%");
  emailTemplate = emailTemplate.replace('{{netImport}}', utils.formatPrice(reserve.net_import));



  // Inject header and footer into content
  emailTemplate = emailTemplate.replace('{{header_email}}', header).replace('{{footer_email}}', footer);

  return emailTemplate;

}


