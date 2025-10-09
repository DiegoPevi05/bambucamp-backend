import fs from 'fs';
import path from 'path';
import { ReserveDto } from '../../dto/reserve';
import * as utils from '../../lib/utils';
import { getImageUrl, ImageVariant } from '../../lib/image';

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

const formatImagePath = (image: string, variant: ImageVariant = 'normal'): string => {

  if (!image) {
    return image;
  }

  return getImageUrl(image, { size: variant, basePath: `${CLIENT_HOSTNAME}/backend-public` });
};

type TemplateData = {
  header: string;
  footer: string;
};

type TemplateOpts = {
  preheaderText?: string; // optional
};

export const generateTemplate = (language: string, opts: TemplateOpts = {}): TemplateData => {
  const preheaderText = (opts.preheaderText ?? "").trim();

  // Hidden preheader (only if provided)
  const preheader_block = preheaderText
    ? [
        // visible to inbox preview, hidden in email body
        `<div style="display:none!important;visibility:hidden;mso-hide:all;`,
        `font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:transparent;">`,
        `${escapeHtmlAttr(preheaderText)}`,
        `</div>`,
        // spacer to keep menu links from leaking into preview
        `<div style="display:none!important;visibility:hidden;mso-hide:all;`,
        `font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:transparent;">`,
        `&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;`,
        `</div>`
      ].join("")
    : "";

  const data_email = {
    homepage: escapeHtmlAttr(CLIENT_HOSTNAME),
    logo_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/backend-public/logo.png`),
    tent_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/backend-public/tent.jpg`),

    reservation_label: language === "es" ? "RESERVAR" : "RESERVATION",
    reservation_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/booking`),

    glampings_label: language === "es" ? "GLAMPINGS" : "GLAMPINGS",
    glampings_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/about`),

    extras_label: language === "es" ? "EXPERIENCIAS" : "EXPERIENCES",
    extras_link: escapeHtmlAttr(`${CLIENT_HOSTNAME}/services/amor`),

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
    preheader_block
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

