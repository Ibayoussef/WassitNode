const transporter = require("../config/mailer.cjs");
const ejs = require('ejs')
const path = require('path')
const sendMail = async ({ to, from, subject, data }) => {
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
module.exports = sendMail

