import { Router } from 'express';
import createBackupController from '../../controllers/backup/backup.controller.mjs';

const backupRouter = Router()

function createBackupRouter(eventsServices, adminServices) {

  const { backupTickets, backupAllTables } = createBackupController(eventsServices, adminServices);
  
  backupRouter.get('/tickets', backupTickets)
  backupRouter.get('/backup-all', backupAllTables)

	return backupRouter;
}

export default createBackupRouter;