const buildReserveDetailsHTML = (reserve: ReserveDto, language: string) => {
  let tentsHtml = "";
  let experiencesHtml = "";
  let productsHtml = "";

  // --- Tents: match the original working structure & classes ---
  reserve.tents.forEach((tent) => {
    const nightlyBase = tent.price;
    const nightlyTotal = tent.price + tent.kids_price + tent.additional_people_price;
    const effectiveExtraAdults = tent.additional_people ?? 0;
    const extraAdultPrice = tent.additional_people_price ?? 0;
    const kidsCount = tent.kids ?? 0;
    const kidsBundlePrice = tent.kids_price ?? 0;
    const kidsBundleApplies = tent.kids_price > 0;

    const perWord = language == "es" ? "por" : "per";
    const nightWord = language == "es" ? "noche" : "night";
    const baseNightlyLabel = language == "es" ? "Tarifa base por noche" : "Base nightly rate";
    const nightlyTotalLabel = language == "es" ? "Tarifa por noche con adicionales" : "Nightly total";
    const extraAdultsLabel = language == "es" ? "Adultos adicionales" : "Extra adults";
    const kidsLabel = language == "es" ? "Niños" : "Kids";
    const kidsBundleLabel = language == "es" ? "Bundle de niños" : "Kids bundle";
    const nightsLabel = language == "es" ? "Cantidad de noches" : "Qty. nights";
    const totalLabel = language == "es" ? "Total" : "Total";
    const fromLabel = language == "es" ? "Desde" : "From";
    const toLabel = language == "es" ? "Hasta" : "To";

    const extraAdultsLine =
      effectiveExtraAdults > 0
        ? `<span class="email-reserve-content-label">${extraAdultsLabel}</span>:&nbsp;${effectiveExtraAdults}&nbsp;x&nbsp;${utils.formatPrice(extraAdultPrice)}/${perWord}&nbsp;${nightWord}<br>`
        : "";
    const kidsCountLine =
      kidsCount > 0 ? `<span class="email-reserve-content-label">${kidsLabel}</span>:&nbsp;${kidsCount}<br>` : "";
    const kidsBundleLine = kidsBundleApplies
      ? `<span class="email-reserve-content-label">${kidsBundleLabel}</span>:&nbsp;${utils.formatPrice(kidsBundlePrice)}/${perWord}&nbsp;${nightWord}<br>`
      : "";

    tentsHtml += `
      <tr>
        <td class="email-reserve-content-structure">
          <table cellpadding="0" cellspacing="0" class="email-reserve-content-left">
            <tbody>
              <tr>
                <td class="email-reserve-content-structure-frame">
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tbody>
                      <tr>
                        <td align="center" class="email-reserve-block-image">
                          <a target="_blank" href="${CLIENT_HOSTNAME}">
                            <img class="email-reserve-block-image-img"
                                 src="${formatImagePath(tent.tentDB?.images?.[0] ?? "", "small")}"
                                 alt="image-reserve-${tent.idTent}">
                          </a>
                        </td>
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
                            <span class="email-reserve-content-label">${fromLabel}</span>:&nbsp;${utils.formatDate(tent.dateFrom)}&nbsp;<br>
                            <span class="email-reserve-content-label">${toLabel}</span>:&nbsp;${utils.formatDate(tent.dateTo)}&nbsp;<br>
                            ${kidsCountLine}
                            ${extraAdultsLine}
                            ${kidsBundleLine}
                            <span class="email-reserve-content-label">${baseNightlyLabel}</span>:&nbsp;${utils.formatPrice(nightlyBase)}/${perWord}&nbsp;${nightWord}<br>
                            <span class="email-reserve-content-label">${nightlyTotalLabel}</span>:&nbsp;${utils.formatPrice(nightlyTotal)}/${perWord}&nbsp;${nightWord}<br>
                            <span class="email-reserve-content-label">${nightsLabel}</span>:&nbsp;${tent.nights}<br>
                            <span class="email-reserve-content-label">${totalLabel}</span>:&nbsp;${utils.formatPrice(nightlyTotal * tent.nights)}<br>
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
      </tr>`;
  });

  // --- Experiences: keep your original classes; no inline color overrides ---
  reserve.experiences.forEach((experience) => {
    experiencesHtml += `
      <tr>
        <td class="email-reserve-content-header">
          <p class="email-reserve-content-experience-paragraph">
            <span class="email-reserve-content-label">${experience.name}</span>&nbsp;
          </p>
          <p class="email-reserve-content-experience-paragraph">
            <span class="email-reserve-content-label">${language == "es" ? "Dia" : "Day"}</span>:&nbsp;${utils.formatDateToYYYYMMDD(experience.day)}&nbsp;
          </p>
          <p class="email-reserve-content-experience-paragraph">
            <span class="email-reserve-content-label">${language == "es" ? "Precio" : "Price"}</span>:&nbsp;${utils.formatPrice(experience.price)}/${language == "es" ? "por" : "per"}&nbsp;${language == "es" ? "cantidad" : "quantity"}
          </p>
          <p class="email-reserve-content-experience-paragraph">
            <span class="email-reserve-content-label">${language == "es" ? "Cantidad" : "Quantity"}</span>:&nbsp;${experience.quantity}&nbsp;
          </p>
          <p class="email-reserve-content-experience-paragraph">
            <span class="email-reserve-content-label">${language == "es" ? "Total" : "Total"}</span>:&nbsp;${utils.formatPrice(experience.price * experience.quantity)}
          </p>
        </td>
      </tr>`;
  });

  // --- Products: same idea ---
  reserve.products.forEach((product) => {
    productsHtml += `
      <tr>
        <td class="email-reserve-content-header">
          <p class="email-reserve-content-product-paragraph">
            <span class="email-reserve-content-label">${product.name}</span>&nbsp;
          </p>
          <p class="email-reserve-content-product-paragraph">
            <span class="email-reserve-content-label">${language == "es" ? "Precio" : "Price"}</span>:&nbsp;${utils.formatPrice(product.price)}/${language == "es" ? "por" : "per"}&nbsp;${language == "es" ? "cantidad" : "quantity"}
          </p>
          <p class="email-reserve-content-product-paragraph">
              <span class="email-reserve-content-label">${language == "es" ? "Cantidad" : "Quantity"}</span>:&nbsp;${product.quantity}&nbsp;
          </p>
          <p class="email-reserve-content-product-paragraph">
              <span class="email-reserve-content-label">${language == "es" ? "Total" : "Total"}</span>:&nbsp;${utils.formatPrice(product.quantity * product.price)}
          </p>
        </td>
      </tr>`;
  });

  return { tentsHtml, experiencesHtml, productsHtml };
};

