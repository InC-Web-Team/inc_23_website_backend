import { Router } from 'express';
import { createAllocationController, gettingJudgesController } from '../../controllers/index.js';
import { getAllocationController } from '../../controllers/index.js';

const allocationsRouter = Router()

/**
 * Creates and configures the allocations router.
 *
 * @param {Object} emailServices - The email services object.
 * @param {Object} allocationServices - The allocation services object.
 * @param {Object} eventsServices - The events services object.
 * @param {Object} judgeServices - The judge services object.
 * @param {Object} middlewares - An object containing middleware functions.
 * @param {Object} adminValidations - An object containing admin validation functions.
 * @returns {Router} Configured Express router for allocations.
 */
function createAllocationsRouter(emailServices, allocationServices, eventsServices, judgeServices, middlewares, adminValidations) {
    // Destructure the necessary middleware and validation functions
    const { verifyAdminLogin, validator, verifyAdminLoginAndAdminRole } = middlewares;
    const { verifyAdminValidation } = adminValidations;

    // Initialize controllers with provided services
    const { labAllocate, allocate, deallocate } = createAllocationController(allocationServices, emailServices, eventsServices, judgeServices);
    const { getLabs, getEvalstats } = getAllocationController(allocationServices, emailServices, eventsServices, judgeServices);
    const { getAllocatedProjectsofJudge } = gettingJudgesController(judgeServices, eventsServices);

    /**
     * A wrapper to safely handle asynchronous route functions.
     * It logs the error with the provided name and passes the error to Express's error handling.
     *
     * @param {Function} fn - The route function to wrap.
     * @param {string} name - The name of the route handler (for logging).
     * @returns {Function} A function that wraps the route handler in a try/catch.
     */
    const safeHandler = (fn, name) => {
      return async (req, res, next) => {
        try {
          await fn(req, res, next);
        } catch (error) {
          console.error(`Error in ${name}:`, error);
          next(error);
        }
      }
    }

    // Define routes with added safeHandler to catch errors

    // Route for lab allocation with admin validation, input validation, and admin login verification
    allocationsRouter.patch(
      "/:event_name/lab",
      verifyAdminValidation(2),
      validator,
      verifyAdminLogin,
      safeHandler(labAllocate, "labAllocate")
    );

    // Route for project allocation with admin login verification
    allocationsRouter.post(
      "/:event_name/allocate",
      verifyAdminLogin,
      safeHandler(allocate, "allocate")
    );

    // Route for deallocation with admin login verification
    allocationsRouter.patch(
      "/:event_name/deallocate",
      verifyAdminLogin,
      safeHandler(deallocate, "deallocate")
    );

    // Route to get lab information for an event
    allocationsRouter.get(
      "/:event_name/labs",
      safeHandler(getLabs, "getLabs")
    );

    // Get projects allocated to judges
    allocationsRouter.get(
      "/projects/:jid",
      safeHandler(getAllocatedProjectsofJudge, "getAllocatedProjectsofJudge")
    );

    // Route to get evaluation statistics with admin login verification
    allocationsRouter.get(
      "/getevalstats/:event_name",
      verifyAdminLogin,
      safeHandler(getEvalstats, "getEvalstats")
    );

    return allocationsRouter;
}

export default createAllocationsRouter;
