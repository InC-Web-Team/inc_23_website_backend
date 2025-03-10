import { eventsName } from '../../../static/eventsData.mjs';

function eventsQueries(tableName) {
    const checkUserRegistration = (event_name) => {
        switch (event_name) {
            case eventsName[0]:
                return `SELECT email FROM ${tableName.conceptsUsersTable} WHERE email = ?;`
            case eventsName[1]:
                return `SELECT email FROM ${tableName.impetusUsersTable} WHERE email = ?;`
            case eventsName[2]:
                return `SELECT email FROM ${tableName.pradnyaUsersTable} WHERE email = ?;`
            case eventsName[3]:
                return `SELECT email FROM ${tableName.novaUsersTable} WHERE email = ?;`
        }
    }

    const completeRegistration = (event_name, no_of_members) => {
        let placeholders = ''
        if (event_name === 'pradnya') {
            for (let i = 0; i < no_of_members; i++) placeholders += ', ?, ?, ?, ?, ?'
        } else {
            for (let i = 0; i < no_of_members; i++) placeholders += ', ?, ?, ?, ?'
        }
        // console.log(process.env[`INSERT_${event_name.toUpperCase()}_${no_of_members}`] + placeholders + ');')
        return process.env[`INSERT_${event_name.toUpperCase()}_${no_of_members}`] + placeholders + ');'
    }

    const insertPICT = (no_of_members) => {
        let placeholders = ''
        for (let i = 0; i < no_of_members; i++) placeholders += ', ?, ?, ?'
        return 'CALL insert_c_internal_' + `${no_of_members}` + '(?,?,?,?,?,?' + placeholders + ');'
    }

    const insertImpetusPICT = (no_of_members) => {
        let placeholders = ''
        for (let i = 0; i < no_of_members; i++) placeholders += ', ?, ?, ?'
        return 'CALL insert_i_internal_' + `${no_of_members}` + '(?,?,?,?,?' + placeholders + ');'
    }

    const getRegistrations = () => 'CALL getRegistrations(?);'

    // const getProjects = (data) => `SELECT title, ${data}_projects.pid ,  abstract , domain, mode FROM ${data}_projects INNER JOIN ${data}_group_info ON ${data}_projects.pid = ${data}_group_info.pid;`

    const getProjects = (data) => `SELECT title, ${data}_projects.pid ,  abstract , domain, mode 
    FROM ${data}_projects 
    INNER JOIN ${data}_group_info ON ${data}_projects.pid = ${data}_group_info.pid;`

    const getProject = ({ event_name, pid }) => `SELECT title, ${event_name}_projects.pid ,  abstract , domain, mode FROM ${event_name}_projects INNER JOIN ${event_name}_group_info ON ${event_name}_projects.pid = ${event_name}_group_info.pid WHERE ${event_name}_projects.pid IN (${pid});`

    const updateProject = (data) => `UPDATE _projects INNER JOIN ${data.event_name}_group_info ON ${data.event_name}_projects.pid = ${data.event_name}_group_info.pid SET ${data.event_name}_projects.title = :title, ${data.event_name}_projects.abstract = :abstract, ${data.event_name}_group_info.mode = :mode WHERE ${data.event_name}_projects.pid = :pid;`


    const getProjectAbstractQ = (pid, event_name) => {
        return `SELECT title, abstract FROM ${event_name}_projects where pid = '${pid}'`;
    }

    const updateProjectAbstractQ = (event_name, pid, abstract) => {
        const escapedAbstract = abstract.replace(/'/g, "\\'").replace(/"/g, '\\"');
        return `UPDATE \`${event_name}_projects\` SET abstract = '${escapedAbstract}' where pid = '${pid}' ;`
    };

    const getBackups = () => {
        return `SELECT t.pid, t.step_1, t.step_2, step_3
        FROM inc_2024.tickets t where t.pid = "IM-ML0056"`
    }

    const getTechfiestaMembers = () => {
        return `CALL getTechfiestaMembers(?)`;
    }

    const getAllTicketsCountForBackup = () => {
        return 'SELECT COUNT(*) AS total FROM tickets WHERE date > ?';
    }

    const getAllTicketsForBackup = () => {
        return 'SELECT * FROM tickets WHERE date > ? ORDER BY date LIMIT ? OFFSET ?';
    }

    return {
        checkUserRegistration,
        completeRegistration,
        insertPICT,
        insertImpetusPICT,
        getRegistrations,
        getProjects,
        getProjectAbstractQ,
        updateProjectAbstractQ,
        getProject,
        updateProject,
        getBackups,
        getTechfiestaMembers,
        getAllTicketsCountForBackup,
        getAllTicketsForBackup,
        
    }
}

export { eventsQueries }