export const generateNewReservationTemplateUser = (
  firstName: string,
  reserve: ReserveDto,
  language: string
): string => {

  const preheader = language === "es"
    ? `Reserva ${reserve.external_id} — Total ${utils.formatPrice(reserve.net_import)}. Sigue los pasos para confirmar.`
    : `Reservation ${reserve.external_id} — Total ${utils.formatPrice(reserve.net_import)}. Follow the steps to confirm.`;

  const { header, footer } = generateTemplate(language, { preheaderText: preheader });

  // Static config (can move to env if you prefer)
  const RESERVAS_EMAIL = "reservas@bambucamp.com";
  const WHATSAPP_URL = "https://wa.link/ioswo5";
  const QR_NAME = "CRIALCA S.A.C";
  const BBVA_ACCOUNT = "0011-0341-0200476632";
  const BBVA_CCI = "011-341-000200476632-51";
  const BBVA_OWNER = "CRIALCA S.A.C - RUC 20602767532";
  const QR_LINK = escapeHtmlAttr(`${CLIENT_HOSTNAME}/backend-public/qr_bambucamp.png`);

  // i18n strings
  const i18n =
    language === "es"
      ? {
          title: "Gracias por realizar tu reserva",
          greeting_message: `Hola ${firstName}, tu reserva se encuentra en proceso. Sigue los pasos para confirmar tu reserva.`,
          deposit_title: "Depósito del 50%",
          deposit_instructions: `Realiza un depósito del 50% del total por cualquiera de los métodos abajo. Luego, envía tu comprobante a ${RESERVAS_EMAIL} indicando tu nombre, apellido y el correo con el que realizaste la reserva. Si prefieres, también puedes enviarlo por WhatsApp.`,
          payment_methods_title: "Métodos de pago",
          payment_methods_intro: "Puedes pagar por QR (Plin) o por transferencia bancaria.",
          qr_title: "Plin (QR)",
          qr_badge: "QR seguro",
          payment_qr_alt: "Código QR de pago",
          qr_note: "Escanea el código con tu app bancaria o Plin.",
          account_holder_label: "Titular",
          bank_title: "Transferencia bancaria",
          bank_badge: "BBVA",
          bank_account_label: "Cuenta",
          bank_cci_label: "CCI",
          bank_holder_label: "Titular",
          send_receipt_note_prefix: "Envía el comprobante a",
          send_receipt_or: "o por",
          reserve_label: "RESERVA",
          experiences_label: "Experiencias",
          products_label: "Productos",
          subtotal_label: "SubTotal",
          discount_label: "Descuento",
          total_label: "Total",
        }
      : {
          title: "Thanks for your reservation",
          greeting_message: `Hi ${firstName}, your reservation is in process. Please follow the steps below to confirm it.`,
          deposit_title: "50% Deposit",
          deposit_instructions: `Make a 50% deposit using any of the methods below. Then email your receipt to ${RESERVAS_EMAIL} including your first name, last name, and the email you used to book. You may also send it via WhatsApp.`,
          payment_methods_title: "Payment methods",
          payment_methods_intro: "You can pay using QR (Plin) or bank transfer.",
          qr_title: "Plin (QR)",
          qr_badge: "Secure QR",
          payment_qr_alt: "Payment QR code",
          qr_note: "Scan this code with your banking app or Plin.",
          account_holder_label: "Account holder",
          bank_title: "Bank transfer",
          bank_badge: "BBVA",
          bank_account_label: "Account",
          bank_cci_label: "CCI (interbank code)",
          bank_holder_label: "Account holder",
          send_receipt_note_prefix: "Send the receipt to",
          send_receipt_or: "or via",
          reserve_label: "RESERVE",
          experiences_label: "Experiences",
          products_label: "Products",
          subtotal_label: "SubTotal",
          discount_label: "Discount",
          total_label: "Total",
        };

  // Load template
  const templatePath = path.join(__dirname, `templates/new-reserve.html`);
  let emailTemplate = fs.readFileSync(templatePath, "utf8");

  // Build detailed sections (tents/experiences/products)
  const { tentsHtml, experiencesHtml, productsHtml } = buildReserveDetailsHTML(reserve, language);

  // Map placeholders for single-pass replacement
  const data = {
    // Header/Footer
    header_email: header,
    footer_email: footer,

    // Title + intro + deposit
    title: i18n.title,
    greeting_message: i18n.greeting_message,
    deposit_title: i18n.deposit_title,
    deposit_instructions: i18n.deposit_instructions,

    // Payment methods
    payment_methods_title: i18n.payment_methods_title,
    payment_methods_intro: i18n.payment_methods_intro,

    // QR block
    qr_title: i18n.qr_title,
    qr_badge: i18n.qr_badge,
    payment_qr_alt: i18n.payment_qr_alt,
    qr_note: i18n.qr_note,
    account_holder_label: i18n.account_holder_label,
    qr_name_value: QR_NAME,
    qr_link: QR_LINK,

    // Bank block
    bank_title: i18n.bank_title,
    bank_badge: i18n.bank_badge,
    bank_account_label: i18n.bank_account_label,
    bank_cci_label: i18n.bank_cci_label,
    bank_holder_label: i18n.bank_holder_label,
    bbva_account: BBVA_ACCOUNT,
    bbva_cci: BBVA_CCI,
    bbva_owner: BBVA_OWNER,

    // Send proof note
    send_receipt_note_prefix: i18n.send_receipt_note_prefix,
    send_receipt_or: i18n.send_receipt_or,
    reservas_email: RESERVAS_EMAIL,
    whatsapp_url: WHATSAPP_URL,

    // Detail sections (appear in your new-reserve.html “Totales + código…” area)
    reserve_label: i18n.reserve_label,
    idReserve: reserve.external_id,
    tents: tentsHtml,
    experiences_label: i18n.experiences_label,
    experiences: experiencesHtml,
    products_label: i18n.products_label,
    products: productsHtml,

    // Totals
    grossImport: utils.formatPrice(reserve.gross_import),
    discounted: `${reserve.discount}%`,
    netImport: utils.formatPrice(reserve.net_import),
    subtotal_label: i18n.subtotal_label,
    discount_label: i18n.discount_label,
    total_label: i18n.total_label,
  };

  emailTemplate = replaceAllPlaceholders(emailTemplate, data);
  return emailTemplate;
};


