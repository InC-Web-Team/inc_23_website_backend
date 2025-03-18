function getAllocationController(allocationServices, emailServices, eventsServices, judgeServices) {
    /**
     * Retrieves lab information for a given event.
     * 
     * @param {Object} req - The Express request object, containing event parameters.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function for error handling.
     */
    async function getLabs(req, res, next) {
        try {
            const { event_name } = req.params;
            // Retrieve lab details using the allocation services
            const labs = await allocationServices.getLabs(event_name);
            res.status(200).json(labs);
        } catch (error) {
            // Log error with the function name for easier debugging
            console.error("Error in getLabs:", error);
            next(error);
        }
    }

    /**
     * Retrieves evaluation statistics for a given event.
     * 
     * @param {Object} req - The Express request object, containing event parameters.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function for error handling.
     */
    async function getEvalstats(req, res, next) {
        try {
            const { event_name } = req.params;
            // Retrieve evaluation statistics using the allocation services
            const evals = await allocationServices.evalStats(event_name);
            res.status(200).json(evals);
        } catch (error) {
            // Log error with the function name for easier debugging
            console.error("Error in getEvalstats:", error);
            next(error);
        }
    }

    return {
        getLabs,
        getEvalstats
    };
}

export default getAllocationController;
