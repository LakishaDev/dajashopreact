import * as nodemailer from "nodemailer";
// 1. Konfiguracija Transportera
// UVEK koristi App Password, ne običnu šifru!
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dajashopnis@gmail.com", // ZAMENI
    pass: "kgegneigjhgsrfnk", // ZAMENI (16 slova)
  },
});
