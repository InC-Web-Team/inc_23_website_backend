import { Router } from 'express';
import createBackupController from '../../controllers/backup/backup.controller.mjs';

const backupRouter = Router()

function createBackupRouter(eventsServices, adminServices) {

  const { backupTickets } = createBackupController(eventsServices, adminServices);
  
  backupRouter.get('/tickets', backupTickets)

	return backupRouter;
}

export default createBackupRouter;