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

            const dynamicData = {
                    event_name,
                    team_id: data.pid,
                    tentative_dates: "21st - 23rd March",
                    whatsapp_url: data.whatsapp_url,
            }

            const mailOptions = {
                from: `InC 2025 <${officialEmails.get('queries')}>`,
                to: data.email,
                bcc: `${officialEmails.get('queries')},${officialEmails.get(event_name.toLowerCase())}`,
                replyTo: officialEmails.get('queries'),
                subject: `Registered for PICT InC 2025 - ${event_name}`,
                priority: 'high',
                text: 'Email content',
                html: await emailTemplates.eventRegistrationEmail(dynamicData),
            };

            eventEmailTransporter.sendMail(mailOptions).then((e) => {console.log(`mail sent - ${data.pid}`);}).catch((e) => {throw e});

            return "Emails sent successfully";

            // await Promise.allSettled(allEmailPromises);
            // console.log("✅ Bulk email process completed.", counter);

            // const emailData = data.email;
            // console.log('no of emails', emailData.length)
            // let counter = 0;

            // const allEmailPromises = [];

            // for (const entry of emailData) {
            // 		const { pid, emails } = entry;

            // 		const mailOptions = {
            // 			from: `InC 2025 <${officialEmails.get('queries')}>`,
            // 			to: emails,
            // 			bcc: `${officialEmails.get('queries')}`,
            // 			replyTo: officialEmails.get('queries'),
            // 			subject: `🌟 Register Now! Special Prize by PICT Awaits You! 🚀`,
            // 			priority: 'high',
            // 			text: 'You are invited to participate in the INC and Project Competition by PICT!',
            // 			html: `
            // 			<html>
            // 					<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            // 							<p style="font-size: 18px;">📢 <strong>Calling All Innovators & Creators to Win the Special Prize by PICT!</strong></p>
                                        
            // 							<p>Do you have a groundbreaking idea? Are you ready to showcase your skills and compete with the best? 🌟</p>

            // 							<p><strong>Grab the opportunity to win the special prize by PICT!</strong></p>

            // 							<h3 style="color: #ff6600;">🔥 Join our flagship event INC and Project Competition! 🔥</h3>
            // 							<ul>
            // 									<li>✅ <strong>Exciting Prizes & Certificates</strong>, including a special prize by PICT 🎖</li>
            // 									<li>✅ <strong>A Platform to Shine</strong> 🌟</li>
            // 									<li>✅ <strong>Network with Experts & Like-minded Innovators</strong></li>
            // 							</ul>

            // 							<p><strong>📅 Register Now! Don’t miss this golden opportunity to turn your ideas into reality.</strong></p>

            // 							<p>
            // 									🔗 <a href="https://docs.google.com/forms/d/e/1FAIpQLScTRyFsd_eb8zQImGmnudK3JK93931Fu59xygU3gFg6H8-Kbg/viewform?usp=sharing" 
            // 									style="color: #ff6600; text-decoration: none; font-weight: bold;">Register Here</a>
            // 							</p>

            // 							<p><strong>🔹 Only the Team Leader should fill out the form.</strong></p>
            // 							<p><strong>🔹 Ignore if already filled.</strong></p>

            // 							<p>Tag your friends & spread the word! 📢</p>

            // 							<p style="color: #ff6600;"><strong>#Innovation #PICT_INC</strong></p>

            // 							<p>Best Regards,</p>
            // 							<p><strong>PICT INC Team</strong></p>
            // 					</body>
            // 			</html>
            // 			`,
            // 		};

            // 		allEmailPromises.push(
            // 				eventEmailTransporter.sendMail(mailOptions)
            // 						.then(() => {console.log(`✅ Email sent to ${emails} (PID: ${pid})`); counter++;})
            // 						.catch(err => console.error(`❌ Failed to send to ${emails} (PID: ${pid}):`, err.message))
            // 		);
            // }

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
                from: `InC 2025 Judging <${officialEmails.get('judging')}>`,
                to: `${judge.name} <${judge.email}>`,
                bcc: officialEmails.get('queries'),
                replyTo: officialEmails.get('queries'),
                subject: 'Registered for PICT InC 2025 Judging',
                priority: 'high',
                text: 'Email content',
                html: await emailTemplates.judgeRegistrationEmail(judge)
            }
            judgingEmailTransporter.sendMail(mailOptions).then((e) => {console.log('judge mail sent')}).catch((e) => {throw e});
            return "judging mail sent successfully"
        } catch (err) { throw err }
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
    }
}

export default emailService;