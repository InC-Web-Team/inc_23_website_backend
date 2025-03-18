import { AppError, verifyToken } from '../utils/index.js';

function protectRoute(adminServices) {

  async function verifyAdminLogin(req, _, next) {
    try {
      const { token } = req.signedCookies.admin_data || req.signedCookies.judge_data;
      if (!token) {
        throw new AppError(401, 'fail', 'You are not logged in! Please login in to continue')
      }
      const decode = verifyToken(token)
      const result = await adminServices.findAdmin(decode.username)
      if (!result) throw new AppError(404, 'fail', 'Invalid token, please login again')
      if(result.roles.includes('VIEWER')) next();
      else throw new AppError(403, 'fail', 'Not authorized to perform this action');
    } catch (err) { next(err) }
  }

  async function verifyJudgeLogin(req, _, next) {
    try {
      const { token } = req.signedCookies.judge_data
      if (!token) {
        throw new AppError(401, 'fail', 'You are not logged in! Please login in to continue')
      }
      const decode = verifyToken(token)
      const result = await adminServices.findAdmin(decode.username)
      if (!result) throw new AppError(404, 'fail', 'Invalid token, please login again')
      if(result.roles.includes('JUDGE')) next();
      else throw new AppError(403, 'fail', 'Not authorized to perform this action');
    } catch (err) { next(err) }
  }

  async function verifyWebMasterLogin(req, _, next) {
    try {
      const { token } = req.signedCookies.admin_data
      if (!token) {
        throw new AppError(401, 'fail', 'You are not logged in! Please login in to continue')
      }
      const decode = verifyToken(token)
      const result = await adminServices.findAdmin(decode.username)
      if (!result) throw new AppError(404, 'fail', 'Invalid token, please login again')
      if(result.roles.includes('WEB_MASTER')) next();
      else throw new AppError(403, 'fail', 'Not authorized to perform this action');
    } catch (err) { next(err) }
  }

  async function verifyAdminLoginAndAdminRole(req, _, next){
    try {
      const { token } = req.signedCookies.admin_data
      if (!token) {
        throw new AppError(401, 'fail', 'You are not logged in! Please login in to continue')
      }
      const decode = verifyToken(token)
      const result = await adminServices.findAdmin(decode.username)
      if (!result) throw new AppError(404, 'fail', 'Invalid token, please login again')
      if(result.roles.includes('ADMIN')) next();
      else throw new AppError(403, 'fail', 'Not authorized to perform this action');
    } catch (err) { next(err) }
  }

  return {
    verifyAdminLogin,
    verifyJudgeLogin,
    verifyAdminLoginAndAdminRole,
    verifyWebMasterLogin,
  }
}

export default protectRoute;