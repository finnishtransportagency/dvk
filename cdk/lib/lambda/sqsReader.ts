import { SQSEvent, SQSHandler } from 'aws-lambda';
import nodemailer from 'nodemailer';
import { getEmailHost, getEmailPort, getEmailUser, getEmailPass } from './environment';

export const handler: SQSHandler = async (event: SQSEvent) => {
  const transporter = nodemailer.createTransport({
    host: await getEmailHost(),
    port: parseInt(await getEmailPort()),
    auth: {
      user: await getEmailUser(),
      pass: await getEmailPass(),
    },
  });

  for (const record of event.Records) {
    console.log('Message Body: ', record.body);

    try {
      const { rating, feedback } = JSON.parse(record.body);

      const mailOptions = {
        from: 'sender@example.com',
        to: 'tuki.dvk@vayla.fi',
        subject: 'Uusi palaute palvelusta Digitaalinen Väyläkortti',
        text: `Arvosana: ${rating}\nPalaute: ${feedback}`,
      };

      console.log(mailOptions);
      // await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error processing message:', error);
      throw error; // Throwing error will cause Lambda to return the message to the queue
    }
  }
};
