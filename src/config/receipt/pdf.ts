import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import {ReserveDto} from '../../dto/reserve';
import {formatDateToYYYYMMDD, formatPrice, getRangeDatesForReserve} from '../../lib/utils';
import {BadRequestError} from '../../middleware/errors';

const CLIENT_HOSTNAME =  process.env.CLIENT_HOSTNAME || 'http://localhost:5174';

export const generateSalesNote = async (reserve:ReserveDto, t: (key: string) => string):Promise<Buffer|undefined> => {
    try {

        // Load the HTML template from the file system

        const templatePath = path.join(__dirname, `templates/sales_note.html`);
        const templateContent = fs.readFileSync(templatePath, 'utf8');

        // Compile the template using Handlebars
        const template = handlebars.compile(templateContent);

        // Extract dynamic data from request or a database
        const data = {
            external_id: reserve.external_id,
            username: `${reserve.user_name ?? ""} | ${reserve.user_email ?? ""}`,
            CheckIn: `${getRangeDatesForReserve(reserve)[0].label}`,
            CheckOut: `${getRangeDatesForReserve(reserve)[1].label}`,
            gross_import: `${reserve.gross_import}`,
            discounted_import: `${((reserve.discount / 100) * reserve.gross_import)}`,
            net_import: `${reserve.net_import}`,
            link_web_page: CLIENT_HOSTNAME,
            web_page: CLIENT_HOSTNAME,
            promotions_items: '',
            tents_items: '',
            experiences_items: '',
            products_items: ''
        };

        // Generate promotion items
        if (reserve.promotions.length > 0) {
            let promotionsItems = '';
            reserve.promotions.forEach((promotion, index) => {
                promotionsItems += `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${promotion.name}</td>
                    <td>${t("reserve.unit")}</td>
                    <td>${formatPrice(promotion.price)}</td>
                    <td>1</td>
                    <td>${formatPrice(promotion.price)}</td>
                  </tr>
                `;
            });
            data.promotions_items = promotionsItems;
        }

        // Generate tent items
        if (reserve.tents.length > 0) {
            let tentsItems = '';
            reserve.tents.forEach((tent, index) => {
                tentsItems += `
                  <tr>
                    <td>${reserve.promotions.length + index + 1}</td>
                    <td>${tent.name} | ${t("reserve.from")}: ${formatDateToYYYYMMDD(tent.dateFrom)} ${t("reserve.to")}: ${formatDateToYYYYMMDD(tent.dateTo)} ${tent.aditionalPeople > 0 ? `| ADP:${tent.aditionalPeople} ADPP: ${formatPrice(tent.aditionalPeoplePrice ?? 0)}` : ""}</td>
                    <td>${t("reserve.nights")}</td>
                    <td>${formatPrice(tent.price + (tent.aditionalPeople * (tent.aditionalPeoplePrice ?? 0)))}</td>
                    <td>${tent.nights}</td>
                    <td>${formatPrice(tent.price * tent.nights + ((tent.aditionalPeoplePrice ?? 0) * tent.aditionalPeople * tent.nights))}</td>
                  </tr>
                `;
            });
            data.tents_items = tentsItems;
        }

        // Generate experience items
        if (reserve.experiences.length > 0) {
            let experiencesItems = '';
            reserve.experiences.forEach((experience, index) => {
                experiencesItems += `
                  <tr>
                    <td>${reserve.promotions.length + reserve.tents.length + index + 1}</td>
                    <td>${experience.name} | ${t("reserve.day_of_experience")} ${formatDateToYYYYMMDD(experience.day)}</td>
                    <td>${t("reserve.unit")}</td>
                    <td>${formatPrice(experience.price)}</td>
                    <td>${experience.quantity}</td>
                    <td>${formatPrice(experience.price * experience.quantity)}</td>
                  </tr>
                `;
            });
            data.experiences_items = experiencesItems;
        }

        // Generate product items
        if (reserve.products.length > 0) {
            let productsItems = '';
            reserve.products.forEach((product, index) => {
                productsItems += `
                  <tr>
                    <td>${reserve.promotions.length + reserve.tents.length + reserve.experiences.length + index + 1}</td>
                    <td>${product.name}</td>
                    <td>${t("reserve.unit")}</td>
                    <td>${formatPrice(product.price)}</td>
                    <td>${product.quantity}</td>
                    <td>${formatPrice(product.price * product.quantity)}</td>
                  </tr>
                `;
            });
            data.products_items = productsItems;
        }

        // Compile the final HTML
        const filledHtml = template(data);

        // Launch Puppeteer and generate the PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Set the HTML content for the PDF
        await page.setContent(filledHtml, { waitUntil: 'load' });

        // Generate the PDF buffer as a Uint8Array
        const pdfArray = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        await browser.close();

        // Convert Uint8Array to Buffer
        const pdfBuffer = Buffer.from(pdfArray);

        // Return the PDF as a Buffer
        return pdfBuffer;

    } catch (error) {
        console.error('Error generating sales note PDF:', error);
        throw new BadRequestError("error.failedToGeneratePDF");
    }
};
