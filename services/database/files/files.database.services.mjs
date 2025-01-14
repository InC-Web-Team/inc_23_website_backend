import { filesQueries } from '../../../models/index.js';
import cloudinaryUpload from '../../../utils/cloudinaryUpload.js';
import { AppError, fileToBase64 } from "../../../utils/index.js";
import { unlinkSync } from 'fs';

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
            //todo
            // cloudinary logic
            const url = await cloudinaryUpload(path, email)
            const [results] = await db.execute(filesQueries.insertFile, [email, file_name, size, url]).catch(err => { throw new AppError(400, 'fail', err.sqlMessage) })
            return results[0]
        } catch (err) {
            throw new AppError(500, 'fail', err.message || err)
        }
        finally{
            unlinkSync("./" + path, (err) => {
                if (err) throw err;
                // console.log('path/file.txt was deleted');
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