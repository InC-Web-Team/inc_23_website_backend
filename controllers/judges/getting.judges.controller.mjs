import eventsServices from '../../services/database/events/events.database.services.mjs';
import { AppError, clearCookie, createToken, sendCookie, verifyToken } from '../../utils/index.js';

/**
 * Controller for handling judge-related operations.
 *
 * @param {Object} judgesServices - The judges services object.
 * @param {Object} eventsService - The events service object.
 * @returns {Object} An object containing the judge-related functions.
 */
function gettingJudgesController(judgesServices, eventsService) {
    /**
     * Retrieves a judge based on the token in signed cookies.
     *
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function.
     */
    async function getJudgeFromToken(req, res, next) {
        try {
            const { token } = req.signedCookies;
            const judge = await judgesServices.getJudge({ jid: token, columns: "*" });
            res.status(302).json(judge);
        } catch (err) {
            console.error("Error in getJudgeFromToken:", err);
            next(err);
        }
    }

    /**
     * Retrieves all judges for a specific event.
     *
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function.
     */
    async function getJudges(req, res, next) {
        try {
            const { event_name } = req.params;
            const judges = await judgesServices.getJudges(event_name);
            res.status(200).json(judges);
        } catch (err) {
            console.error("Error in getJudges:", err);
            next(err);
        }
    }

    /**
     * Authenticates a judge using username and password and sends a cookie if successful.
     *
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function.
     */
    async function loginJudge(req, res, next) {
        try {
            const { username, password } = req.body;
            const judge = await judgesServices.loginJudge({ username, password });
            if (!judge) {
                res = await clearCookie(res, 'token', '/judge');
                throw new AppError(404, 'fail', 'Invalid credentials');
            }
            sendCookie(
                res,
                { token: judge.jid },
                '/judge'
            ).status(200).end();
        } catch (err) {
            console.error("Error in loginJudge:", err);
            next(err);
        }
    }

    /**
     * Retrieves projects for a given event.
     *
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function.
     */
    async function getProjects(req, res, next) {
        try {
            const results = await eventsServices.getProjects(req.params.event_name);
            if (!results) throw new AppError(404, 'fail', 'No Projects Found');
            res.status(200).json(results);
        } catch (err) {
            console.error("Error in getProjects:", err);
            next(err);
        }
    }

    /**
     * Retrieves allocated projects for a specific judge.
     *
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function.
     */
    async function getAllocatedProjects(req, res, next) {
        try {
            const { jid } = req.params;
            const getAllocatedProjects = await judgesServices.getAllocatedProjects(jid);
            if (!getAllocatedProjects) throw new AppError(404, 'fail', 'No Projects Found');
            res.status(200).json(getAllocatedProjects);
        } catch (err) {
            console.error("Error in getAllocatedProjects:", err);
            next(err);
        }
    }

    /**
     * Retrieves judge details based on judge ID.
     *
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function.
     */
    async function getJudgeFromJid(req, res, next) {
        try {
            const { jid } = req.params;
            const judge = await judgesServices.getJudge(jid);
            res.status(200).json(judge);
        } catch (err) {
            console.error("Error in getJudgeFromJid:", err);
            next(err);
        }
    }

    /**
     * Modifies judge slots based on the provided data.
     *
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function.
     */
    async function modifySlots(req, res, next) {
        try {
            const { jid } = req.params;
            const { slots, mode } = req.body;
            await judgesServices.modifySlots(jid, slots, mode || '0');
            res.status(200).end();
        } catch (err) {
            console.error("Error in modifySlots:", err);
            next(err);
        }
    }

    /**
     * Retrieves allocated projects for a judge and separates them into evaluated and not evaluated.
     *
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function.
     */
    async function getAllocatedProjectsofJudge(req, res, next) {
        try {
            const { jid } = req.params;
            const result = await judgesServices.getAllocatedProjectsofJudge(jid);

            const projectsNotEvaluated = [];
            const projectsEvaluated = [];

            // Split the allocated projects string into an array of project IDs
            const allocatedProjectIds = result[0]['allocated_projects'].split(',').map(pid => pid.trim());

            // Determine for each project if it has been evaluated by the judge
            for (const pid of allocatedProjectIds) {
                const noteval = await judgesServices.getProjectsNotEvaluatedByJudge(jid, [pid]);
                if (noteval !== null) {
                    projectsNotEvaluated.push(noteval);
                } else {
                    projectsEvaluated.push(pid);
                }
            }
            const mergedProjects = { projectsNotEvaluated, projectsEvaluated };
            res.status(200).json(mergedProjects);
        } catch (err) {
            console.error("Error in getAllocatedProjectsofJudge:", err);
            next(err);
        }
    }

    /**
     * Retrieves results from a specific table based on the table name.
     *
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function.
     */
    async function getResultFromTableName(req, res, next) {
        try {
            const { table_name } = req.params;
            const result = await judgesServices.getResultFromTableName(table_name);
            res.json(result);
        } catch (error) {
            console.error("Error in getResultFromTableName:", error);
            next(error);
        }
    }

    return {
        getJudgeFromToken,
        getJudges,
        loginJudge,
        getProjects,
        getAllocatedProjects,
        getJudgeFromJid,
        modifySlots,
        getAllocatedProjectsofJudge,
        getResultFromTableName,
    };
}

export default gettingJudgesController;
