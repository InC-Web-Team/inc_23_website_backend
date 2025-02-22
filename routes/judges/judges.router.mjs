import { Router } from 'express';
import { gettingJudgesController, creationsJudgesController } from '../../controllers/index.js';

const judgesRouter = Router()

function createJudgesRouter(judgesServices, eventsServices, emailService, middlewares, judgesValidations, adminValidations, eventsValidations) {
    const { apiLimiter, registrationLimiter, verifyJudgeLogin, validator, verifyAdminLogin } = middlewares
    const { insertJudgeValidation, getJudgeValidation, loginJudgeValidation } = judgesValidations
    const { verifyJudgeValidation } = adminValidations
    const { eventNameParamValidation } = eventsValidations
    const { getJudgeFromToken, getJudgeFromJid, loginJudge, getProjects, getJudges, getAllocatedProjects, modifySlots } = gettingJudgesController(judgesServices, eventsServices)
    const { insertJudge, evaluateProject } = creationsJudgesController(judgesServices, emailService)
    
    // judgesRouter.use(apiLimiter)
    
    judgesRouter.get('/:event_name/allocations', verifyAdminLogin, getProjects)

    judgesRouter.get('/registration/view/:event_name', verifyAdminLogin, getJudges)

    judgesRouter.get('/verify', verifyJudgeLogin, getJudgeFromToken)

    judgesRouter.get('/allocations/:jid', verifyAdminLogin, getAllocatedProjects)

    judgesRouter.get('/:jid', verifyJudgeLogin, getJudgeFromJid)
    
    judgesRouter.patch('/modify_slots/:jid', verifyJudgeLogin, modifySlots)

    judgesRouter.post('/:event_name/evaluate', verifyJudgeLogin, evaluateProject)

    // judgesRouter.use(registrationLimiter)
    
    judgesRouter.post('/register', insertJudge)
    judgesRouter.post('/login', loginJudgeValidation(), validator, loginJudge)

    return judgesRouter
}

export default createJudgesRouter;