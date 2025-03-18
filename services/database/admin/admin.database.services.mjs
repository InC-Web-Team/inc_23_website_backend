import { adminQueries, judgesQueries } from '../../../models/index.js';
import { AppError } from "../../../utils/index.js";

/**
 * Provides administrative services.
 *
 * @param {Object} db - The database connection object.
 * @returns {Object} An object containing functions to handle admin operations.
 */
function adminServices(db) {
  /**
   * Finds an admin by username.
   *
   * @param {string} username - The username of the admin.
   * @returns {Object} The admin record.
   * @throws {AppError} If there's an error during the database query.
   */
  async function findAdmin(username) {
    try {
      // Execute the query to find an admin using the provided username.
      const [[results]] = await db.execute(adminQueries.findAdmin, [username]).catch(err => {
        console.error("Error in findAdmin during db.execute:", err);
        throw new AppError(400, 'fail', err.sqlMessage);
      });
      // Return the first record from the results.
      return results[0];
    } catch (err) {
      console.error("Error in findAdmin:", err);
      throw new AppError(500, 'fail', err);
    }
  }

  /**
   * Logs in a judge using provided credentials.
   *
   * @param {Object} data - An object containing judge login details.
   * @returns {Object} The judge record.
   * @throws {AppError} If there's an error during the login process.
   */
  async function loginJudge(data) {
    try {
      // Execute the query for judge login using named placeholders.
      const [results] = await db
        .execute(
          { sql: judgesQueries.loginJudge, namedPlaceholders: true },
          data
        )
        .catch((err) => {
          console.error("Error in loginJudge during db.execute:", err);
          throw new AppError(400, "fail", err.sqlMessage);
        });
      // Return the first judge record found.
      return results[0];
    } catch (err) {
      console.error("Error in loginJudge:", err);
      throw err;
    }
  }

  return {
    findAdmin,
    loginJudge,
  }
}

export default adminServices;
