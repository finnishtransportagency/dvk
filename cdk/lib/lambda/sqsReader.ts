import { SQSEvent, SQSHandler } from 'aws-lambda';
import nodemailer from 'nodemailer';
import { getEmailConfig } from './environment';

export const handler: SQSHandler = async (event: SQSEvent) => {
  const { emailHost, emailPort, emailUser, emailPass, feedbackAddress } = await getEmailConfig();
  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort),
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  for (const record of event.Records) {
    console.log('Message Body: ', record.body);

    try {
      const { rating, feedback } = JSON.parse(record.body);

      const mailOptions = {
        from: 'noreply.dvk@vaylapilvi.fi',
        to: feedbackAddress,
        subject: 'Uusi palaute palvelusta Digitaalinen Väyläkortti',
        text: `Arvosana: ${rating}\nPalaute: ${feedback}`,
      };

      console.log(mailOptions);
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error processing message:', error);
      throw error; // Throwing error will cause Lambda to return the message to the queue
    }
  }
};
