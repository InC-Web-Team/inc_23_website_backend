import nodemailer from 'nodemailer';
import { officialEmails } from '../../static/adminData.mjs';
import { getJudgingSlots } from '../../static/eventsData.mjs';
import emailTemplates from './htmlGenerators.email.mjs';
import { writeFileSync } from 'fs';

const env = process.env

function emailService() {
    const eventEmailTransporter = nodemailer.createTransport({
        pool: true,
        service: 'gmail',
        port: 465,
        auth: {
            user: officialEmails.get('info'),
            pass: env.INFO_EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    const bulkEmailTransporter = nodemailer.createTransport({
        service: 'gmail',
        port: 465,
        pool: true,
        maxMessages: Infinity,
        maxConnections: 5,
        auth: {
            user: officialEmails.get('queries'),
            pass: env.EVENTS_EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const judgingEmailTransporter = nodemailer.createTransport({
        pool: true,
        service: 'gmail',
        port: 465,
        auth: {
            user: officialEmails.get('judging'),
            pass: env.JUDGE_EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    async function eventRegistrationEmail(event_name, data) {
        try {
            const dynamicData = {
                    event_name,
                    team_id: data.pid,
                    tentative_dates: "21st - 23rd March",
                    whatsapp_url: data.whatsapp_url,
            }
            const mailOptions = {
                from: `InC 2025 <${officialEmails.get('info')}>`,
                to: data.email,
                bcc: `${officialEmails.get('queries')},${officialEmails.get(event_name.toLowerCase())}`,
                replyTo: officialEmails.get('queries'),
                subject: `Registered for PICT InC 2025 - ${event_name}`,
                priority: 'high',
                text: 'Email content',
                html: await emailTemplates.eventRegistrationEmail(dynamicData),
            };
            eventEmailTransporter.sendMail(mailOptions).then(() => {}).catch((e) => {console.log(e)});
            return "Emails sent successfully";
        } catch (err) {
            throw err;
        }
    }

    async function judgeRegistrationEmail(judge) {
        try {
            const slotsData = getJudgingSlots(judge?.events.toLowerCase());
            judge.slots = judge.slots
            .map(slot => parseInt(slot))
            .sort((a, b) => a - b)
            .map(slot => slotsData[slot])
            .join(", ");
            const mailOptions = {
                from: `InC 2025 Judging <${officialEmails.get('info')}>`,
                to: `${judge.name} <${judge.email}>`,
                // bcc: officialEmails.get('queries'),
                cc: officialEmails.get('judging'),
                replyTo: officialEmails.get('queries'),
                subject: 'Registered for PICT InC 2025 Judging',
                priority: 'high',
                text: 'Email content',
                html: await emailTemplates.judgeRegistrationEmail(judge)
            }
            eventEmailTransporter.sendMail(mailOptions).then(() => {}).catch((e) => {console.log(e)});
            return "judging mail sent successfully"
        } catch (err) { throw err }
    }

    async function sendBulkEmail(data) {
        try {
            const allEmailPromises = [];
            const { emails } = data;

            const BATCH_SIZE = 90;

            for (let i=0; i<emails.length; i += BATCH_SIZE) {

                const emailArray = emails.slice(i, i+BATCH_SIZE);

                const mailOptions = {
                    from: `InC 2025 <${officialEmails.get('queries')}>`,
                    to: 'Queries <queries.pictinc2024@gmail.com>',
                    cc: 'Piyush <piyushdahake096@gmail.com>',
                    bcc: emailArray.join(","),
                    subject: 'Wildcard Round - Important Instructions',
                    priority: 'high',
                    text: "Email content",
                    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Wildcard Round Information</title>
        <style>
            /* Base styles for all devices */
            body {
                font-family: Arial, Helvetica, sans-serif;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                box-sizing: border-box;
            }
            .header {
                text-align: center;
                padding: 20px 0;
                background-color: #5F9DF7;
                color: #ffffff;
            }
            .content {
                padding: 20px;
            }
            .footer {
                text-align: center;
                padding: 15px;
                font-size: 12px;
                color: #777777;
                border-top: 1px solid #eeeeee;
            }
            h1 {
                color: #ffffff;
                margin: 0;
                font-size: 24px;
            }
            h2 {
                color: #d4621c;
                font-size: 20px;
            }
            ul {
                padding-left: 20px;
                margin-right: 10px;
            }
            li {
                margin-bottom: 10px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #5F9DF7;
                color: #ffffff;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                margin: 5px 0;
            }
            .button.orange {
                background-color: #d4621c;
            }
            .link-container {
                margin-left: 25px;
                margin-bottom: 15px;
            }
            .url-text {
                word-break: break-all;
                font-size: 12px;
                margin-top: 5px;
            }
            /* Responsive styles */
            @media only screen and (max-width: 480px) {
                .container {
                    width: 100% !important;
                    padding: 10px !important;
                    min-width: 100% !important;
                    box-sizing: border-box !important;
                }
                .content {
                    padding: 10px !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                }
                h1 {
                    font-size: 20px !important;
                }
                h2 {
                    font-size: 18px !important;
                }
                .link-container {
                    margin-left: 15px !important;
                }
                ul {
                    padding-left: 15px !important;
                    padding-right: 5px !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>InC Pradnya - Wildcard Round Announcement</h1>
            </div>
            <div class="content">
                <p>Dear Participants,</p>
                
                <h2>Important: Wildcard Round Information</h2>
                
                <p>The Wildcard Round will take place on <strong>15th March from 8:00 PM to 10:00 PM</strong>. Please carefully read the following instructions:</p>
                
                <ul>
                    <li><strong>Direct Entry to Round 2</strong> – If you qualify in the wildcard round, you will skip Round 1 (MCQ Round) and move directly to Round 2. Top teams will be selected based on performance.</li>
                    
                    <li><strong>One CodeChef ID per Team</strong> – If your team has two members, you must participate using only ONE CodeChef ID. The second ID will not be considered.</li>
                    
                    <li><strong>Join the WhatsApp Group</strong> – If you haven't joined yet, please do so using the link below. All updates will be shared there.</li>
                </ul>
                
                <div class="link-container">
                    <a href="https://chat.whatsapp.com/DxWfPhRTrhi2eCU3NMdloL" class="button">Join WhatsApp Group</a>
                    <p class="url-text">https://chat.whatsapp.com/DxWfPhRTrhi2eCU3NMdloL</p>
                </div>
                
                <ul>
                    <li><strong>CodeChef ID</strong> – Ensure you have your CodeChef ID ready and are familiar with the CodeChef environment before the competition. You can get your CodeChef username on CodeChef profile after signing in.</li>
                    
                    <li>The contest link will be shared via email on 15th March itself.</li>
                    
                    <li><strong>Google Form Submission</strong> – To participate in the wildcard round, you must fill out this form. Note that the Google form will be active till 8 PM on 14th March 2025.</li>
                </ul>
                
                <div class="link-container">
                    <a href="https://forms.gle/rF6X4iMpR2rg29JLA" class="button orange">Submit Google Form</a>
                    <p class="url-text">https://forms.gle/rF6X4iMpR2rg29JLA</p>
                </div>
                
                <p>For any queries, feel free to reach out. Best of luck!</p>
                
                <p>Regards,<br>InC Pradnya Team</p>
            </div>
            <div class="footer">
                <p>This email was sent by the InC Pradnya Team. Please do not reply to this email.</p>
                <p>© 2025 InC Pradnya. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`
                };

                allEmailPromises.push(
                    bulkEmailTransporter.sendMail(mailOptions).then((e) => {console.log(`bulk mail sent - ${i}, ${i+BATCH_SIZE}`)}).catch((e) => {console.log(e)})
                );
            }

            await Promise.allSettled(allEmailPromises);
            console.log("✅ Bulk email process completed.");
        }
        catch (err) { throw err }
    }

    async function sendAllocationEmail(event_name, projects, judge, judgeCredentials) {
        try {
            // judge.slots = judge.slots.map(slot => slotsData[slot])
            // projects.forEach(project => {
            //     project.domain = projectDomains[project.domain]
            // })
            // event_name = event_name.charAt(0).toUpperCase() + event_name.slice(1)
            // const mailOptions = {
            //     from: `InC\'2024 Judging <${officialEmails.get('judging')}>`,
            //     to: `${judge.name} ${judge.email}`,
            //     cc: officialEmails.get('official'),
            //     replyTo: officialEmails.get('judging'),
            //     subject: `Updated Judging Schedule for PICT InC 2024 - ${event_name}`,
            //     priority: 'high',
            //     text: 'Email content',
            //     html: await emailTemplates.sendAllocationEmail(event_name, projects, judge, judgeCredentials)
            // }
            // return judgingEmailTransporter.sendMail(mailOptions, (err, info) => {
            //     if (err) {
            //         throw err
            //     }
            //     return info
            // })
        } catch (err) { throw err }
    }

    return {
        eventRegistrationEmail,
        judgeRegistrationEmail,
        sendAllocationEmail,
        sendBulkEmail,
    }
}

export default emailService;