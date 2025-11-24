/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

// 1. Konfiguracija Transportera
// UVEK koristi App Password, ne običnu šifru!
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dajashopnis@gmail.com", // ZAMENI
    pass: "kgegneigjhgsrfnk", // ZAMENI (16 slova)
  },
});

// 2. Helper za novac
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 0,
  }).format(amount);
};

// 3. Glavna funkcija (v2 Sintaksa)
export const sendOrderConfirmation = onDocumentCreated(
  {
    // Obavezno stavi regiju gde ti je Firestore (po grešci je to europe-west3)
    region: "europe-west3",
    document: "orders/{orderId}",
  },
  async (event) => {
    // U v2, snapshot je u event.data
    const snapshot = event.data;

    // Ako nema podataka (npr. brisanje), prekini
    if (!snapshot) {
      return;
    }

    const order = snapshot.data();
    const orderId = event.params.orderId;

    if (!order || !order.customer || !order.items) {
      console.log("Nedostaju podaci porudžbine.");
      return;
    }

    // Generisanje HTML tabele
    const itemsHtml = order.items
      .map(
        (item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #333; color: #f5f6f7;">
          ${item.name} <br>
          <span style="font-size: 12px; color: #8b8f98;">Kol: ${item.qty}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: right; color: #c8a94e; font-weight: bold;">
          ${formatMoney(item.price * item.qty)}
        </td>
      </tr>
    `
      )
      .join("");

    // HTML Email Template
    const mailOptions = {
      from: '"Daja Shop" <tvoj_email@gmail.com>', // ZAMENI I OVDE
      to: order.customer.email,
      subject: `Potvrda porudžbine #${orderId} - Daja Shop`,
      html: `
        <div style="font-family: sans-serif; background-color: #0b0e12; color: #f5f6f7; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #151923; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
            
            <div style="background-color: #000; padding: 20px; text-align: center; border-bottom: 2px solid #c8a94e;">
              <h1 style="color: #c8a94e; margin: 0; font-size: 24px; text-transform: uppercase;">Daja Shop</h1>
            </div>

            <div style="padding: 30px;">
              <h2 style="color: #fff; margin-top: 0;">Hvala na poverenju, ${
                order.customer.name
              }!</h2>
              <p style="color: #8b8f98; line-height: 1.5;">
                Vaša porudžbina <strong>#${orderId}</strong> je uspešno primljena.
              </p>

              <div style="background-color: #1f2937; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #8b8f98;">Podaci za dostavu</h3>
                <p style="margin: 0; color: #fff;">
                  ${order.customer.name} ${order.customer.surname}<br>
                  ${order.customer.address}<br>
                  ${order.customer.postalCode} ${order.customer.city}<br>
                  Telefon: ${order.customer.phone}
                </p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                ${itemsHtml}
              </table>

              <div style="text-align: right; padding-top: 10px; border-top: 1px solid #333;">
                <p style="margin: 5px 0; color: #8b8f98;">Dostava: <span style="color: #fff;">${
                  order.shippingCost
                    ? formatMoney(order.shippingCost)
                    : "Besplatna"
                }</span></p>
                <p style="margin: 10px 0; font-size: 20px; font-weight: bold; color: #c8a94e;">
                  Ukupno: ${formatMoney(order.finalTotal)}
                </p>
              </div>
            </div>

            <div style="background-color: #000; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p>© ${new Date().getFullYear()} Daja Shop. Sva prava zadržana.</p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email poslat: ${order.customer.email}`);
    } catch (error) {
      console.error("Greška pri slanju:", error);
    }
  }
);

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
