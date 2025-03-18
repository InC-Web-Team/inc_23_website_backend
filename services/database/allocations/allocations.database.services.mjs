import { allocationQueries } from "../../../models/index.js";
import { AppError } from "../../../utils/index.js";

/**
 * Provides services related to allocation operations.
 *
 * @param {Object} db - The database connection object.
 * @returns {Object} An object containing allocation service functions.
 */
function allocationServices(db) {
    /**
     * Retrieves lab information for a given event by combining allocation data with project details.
     *
     * @param {string} event_name - The name of the event.
     * @returns {Promise<Array>} A list of projects with associated judge IDs.
     * @throws {AppError} If an error occurs during the database queries.
     */
    const getLabs = async (event_name) => {
        try {
            // Get all pids and their associated jids from the allocation table for day 1
            const allocationQuery1 = `
                SELECT pid, GROUP_CONCAT(jid) AS jids 
                FROM allocations 
                WHERE jid LIKE 'CO-%' 
                  AND (JSON_CONTAINS(slots, '["4"]') OR JSON_CONTAINS(slots, '["5"]') OR JSON_CONTAINS(slots, '["6"]')) 
                GROUP BY pid;
            `;
            const [allocationResults1] = await db.execute(allocationQuery1).catch(err => {
                console.error("Error in getLabs during allocation query:", err);
                throw new AppError(400, 'fail', err.sqlMessage);
            });

            // Get all projects from the _projects table for the given event_name
            const projectsQuery = `SELECT pid, title, lab FROM ${event_name}_projects;`;
            const [projectsResults] = await db.execute(projectsQuery).catch(err => {
                console.error("Error in getLabs during projects query:", err);
                throw new AppError(400, 'fail', err.sqlMessage);
            });

            // Append judge IDs (jids) to each project for day 1
            const projectsWithJids = projectsResults.map(project => {
                const { pid } = project;
                const allocation = allocationResults1.find(a => a.pid === pid);
                const jids = allocation ? allocation.jids.split(',') : [];
                return { ...project, jids };
            });

            return projectsWithJids;
        } catch (err) {
            console.error("Error in getLabs:", err);
            throw err;
        }
    };

    /**
     * Updates the lab allocation for a given event.
     *
     * @param {string} event_name - The name of the event.
     * @param {Object} data - An object containing the lab and an array of project IDs (pids).
     * @returns {Promise<Object>} The result of the update operation.
     * @throws {AppError} If an error occurs during the update.
     */
    async function updateLab(event_name, data) {
        try {
            const preparedArray = [data.lab, ...data.pids];
            const [results] = await db
                .execute(allocationQueries.updateLab(event_name, data), preparedArray)
                .catch(err => {
                    console.error("Error in updateLab during db.execute:", err);
                    throw new AppError(400, 'fail', err.sqlMessage);
                });
            return results[0];
        } catch (err) {
            console.error("Error in updateLab:", err);
            throw err;
        }
    }

    /**
     * Allocates judges to projects for a given event.
     *
     * @param {string} event_name - The name of the event.
     * @param {Object} data - An object containing arrays of project IDs (pids), judge IDs (jids), and slot information.
     * @returns {Promise<Object>} The result of the allocation operation.
     * @throws {AppError} If an error occurs during the allocation.
     */
    async function allocate(event_name, data) {
        try {
            const [results] = await db
                .execute(allocationQueries.allocate(event_name, data.pids, data.jids, data.slots))
                .catch(err => {
                    console.error("Error in allocate during db.execute:", err);
                    throw new AppError(400, 'fail', err.sqlMessage);
                });
            return results[0];
        } catch (err) {
            console.error("Error in allocate:", err);
            throw err;
        }
    }

    /**
     * Deallocates judges from projects for a given event.
     *
     * @param {string} event_name - The name of the event.
     * @param {Object} data - An object containing arrays of project IDs (pids) and judge IDs (jids).
     * @returns {Promise<Object>} The result of the deallocation operation.
     * @throws {AppError} If an error occurs during the deallocation.
     */
    async function deallocate(event_name, data) {
        try {
            const [results] = await db
                .execute(allocationQueries.deallocate(event_name, data.pids, data.jids))
                .catch(err => {
                    console.error("Error in deallocate during db.execute:", err);
                    throw new AppError(400, 'fail', err.sqlMessage);
                });
            return results[0];
        } catch (err) {
            console.error("Error in deallocate:", err);
            throw err;
        }
    }

    /**
     * Retrieves evaluation statistics for projects of a given event.
     *
     * @param {string} event_name - The name of the event.
     * @returns {Promise<Array>} The evaluation statistics.
     * @throws {AppError} If an error occurs during the query.
     */
    async function evalStats(event_name) {
        try {
            let pid;
            if (event_name === 'impetus') pid = "IM-%";
            else pid = "CO-%";
            const [results] = await db
                .execute(allocationQueries.getEvalStats(event_name, pid))
                .catch(err => {
                    console.error("Error in evalStats during db.execute:", err);
                    throw new AppError(400, 'fail', err.sqlMessage);
                });
            return results;
        } catch (err) {
            console.error("Error in evalStats:", err);
            throw err;
        }
    }

    return {
        getLabs,
        updateLab,
        allocate,
        deallocate,
        evalStats
    };
}

export default allocationServices;