/*export const generateReservationTemplate = (title: string, greeting_message_1: string, greeting_message_2: string, greeting_message_3: string, reserve: ReserveDto, language: string): string => {

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
    const nightlyBase = tent.price;
    const nightlyTotal =  tent.price + tent.kids_price + tent.additional_people_price;
    const effectiveExtraAdults = tent.additional_people ?? 0;
    const extraAdultPrice = tent.additional_people_price ?? 0;
    const kidsCount = tent.kids ?? 0;
    const kidsBundlePrice = tent.kids_price ?? 0;
    const kidsBundleApplies = tent.kids_price > 0;
    const perWord = language == "es" ? "por" : "per";
    const nightWord = language == "es" ? "noche" : "night";
    const baseNightlyLabel = language == "es" ? "Tarifa base por noche" : "Base nightly rate";
    const nightlyTotalLabel = language == "es" ? "Tarifa por noche con adicionales" : "Nightly total";
    const extraAdultsLabel = language == "es" ? "Adultos adicionales" : "Extra adults";
    const kidsLabel = language == "es" ? "Niños" : "Kids";
    const kidsBundleLabel = language == "es" ? "Bundle de niños" : "Kids bundle";
    const nightsLabel = language == "es" ? "Cantidad de noches" : "Qty. nights";
    const totalLabel = language == "es" ? "Total" : "Total";
    const fromLabel = language == "es" ? "Desde" : "From";
    const toLabel = language == "es" ? "Hasta" : "To";

    const extraAdultsLine = effectiveExtraAdults > 0
      ? `<span class="email-reserve-content-label">${extraAdultsLabel}</span>:&nbsp;${effectiveExtraAdults}&nbsp;x&nbsp;${utils.formatPrice(extraAdultPrice)}/${perWord}&nbsp;${nightWord}<br>`
      : '';
    const kidsCountLine = kidsCount > 0
      ? `<span class="email-reserve-content-label">${kidsLabel}</span>:&nbsp;${kidsCount}<br>`
      : '';
    const kidsBundleLine = kidsBundleApplies
      ? `<span class="email-reserve-content-label">${kidsBundleLabel}</span>:&nbsp;${utils.formatPrice(kidsBundlePrice)}/${perWord}&nbsp;${nightWord}<br>`
      : '';

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
                                          src=${`${formatImagePath(tent.tentDB?.images[0] ?? '', 'small')}`}
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
                                        <span class="email-reserve-content-label">${fromLabel}</span>:&nbsp;${utils.formatDate(tent.dateFrom)}&nbsp;<br>
                                        <span class="email-reserve-content-label">${toLabel}</span>:&nbsp;${utils.formatDate(tent.dateTo)}&nbsp;<br>
                                        ${kidsCountLine}
                                        ${extraAdultsLine}
                                        ${kidsBundleLine}
                                        <span class="email-reserve-content-label">${baseNightlyLabel}</span>:&nbsp;${utils.formatPrice(nightlyBase)}/${perWord}&nbsp;${nightWord}<br>
                                        <span class="email-reserve-content-label">${nightlyTotalLabel}</span>:&nbsp;${utils.formatPrice(nightlyTotal)}/${perWord}&nbsp;${nightWord}<br>
                                        <span class="email-reserve-content-label">${nightsLabel}</span>:&nbsp;${tent.nights}<br>
                                        <span class="email-reserve-content-label">${totalLabel}</span>:&nbsp;${utils.formatPrice(nightlyTotal * tent.nights)}<br>
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

}*/

