import nodemailer from "nodemailer";

const sendEmail = async function(email, subject, message) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Gmail SMTP host
        port: 465,
        secure: true, // Use SSL/TLS
        auth: {
            user: 'naitikraj12935@gmail.com',
            pass: 'ejtavzqacrlyrqex'
        }
    });

    // HTML email template
    const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
            <style>
                /* Add your CSS styles here */
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>LMS</h1>
                </div>
                <div class="body-content">
                    <p>${message}</p>
                    <a href=${subject}>${subject}</a>
                </div>
                <div class="footer">
                    <p>This email was sent by LMS. &copy; 2024 All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL, // Use your own email address here
        to: email,
        subject: subject,
        html: htmlTemplate // Use the HTML template as the email body
    });
};

export default sendEmail;
