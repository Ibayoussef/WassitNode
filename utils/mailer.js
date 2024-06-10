import transporter from "../config/mailer";
import ejs from 'ejs'
import path from 'path'
export const sendMail = async ({ to, from, subject, data }) => {
    const html = await ejs.renderFile(path.join(__dirname, '../views/invoice.ejs'), { project: data });

    try {
        const info = await transporter.sendMail({
            from: from,
            to: to,
            subject: subject,

            html: html,
        });
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


