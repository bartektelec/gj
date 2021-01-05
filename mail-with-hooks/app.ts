require('dotenv').config();

import express from 'express';
import ip from 'ip';
import md5 from 'md5';
import nodemailer from 'nodemailer';

import type { Request, Response } from 'express';

// Stwórz logikę w node wykorzystując metodę GET opartą o restowy endpoint
// która pozwoli na rozwiązanie takiego problemu:

// 1. Chcesz do użytkownika wysłać maila nr 1 z linkiem do kliknięcia

// przykładowa treść maila nr 1:
// hej wygrałeś spadek do ciotce z teksasu
// kliknij w przycisk aby odebrać wygraną

// 2. Wtedy kiedy użytkownik kliknie w link w mailu nr 1, to chcesz aby otrzymał maila nr 2

// przykładowa treść maila nr 2:
// it's a prank bro!

const emailRE = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm;

const app = express();
app.use(express.json());
const victimsMap = new Map();

const PORT = process.env.PORT || 3000;
if (
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASSWORD ||
  !process.env.EMAIL_PROVIDER
)
  throw new Error('Add email details to the .env file!');
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

type TemplateType = 'bait' | 'reveal';

function getMailTemplate(to: string, type: TemplateType, token?: string) {
  if (!to || !type)
    throw new Error('Needed params to send an email not provided');

  if (type === 'bait' && !token) throw new Error('Token is needed');

  const baseUrl = process.env.HOSTNAME || `${ip.address()}:${PORT}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
  };

  switch (type) {
    case 'bait':
      return {
        ...mailOptions,
        subject: 'Congrats dude you won a lot of $$$',
        html: `🎉 To claim your reward go to this link: <a href='http://${baseUrl}/winner/${token}'>Click here!</a>`,
      };
    case 'reveal':
      return {
        ...mailOptions,
        subject: 'Follow up on your winning prize',
        html: `Unfortunately it was just a prank 😥`,
      };
  }
}

app.post('/prank', (req: Request, res: Response) => {
  console.log(req.body);
  const { email } = req.body;
  if (!email || !emailRE.test(email))
    return res.json({ msg: 'You need to pass a valid email address to prank' });

  try {
    const token = md5(email);
    const emailTemplate = getMailTemplate(email, 'bait', token);
    // try sending an email
    return res.json(emailTemplate);
    transporter.sendMail(emailTemplate);
    // if success add victim to map
  } catch (error) {
    console.log(error);
  }
});

app.get('/winner/:victimId', (req: Request, res: Response) => {
  const { victimId } = req.params;
  console.log(getMailTemplate('bartek@bartek.com', 'reveal'));
  if (!victimsMap.has(victimId)) return res.send('Something went wrong');
  const victimAddress = victimsMap.get(victimId);
  try {
    const emailTemplate = getMailTemplate(victimAddress, 'reveal', victimId);

    transporter.sendMail(emailTemplate);
    // try sending an email
    // remove victim from map
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
