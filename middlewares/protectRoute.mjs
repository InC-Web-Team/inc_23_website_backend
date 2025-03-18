import { AppError, verifyToken } from '../utils/index.js';

/**
 * Middleware functions to protect routes based on different user roles.
 *
 * @param {Object} adminServices - An object containing admin-related service functions.
 * @returns {Object} An object containing middleware functions for route protection.
 */
function protectRoute(adminServices) {

  /**
   * Verifies admin login for users with VIEWER role.
   * Checks for a token in signed cookies, verifies it, and ensures the user has the VIEWER role.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} _ - The Express response object (unused).
   * @param {Function} next - The next middleware function.
   */
  async function verifyAdminLogin(req, _, next) {
    try {
      // Retrieve token from either admin_data or judge_data signed cookies
      const { token } = req.signedCookies.admin_data || req.signedCookies.judge_data;
      if (!token) {
        throw new AppError(401, 'fail', 'You are not logged in! Please login in to continue');
      }
      // Verify the token and retrieve its payload
      const decode = verifyToken(token);
      // Retrieve admin details using the decoded username
      const result = await adminServices.findAdmin(decode.username);
      if (!result) {
        throw new AppError(404, 'fail', 'Invalid token, please login again');
      }
      // Check if the admin has the VIEWER role
      if (result.roles.includes('VIEWER')) {
        next();
      } else {
        throw new AppError(403, 'fail', 'Not authorized to perform this action');
      }
    } catch (err) {
      console.error("Error in verifyAdminLogin:", err);
      next(err);
    }
  }

  /**
   * Verifies judge login for users with JUDGE role.
   * Checks for a token in the judge_data signed cookie, verifies it, and ensures the user has the JUDGE role.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} _ - The Express response object (unused).
   * @param {Function} next - The next middleware function.
   */
  async function verifyJudgeLogin(req, _, next) {
    try {
      // Retrieve token from judge_data signed cookie
      const { token } = req.signedCookies.judge_data;
      if (!token) {
        throw new AppError(401, 'fail', 'You are not logged in! Please login in to continue');
      }
      // Verify the token and retrieve its payload
      const decode = verifyToken(token);
      // Retrieve admin details using the decoded username
      const result = await adminServices.findAdmin(decode.username);
      if (!result) {
        throw new AppError(404, 'fail', 'Invalid token, please login again');
      }
      // Check if the admin has the JUDGE role
      if (result.roles.includes('JUDGE')) {
        next();
      } else {
        throw new AppError(403, 'fail', 'Not authorized to perform this action');
      }
    } catch (err) {
      console.error("Error in verifyJudgeLogin:", err);
      next(err);
    }
  }

  /**
   * Verifies webmaster login for users with WEB_MASTER role.
   * Checks for a token in the admin_data signed cookie, verifies it, and ensures the user has the WEB_MASTER role.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} _ - The Express response object (unused).
   * @param {Function} next - The next middleware function.
   */
  async function verifyWebMasterLogin(req, _, next) {
    try {
      // Retrieve token from admin_data signed cookie
      const { token } = req.signedCookies.admin_data;
      if (!token) {
        throw new AppError(401, 'fail', 'You are not logged in! Please login in to continue');
      }
      // Verify the token and retrieve its payload
      const decode = verifyToken(token);
      // Retrieve admin details using the decoded username
      const result = await adminServices.findAdmin(decode.username);
      if (!result) {
        throw new AppError(404, 'fail', 'Invalid token, please login again');
      }
      // Check if the admin has the WEB_MASTER role
      if (result.roles.includes('WEB_MASTER')) {
        next();
      } else {
        throw new AppError(403, 'fail', 'Not authorized to perform this action');
      }
    } catch (err) {
      console.error("Error in verifyWebMasterLogin:", err);
      next(err);
    }
  }

  /**
   * Verifies admin login and checks for the ADMIN role.
   * Checks for a token in the admin_data signed cookie, verifies it, and ensures the user has the ADMIN role.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} _ - The Express response object (unused).
   * @param {Function} next - The next middleware function.
   */
  async function verifyAdminLoginAndAdminRole(req, _, next) {
    try {
      // Retrieve token from admin_data signed cookie
      const { token } = req.signedCookies.admin_data;
      if (!token) {
        throw new AppError(401, 'fail', 'You are not logged in! Please login in to continue');
      }
      // Verify the token and retrieve its payload
      const decode = verifyToken(token);
      // Retrieve admin details using the decoded username
      const result = await adminServices.findAdmin(decode.username);
      if (!result) {
        throw new AppError(404, 'fail', 'Invalid token, please login again');
      }
      // Check if the admin has the ADMIN role
      if (result.roles.includes('ADMIN')) {
        next();
      } else {
        throw new AppError(403, 'fail', 'Not authorized to perform this action');
      }
    } catch (err) {
      console.error("Error in verifyAdminLoginAndAdminRole:", err);
      next(err);
    }
  }

  return {
    verifyAdminLogin,
    verifyJudgeLogin,
    verifyAdminLoginAndAdminRole,
    verifyWebMasterLogin,
  };
}

export default protectRoute;
