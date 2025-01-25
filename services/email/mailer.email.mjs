import nodemailer from 'nodemailer';
import { officialEmails } from '../../static/adminData.mjs';
import { projectDomains, slotsData } from '../../static/eventsData.mjs';
import emailTemplates from './htmlGenerators.email.mjs';

const env = process.env

function emailService() {
    const eventEmailTransporter = nodemailer.createTransport({
        pool: true,
        service: 'gmail',
        port: 465,
        auth: {
            user: officialEmails.get('queries'),
            pass: env.EVENTS_EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    })

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

            // const mailOptions = {
            //     from: `InC'2025 <${officialEmails.get('queries')}>`,
            //     to: data.step_2.map(participant => `${participant.name} <${participant.email}>`).join(', '),
            //     bcc: `${officialEmails.get('queries')},${officialEmails.get(event_name)}`,
            //     replyTo: officialEmails.get('queries'),
            //     subject: `Registered for PICT InC 2025 - ${event_name}`,
            //     priority: 'high',
            //     text: 'Email content',
            //     html: await emailTemplates.eventRegistrationEmail({ ...data, event_name })
            // };
            // console.log(event_name, data);
            const tempMailOptions = {
                from: `InC 2025 <${officialEmails.get('queries')}>`,
                to: data.email,
                bcc: `${officialEmails.get('queries')},${officialEmails.get(event_name.toLowerCase())}`,
                replyTo: officialEmails.get('queries'),
                subject: `Registered for PICT InC 2025 - ${event_name}`,
                priority: 'high',
                text: 'Email content',
                html: await emailTemplates.eventRegistrationEmail({event_name}),
            };
            eventEmailTransporter.sendMail(tempMailOptions).then((e) => console.log('email sent to ', data.email)).catch(e => console.log(e));
            return "Emails sent successfully";
        } catch (err) {
            throw err;
        }
    }


    async function judgeRegistrationEmail(judge) {
        try {
            // // // console.log(judge)
            judge.domains = judge.domains.map(domain => projectDomains[domain])
            judge.slots = judge.slots.map(slot => slotsData[slot])
            const mailOptions = {
                from: `InC\'2024 Judging <${officialEmails.get('judging')}>`,
                to: `${judge.name} ${judge.email}`,
                bcc: officialEmails.get('queries'),
                replyTo: officialEmails.get('queries'),
                subject: 'Registered for PICT InC 2024 Judging',
                priority: 'high',
                text: 'Email content',
                html: await emailTemplates.judgeRegistrationEmail(judge)
            }
            return judgingEmailTransporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    throw err
                }
                return info
            })
        } catch (err) { throw err }
    }

    async function sendAllocationEmail(event_name, projects, judge, judgeCredentials) {
        try {
            judge.slots = judge.slots.map(slot => slotsData[slot])
            projects.forEach(project => {
                project.domain = projectDomains[project.domain]
            })
            event_name = event_name.charAt(0).toUpperCase() + event_name.slice(1)
            const mailOptions = {
                from: `InC\'2024 Judging <${officialEmails.get('judging')}>`,
                to: `${judge.name} ${judge.email}`,
                cc: officialEmails.get('official'),
                replyTo: officialEmails.get('judging'),
                subject: `Updated Judging Schedule for PICT InC 2024 - ${event_name}`,
                priority: 'high',
                text: 'Email content',
                html: await emailTemplates.sendAllocationEmail(event_name, projects, judge, judgeCredentials)
            }
            return judgingEmailTransporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    throw err
                }
                return info
            })
        } catch (err) { throw err }
    }

    return {
        eventRegistrationEmail,
        judgeRegistrationEmail,
        sendAllocationEmail,
    }
}

export default emailService;