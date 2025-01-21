import { filesQueries } from '../../../models/index.js';
import cloudinaryUpload from '../../../utils/cloudinaryUpload.js';
import { AppError } from "../../../utils/index.js";
import { unlink } from 'fs';

function filesServices(db) {
    async function checkFile(email) {
        try {
            const [results] = await db.execute(filesQueries.checkFile('*'), [email]).catch(err => { throw new AppError(400, 'fail', err.sqlMessage) })
            return results[0]
        } catch (err) {
            throw new AppError(500, 'fail', err.message || err)
        }
    }

    async function insertFile(email, file) {
        const { path, size, originalname } = file
        try {
            const file_name = `${email} - ${originalname}`
            // cloudinary logic
            const url = await cloudinaryUpload(path, email)
            const [results] = await db.execute(filesQueries.insertFile, [email, file_name, size, url]).catch(err => { throw new AppError(400, 'fail', err.sqlMessage) })
            return path
        } catch (err) {
            throw new AppError(500, 'fail', err.message || err)
        }
        finally{
					unlink(path, (err) => {
						if (err) {
							console.error(`Error removing file: ${err}`);
							return;
						}
					});
        }
    }

    async function getIDFile(emails) {
        try {
          const [results] = await db.execute(`SELECT * FROM files_verify`)

          // // console.log(results)
        //   return results.reduce((acc, cur) => {
        //     acc[cur.email] = cur.file;
        //     return acc;
        //   }, {});
        return results;
        } catch (err) {
          throw new AppError(500, 'fail', err.message || err);
        }
      }
      
      

    return {
        checkFile,
        insertFile,
        getIDFile
    }
}

export default filesServices;