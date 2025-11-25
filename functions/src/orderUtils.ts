// functions/src/orderUtils.ts
import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { transporter } from "./transporter";
import { formatMoney } from "./helpers";

// Inicijalizacija ako već nije urađena
if (admin.apps.length === 0) {
  admin.initializeApp();
}

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
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px 0; vertical-align: top;">
          <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; color: #000000; display: block; margin-bottom: 4px;">
            ${item.name}
          </span>
          <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #6b7280;">
            Količina: ${item.qty}
          </span>
        </td>
        <td style="padding: 16px 0; vertical-align: top; text-align: right;">
          <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 500; color: #000000;">
            ${formatMoney(item.price * item.qty)}
          </span>
        </td>
      </tr>
    `
      )
      .join("");

    // HTML Email Template - "Pure Black & White" Minimalist
    const mailOptions = {
      from: '"Daja Shop" <tvoj_email@gmail.com>',
      to: order.customer.email,
      subject: `Potvrda porudžbine #${orderId} - Daja Shop`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Potvrda porudžbine</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 4px; border: 1px solid #e5e7eb; overflow: hidden;">
            
            <div style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f3f4f6;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #000000; letter-spacing: -1px; text-transform: uppercase;">
                DajaShop
              </h1>
            </div>

            <div style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; padding: 6px 12px; background-color: #f3f4f6; color: #4b5563; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 16px; letter-spacing: 0.5px; text-transform: uppercase;">
                  ⏳ Status: Na čekanju
                </div>
                <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #000000;">
                  Hvala na porudžbini, ${order.customer.name}.
                </h2>
                <p style="margin: 0 0 10px 0; font-size: 15px; line-height: 24px; color: #374151;">
                  Vaša porudžbina <strong>#${orderId}</strong> je uspešno primljena.
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 22px; color: #6b7280;">
                  Bićete obavešteni novim email-om za svaku promenu statusa Vaše porudžbine.
                </p>
              </div>

              <div style="background-color: #fafafa; padding: 24px; margin-bottom: 32px; border: 1px solid #f3f4f6;">
                <h3 style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #000000; letter-spacing: 1px;">
                  Podaci za dostavu
                </h3>
                <p style="margin: 0; font-size: 14px; line-height: 22px; color: #4b5563;">
                  <strong style="color: #000;">${order.customer.name} ${
        order.customer.surname
      }</strong><br>
                  ${order.customer.address}<br>
                  ${order.customer.postalCode} ${order.customer.city}<br>
                  ${order.customer.phone}
                </p>
              </div>

              <div style="margin-bottom: 32px;">
                <table style="width: 100%; border-collapse: collapse;">
                  ${itemsHtml}
                </table>
              </div>

              <div style="border-top: 2px solid #000000; padding-top: 24px;">
                <table style="width: 100%;">
                  <tr>
                    <td style="padding-bottom: 8px; color: #6b7280; font-size: 14px;">Dostava:</td>
                    <td style="text-align: right; padding-bottom: 8px; color: #000000; font-size: 14px; font-weight: 500;">
                      ${
                        order.shippingCost
                          ? formatMoney(order.shippingCost)
                          : "Besplatna"
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 8px; color: #000000; font-size: 16px; font-weight: 700; text-transform: uppercase;">Ukupno:</td>
                    <td style="text-align: right; padding-top: 8px; color: #000000; font-size: 20px; font-weight: 800;">
                      ${formatMoney(order.finalTotal)}
                    </td>
                  </tr>
                </table>
              </div>

            </div>

            <div style="background-color: #000000; padding: 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Daja Shop. Sva prava zadržana.
              </p>
            </div>
            
          </div>
        </body>
        </html>
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

export const sendOrderStatusUpdate = onDocumentUpdated(
  {
    region: "europe-west3", // Tvoja regija
    document: "orders/{orderId}",
  },
  async (event: any) => {
    // 1. Provera podataka
    const change = event.data;
    if (!change) return;

    const newData = change.after.data();
    const oldData = change.before.data();
    const orderId = event.params.orderId;

    // Ako status nije promenjen, prekidamo (ne šaljemo mail)
    if (newData.status === oldData.status) return;

    // 2. Definisanje poruka na osnovu novog statusa
    let statusMessage = "";
    let statusHeadline = "";
    let statusIcon = "";

    switch (newData.status) {
      case "U obradi":
        statusIcon = "⚙️";
        statusHeadline = "Vaša porudžbina je u obradi";
        statusMessage =
          "Vašu porudžbinu smo uspešno evidentirali i trenutno je pakujemo. Uskoro će biti spremna za slanje.";
        break;
      case "Poslato":
        statusIcon = "🚚";
        statusHeadline = "Vaša porudžbina je poslata";
        statusMessage =
          "Dobre vesti! Vaš paket je predat kurirskoj službi i na putu je ka Vama. Očekujte isporuku uskoro.";
        break;
      case "Isporučeno":
        statusIcon = "✅";
        statusHeadline = "Porudžbina je isporučena";
        statusMessage =
          "Hvala Vam što ste kupovali u Daja Shop-u! Nadamo se da ste zadovoljni proizvodima.";
        break;
      case "Otkazano":
        statusIcon = "❌";
        statusHeadline = "Porudžbina je otkazana";
        statusMessage =
          "Vaša porudžbina je otkazana. Ukoliko mislite da je došlo do greške, molimo Vas da nas kontaktirate.";
        break;
      case "Na čekanju":
      default:
        statusIcon = "⏳";
        statusHeadline = "Status porudžbine ažuriran";
        statusMessage = "Status Vaše porudžbine je promenjen.";
        break;
    }

    // 3. Generisanje HTML tabele (Isto kao kod prve funkcije)
    const itemsHtml = newData.items
      .map(
        (item: any) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px 0; vertical-align: top;">
          <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; color: #000000; display: block; margin-bottom: 4px;">
            ${item.name}
          </span>
          <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #6b7280;">
            Količina: ${item.qty}
          </span>
        </td>
        <td style="padding: 16px 0; vertical-align: top; text-align: right;">
          <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 500; color: #000000;">
            ${formatMoney(item.price * item.qty)}
          </span>
        </td>
      </tr>
    `
      )
      .join("");

    // 4. Slanje Email-a (Tvoj minimalistički dizajn)
    const mailOptions = {
      from: '"Daja Shop" <dajashopnis@gmail.com>', // ZAMENI SVOJIM EMAILOM
      to: newData.customer.email,
      subject: `Promena statusa porudžbine #${orderId} - ${newData.status}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Status porudžbine</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 4px; border: 1px solid #e5e7eb; overflow: hidden;">
            
            <div style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f3f4f6;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #000000; letter-spacing: -1px; text-transform: uppercase;">
                DajaShop
              </h1>
            </div>

            <div style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; padding: 6px 12px; background-color: #f3f4f6; color: #000000; border-radius: 4px; font-size: 12px; font-weight: 700; margin-bottom: 16px; letter-spacing: 0.5px; text-transform: uppercase;">
                  ${statusIcon} Status: ${newData.status}
                </div>
                <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #000000;">
                  ${statusHeadline}
                </h2>
                <p style="margin: 0 0 10px 0; font-size: 15px; line-height: 24px; color: #374151;">
                  Poštovani/a <strong>${newData.customer.name}</strong>,
                </p>
                <p style="margin: 0; font-size: 15px; line-height: 24px; color: #374151;">
                  ${statusMessage}
                </p>
              </div>

              <div style="background-color: #fafafa; padding: 24px; margin-bottom: 32px; border: 1px solid #f3f4f6;">
                <h3 style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #000000; letter-spacing: 1px;">
                  Detalji porudžbine #${orderId}
                </h3>
                <p style="margin: 0; font-size: 14px; line-height: 22px; color: #4b5563;">
                  <strong style="color: #000;">${newData.customer.name} ${
        newData.customer.surname
      }</strong><br>
                  ${newData.customer.address}<br>
                  ${newData.customer.postalCode} ${newData.customer.city}<br>
                  ${newData.customer.phone}
                </p>
              </div>

              <div style="margin-bottom: 32px;">
                <table style="width: 100%; border-collapse: collapse;">
                  ${itemsHtml}
                </table>
              </div>

              <div style="border-top: 2px solid #000000; padding-top: 24px;">
                <table style="width: 100%;">
                  <tr>
                    <td style="padding-bottom: 8px; color: #6b7280; font-size: 14px;">Dostava:</td>
                    <td style="text-align: right; padding-bottom: 8px; color: #000000; font-size: 14px; font-weight: 500;">
                      ${
                        newData.shippingCost
                          ? formatMoney(newData.shippingCost)
                          : "Besplatna"
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 8px; color: #000000; font-size: 16px; font-weight: 700; text-transform: uppercase;">Ukupno:</td>
                    <td style="text-align: right; padding-top: 8px; color: #000000; font-size: 20px; font-weight: 800;">
                      ${formatMoney(newData.finalTotal)}
                    </td>
                  </tr>
                </table>
              </div>

            </div>

            <div style="background-color: #000000; padding: 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Daja Shop. Sva prava zadržana.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(
        `Status update email poslat korisniku: ${newData.customer.email} za status: ${newData.status}`
      );
    } catch (error) {
      console.error("Greška pri slanju status update email-a:", error);
    }
  }
);