export const generateReservationTemplate = (
  title: string,
  greeting_message_1: string,
  greeting_message_2: string,
  greeting_message_3: string,
  reserve: ReserveDto,
  language: string
): string => {

  const preheader = language === "es"
    ? `Reserva ${reserve.external_id} — Total ${utils.formatPrice(reserve.net_import)}.`
    : `Reservation ${reserve.external_id} — Total ${utils.formatPrice(reserve.net_import)}.`;

  const { header, footer } = generateTemplate(language, { preheaderText: preheader });

  const templatePath = path.join(__dirname, `templates/reservation.html`);
  let emailTemplate = fs.readFileSync(templatePath, "utf8");

  // Build details once
  const { tentsHtml, experiencesHtml, productsHtml } = buildReserveDetailsHTML(reserve, language);

  // Labels/i18n
  const labels =
    language === "es"
      ? {
          reserve_label: "RESERVA",
          experiences_label: "Experiencias",
          products_label: "Productos",
          subtotal_label: "SubTotal",
          discount_label: "Descuento",
          total_label: "Total",
        }
      : {
          reserve_label: "RESERVE",
          experiences_label: "Experiences",
          products_label: "Products",
          subtotal_label: "SubTotal",
          discount_label: "Discount",
          total_label: "Total",
        };

  // One-pass replacement
  const data = {
    header_email: header,
    footer_email: footer,
    title,
    greeting_message_1,
    greeting_message_2,
    greeting_message_3,

    reserve_label: labels.reserve_label,
    experiences_label: labels.experiences_label,
    products_label: labels.products_label,
    subtotal_label: labels.subtotal_label,
    discount_label: labels.discount_label,
    total_label: labels.total_label,

    tents: tentsHtml,
    experiences: experiencesHtml,
    products: productsHtml,

    idReserve: reserve.external_id,
    grossImport: utils.formatPrice(reserve.gross_import),
    discounted: `${reserve.discount}%`,
    netImport: utils.formatPrice(reserve.net_import),
  };

  emailTemplate = replaceAllPlaceholders(emailTemplate, data);
  return emailTemplate;
};
