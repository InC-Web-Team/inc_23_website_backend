import { Router } from 'express';
import { getRegistrationsController, createRegistrationsController } from '../../controllers/index.js';


const eventsRouter = Router()

function createEventsRouter(eventsServices, filesServices, emailService, middlewares, eventsValidations, adminValidations, docServices) {
	const { registrationLimiter, verifyAdminLogin, validator, memberIDParser, formDataParser } = middlewares
	const { getPaymentValidation, ticketValidation, getRegistrationValidation, paymentValidation, fileValidation, eventNameParamValidation, getUserRegistrationValidation, projectValidation, memberValidation, collegeValidation, verifyPICTOrPayments } = eventsValidations
	const { verifyAdminValidation } = adminValidations
	const { getPaymentDetails, getTicketDetails, getUserIDFile, getUserRegistration, getRegistration, getRegistrations, getPendingPayments, getSynopsis, getProjectAbstract, updateProjectAbstract, backupRegs, getRegistrationsCount, } = getRegistrationsController(eventsServices, filesServices, docServices)
	const { saveProject, insertMember, getAddedMembers, saveCollegeDetails, requestRegistration, verifyPendingPayment, updateProject, insertInternalPICT, deleteMember, getTechfiestaMembers, addTechfiestaMembers, getAllTeamLeaders, } = createRegistrationsController(eventsServices, filesServices, emailService)

	eventsRouter.get('/ticket', getTicketDetails)
	// get registrations count
	eventsRouter.get('/registrations-count', verifyAdminValidation(2), validator, verifyAdminLogin, getRegistrationsCount);

	 // get verified registrations
	eventsRouter.get('/registrations/:event_name', verifyAdminValidation(2), validator, verifyAdminLogin, getRegistrations)

	 // get ticket by event name and pid 
	eventsRouter.get('/verify/:event_name', eventNameParamValidation(), verifyAdminValidation(3), validator, verifyAdminLogin, getPaymentDetails)

	 // get image url by email
	eventsRouter.get('/verify-file', verifyAdminValidation(6), validator, verifyAdminLogin, getUserIDFile)

	// get pending verifications by event name
	eventsRouter.get('/verify/payment/:event_name', eventNameParamValidation(), verifyAdminValidation(3), validator, verifyAdminLogin, getPendingPayments)

	// verify payment and process db's
	eventsRouter.post('/verify/payment/:event_name', eventNameParamValidation(), paymentValidation(), verifyAdminValidation(3), validator, verifyAdminLogin, verifyPendingPayment)

	// get registration status
	eventsRouter.get('/verify/registration', getRegistrationValidation(), validator, getRegistration)

	eventsRouter.get('/:event_name/synopsis', getSynopsis)
	eventsRouter.get('/verify/user/:event_name', eventNameParamValidation(), getUserRegistrationValidation(), validator, getUserRegistration)

	eventsRouter.patch('/:event_name/:pid', verifyAdminValidation(2), validator, verifyAdminLogin, updateProject)
	eventsRouter.post('/:event_name/internal', insertInternalPICT)

	// eventsRouter.get('/team-leaders', getAllTeamLeaders);
	eventsRouter.use(registrationLimiter)
	
	eventsRouter.post('/step_1', saveProject)
	eventsRouter.post('/step_2', memberIDParser, formDataParser, insertMember)
	eventsRouter.get('/getmemberdetails', getAddedMembers)
	eventsRouter.get('/techfiesta-members', getTechfiestaMembers)
	eventsRouter.post('/techfiesta-members', addTechfiestaMembers);
	eventsRouter.post('/step_3', saveCollegeDetails)
	eventsRouter.post('/step_4', requestRegistration)
	// Delete member
	eventsRouter.delete('/deletememberdetails', deleteMember)
	// Get project abstract 
	eventsRouter.post('/getabstract', getProjectAbstract)
	eventsRouter.post('/updateabstract', updateProjectAbstract)

	eventsRouter.get('/backupRegs', backupRegs)

	return eventsRouter
}

export default createEventsRouter;