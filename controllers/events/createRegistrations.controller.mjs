import { sendCookie, randomID, AppError } from '../../utils/index.js';
import { teamSize } from '../../static/eventsData.mjs';
import { pictDetails } from '../../static/collegeDetails.mjs';

function createRegistrationsController(eventsServices, filesServices) {
    async function saveProject(req, res, next) {
        try {
            const { event_name } = req.params
            const { ticket } = req.signedCookies
            if (ticket) {
                await eventsServices.editStepData(ticket, 1, req.body)
                res.status(200).end()
            } else {
                const ticket = 'INC-' + event_name[0].toUpperCase() + randomID(12)
                await eventsServices.insertTicket(ticket, req.body)
                sendCookie(
                    res,
                    { ticket },
                    `/events/${event_name}`
                ).status(200).end()
            }
        } catch (err) { next(err) }
    }

    async function insertMember(req, res, next) {
        try {
            const { event_name } = req.params
            const { ticket } = req.signedCookies
            const member_details = req.body
            const member_id_file = req.file
            const existing_members = await eventsServices.getMembersFromTicket(ticket)
            if (!existing_members) throw new AppError(404, 'fail', 'Ticket does not exist')
            if (Array.isArray(existing_members.step_2)) {
                if (existing_members.step_2.length === teamSize.get(event_name))
                    throw new AppError(400, 'fail', 'Maximum number of members reached')
                else {
                    existing_members.step_2.forEach(member => {
                        if (member.email === member_details.email)
                            throw new AppError(400, 'fail', 'Duplicate email address found in a team')
                    })
                    await filesServices.insertFile(member_details.email, member_id_file)
                    await eventsServices.editStepData(ticket, 2, [...existing_members.step_2, member_details])
                }
            } else {
                await filesServices.insertFile(member_details.email, member_id_file)
                await eventsServices.editStepData(ticket, 2, [{ ...member_details }])
            }
            sendCookie(
                res,
                { ticket },
                `/events/${event_name}`
            ).status(200).end()
        } catch (err) { next(err) }
    }

    async function saveCollegeDetails(req, res, next) {
        try {
            const { ticket } = req.signedCookies
            if (req.body.isPICT === '1') {
                req.body = { ...req.body, ...pictDetails }
            }
            await eventsServices.editStepData(ticket, 3, req.body)
            sendCookie(
                res,
                { ticket },
                `/events/${req.params.event_name}`
            ).status(200).end()
        } catch (err) { next(err) }
    }

    async function completeRegistration(req, res, next) {
        try {
            const { ticket } = req.signedCookies
            const results = await eventsServices.getTicketDetails(ticket)
            if (results.step_no === 3) {
                await eventsServices.editPaymentAndStep(ticket, 5, '')
                res.status(200).end()
            } else if (results.step_no === 5) throw new AppError(400, 'fail', 'Registration already completed using this ticket')
            else throw new AppError(400, 'fail', 'Registration not completed')
        } catch (err) { next(err) }
    }

    return {
        saveProject,
        insertMember,
        saveCollegeDetails,
        completeRegistration,
    }
}

export default createRegistrationsController;