function createAllocationController(allocationServices, emailServices, eventsServices, judgeServices) {
  /**
   * Handles lab allocation updates.
   * Extracts the event name from the request parameters and updates the lab allocation using the provided data.
   * Responds with a 200 status if successful.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} res - The Express response object.
   * @param {Function} next - The next middleware function.
   */
  async function labAllocate(req, res, next) {
    try {
      const { event_name } = req.params;
      // Update lab allocation for the specified event using request body data
      await allocationServices.updateLab(event_name, req.body);
      res.status(200).end();
    } catch (err) {
      // Log error with the function name for easier debugging
      console.error("Error in labAllocate:", err);
      next(err);
    }
  }

  /**
   * Handles allocation of projects or tasks.
   * Extracts the event name from the request parameters and processes allocation using provided data.
   * Responds with a 200 status if successful.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} res - The Express response object.
   * @param {Function} next - The next middleware function.
   */
  async function allocate(req, res, next) {
    try {
      const { event_name } = req.params;
      // Process allocation for the specified event using request body data
      await allocationServices.allocate(event_name, req.body);
      // The code below is commented out but shows potential additional steps:
      // const judge = await judgeServices.getJudge(jids[0]);
      // const judgeCredentials = await judgeServices.getCredentials(judge.email);
      // console.log(judgeCredentials);
      // const projects = await eventsServices.getProject(event_name, req.body.pids);
      // await emailServices.sendAllocationEmail(event_name, projects, judge, judgeCredentials);
      res.status(200).end();
    } catch (err) {
      // Log error with the function name for easier debugging
      console.error("Error in allocate:", err);
      next(err);
    }
  }

  /**
   * Handles deallocation of resources.
   * Extracts the event name from the request parameters and processes deallocation using provided data.
   * Responds with a 200 status if successful.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} res - The Express response object.
   * @param {Function} next - The next middleware function.
   */
  async function deallocate(req, res, next) {
    try {
      const { event_name } = req.params;
      // Process deallocation for the specified event using request body data
      await allocationServices.deallocate(event_name, req.body);
      res.status(200).end();
    } catch (err) {
      // Log error with the function name for easier debugging
      console.error("Error in deallocate:", err);
      next(err);
    }
  }

  // Return the controller functions as an object
  return {
    labAllocate,
    allocate,
    deallocate,
  }
}

export default createAllocationController;
