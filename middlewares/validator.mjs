import { validationResult } from 'express-validator';
import { AppError } from '../utils/index.js';

/**
 * Middleware function to validate the request using express-validator.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} _ - The Express response object (unused).
 * @param {Function} next - The next middleware function.
 */
function validator(req, _, next) {
    try {
        // Retrieve the validation result from the request
        const errors = validationResult(req);
        // Uncomment the line below for debugging purposes
        // console.log(errors);
        // If no errors, proceed to the next middleware
        if (errors.isEmpty()) {
            return next();
        }
        // Extract errors and pass them to the error handling middleware
        const extractedErrors = errors.array();
        next(new AppError(422, 'fail', extractedErrors));
    } catch (err) {
        console.error("Error in validator:", err);
        next(err);
    }
}

export default validator;
