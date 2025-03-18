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
            user: officialEmails.get('impetus'),
            pass: env.IMPETUS_EMAIL_PASSWORD
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

            const BATCH_SIZE = 50;

            const executeSendMail = async (emailArray) => {
                const allEmailPromises = [];

                for(let item of emailArray){
                    const mailOptions = {
                        from: `InC Impetus 2025 <${officialEmails.get('impetus')}>`,
                        to: `${item.email}`,
                        cc: 'InC Queries <queries.pictinc2024@gmail.com>',
                        replyTo: 'InC Queries <queries.pictinc2024@gmail.com>',
                        subject: "InC'25 Slot Confirmation - Impetus",
                        priority: 'high',
                        text: "Email content",
                        html: `<!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>INC 25 - Impetus Event Details</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                                <h2 style="text-align: center; color: #333;">You're Invited to INC 25 - Impetus</h2>
                                <p>Dear Participant,</p>
                                <p>We are excited to have you at <strong>Impetus</strong>, part of <strong>INC 25</strong>. Below are your event details:</p>
                                
                                <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
                                    <p><strong>Event:</strong> Impetus</p>
                                    <p><strong>Date & Time Slot:</strong> <span style="color: #d4621c;"><strong>${item.slot}</strong></span></p>
                                    <p><strong>Location:</strong> PICT, Pune</p>
                                </div>
                                
                                <p>Kindly arrive 15 minutes before your scheduled time. If you have any questions, feel free to reach out.</p>
                                
                                <p>Best Regards,</p>
                                <p><strong>INC 25 Impetus Team</strong></p>
                            </div>
                        </body>
                        </html>
                        `
                    };
                
                allEmailPromises.push(
                    bulkEmailTransporter.sendMail(mailOptions).then((e) => {console.log(`mail sent - ${item.email}`)}).catch((e) => {console.log(e)})
                );
                await Promise.allSettled(allEmailPromises);
                console.log('completed bulk batch');
                }
            }

            for (let i=0; i<data.length; i += BATCH_SIZE) {
                const emailArray = data.slice(i, i+BATCH_SIZE);
                setTimeout(() => {
                    console.log(`sending batch - ${i/BATCH_SIZE}`);
                    executeSendMail(emailArray);
                }, 5000*(i/BATCH_SIZE));
            }
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