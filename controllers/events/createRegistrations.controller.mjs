import { sendCookie, randomID, AppError } from "../../utils/index.js";
import { eventsName, teamSize, projectTypes } from "../../static/eventsData.mjs";
import { pictDetails } from "../../static/collegeDetails.mjs";
import { whatsappLinks } from "../../static/adminData.mjs";

function createRegistrationsController(
  eventsServices,
  filesServices,
  emailService
) {
  async function saveProject(req, res, next) {
    try {
      const { event_name, ticket } = req.query;
      const isTicketExists = await eventsServices.getTicketDetails(ticket);
      if (isTicketExists) {
        await eventsServices.editStepData(ticket, 1, req.body);
        res.status(200).json({success: true, ticket}).end()
      } else {
        const ticket = "INC-" + event_name[0].toUpperCase() + randomID(12);
        await eventsServices.insertTicket({
          ticket,
          step_1: req.body,
          step_2: {},
          step_no: 1,
        });
        res.status(201).json({success: true, ticket}).end()
      }
    } catch (err) {
      next(err);
    }
  }

  async function insertMember(req, res, next) {
    try {
      const { event_name, ticket } = req.query;

      const { email } = req.body;
      
      const user_email = await eventsServices.getUserRegistration(
        event_name,
        email
      );

      if (user_email)
        throw new AppError(
          404,
          "fail",
          `Email ${email} already registered for ${event_name}`
        );
      const member_id_file = req.file;
      const isTicketExists = await eventsServices.getTicketDetails(ticket);
      if (event_name === eventsName[2] && !isTicketExists) {
        const ticket = "INC-" + event_name[0].toUpperCase() + randomID(12);
        await eventsServices.insertTicket({
          ticket,
          step_1: {},
          step_2: [{ ...req.body }],
          step_no: 2,
        });
        // IMP
        if(member_id_file) await filesServices.insertFile(email, member_id_file);
        res.status(201).json({success: true, ticket}).end();
        return;
      }
      const existing_members = await eventsServices.getMembersFromTicket(
        ticket
      );
      if (!existing_members)
        throw new AppError(404, "fail", "Ticket does not exist");
      if (Array.isArray(existing_members.step_2)) {
        if (existing_members.step_2.length === teamSize.get(event_name))
          throw new AppError(400, "fail", "Maximum number of members reached");
        else {
          existing_members.step_2.forEach((member) => {
            if (member.email === email)
              throw new AppError(
                400,
                "fail",
                "Duplicate email address found in a team"
              );
          });
          if(member_id_file) await filesServices.insertFile(email, member_id_file);
          await eventsServices.editStepData(ticket, 2, [
            ...existing_members.step_2,
            req.body,
          ]);
        }
      } else {
        if(member_id_file) await filesServices.insertFile(email, member_id_file);
        await eventsServices.editStepData(ticket, 2, [{ ...req.body }]);
      }
      res.status(200).json({success: true, ticket}).end()
    } catch (err) {
      next(err);
    }
  }

  async function getAddedMembers(req, res, next) {
    try {
      let { ticket } = req.query;

      const memberDetails = await eventsServices.getMembersFromTicket(ticket);
      // // // console.log('getmems ', memberDetails);
      res.status(200).json(memberDetails)

    } catch (error) {
      // // // console.log(error)
      next(error)
    }
  }

  async function getTechfiestaMembers(req, res, next){
    try{
      const { team_id, event } = req.query;
      const members = await eventsServices.getTechfiestaMembersFromId(team_id?.toUpperCase());
      // console.log(members);
      if(!members){
        throw new AppError(
          404,
          'fail',
          `Invalid Techfiesta Team ID.`
        )
      }
      if((members.is_used.includes("nova") && (event === "nova")) || (members.is_used.includes("impetus") && (event === "impetus" || event === "concepts")) || (members.is_used.includes("concepts") && (event === "impetus" || event === "concepts"))){
        // console.log('here')
        throw new AppError(
          404,
          'fail',
          `Team ${team_id} already registered. Change Team ID to continue.`
        )
      }
      else res.status(200).json(members);
    }
    catch(error){
      next(error)
    }
  }

  async function addTechfiestaMembers(req, res, next){
    try {
      const { ticket } = req.query;
      await eventsServices.editStepData(ticket, 2, [
        ...req.body
      ]);
      res.json('hello');
    } catch (error) {
      next(error)
    }
  }

  async function deleteMember(req, res, next) {
    try {
      let { ticket, index } = req.query;
      // let { index } = req.body; // Assuming memberID is the key for the member details to delete
      await eventsServices.deleteMemberDetails(ticket, Number(index));
      res.status(200).json({ message: 'Member details deleted successfully', success: true, ticket });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async function saveCollegeDetails(req, res, next) {
    try {
      const { ticket, event_name } = req.query;
      if (req.body.isPICT === "1") {
        req.body = { ...req.body, ...pictDetails };
      }
      await eventsServices.editStepData(ticket, 3, req.body);
      res.status(200).json({success: true, ticket}).end()
    } catch (err) {
      next(err);
    }
  }

  async function requestRegistration(req, res, next) {
    try {
      const { event, ticket } = req.query;
      let results = await eventsServices.getTicketDetails(ticket);
      if (!results) throw new AppError(404, "fail", "Ticket does not exist");
      if (results.payment_id !== "")
        throw new AppError(
          400,
          "fail",
          "Registration done using this ticket and payment under verification"
        );
      else if (results.step_no === 3) {
        const { isPICT, isInternational } = results.step_3;
        const { techfiesta, team_id } = results.step_1;
        if(techfiesta === "1"){
          req.body = { ...req.body, payment_id: "TECHFIESTA" };
        } else if (isPICT === "1") {
          req.body = { ...req.body, payment_id: "PICT" };
        } else if (isInternational === "1") {
          req.body = { ...req.body, payment_id: "INTERNATIONAL" };
        }
        else {
          const dbPaymentId = await eventsServices.checkPaymentIdExist(req.body.payment_id);
          if(dbPaymentId.trim() === req.body.payment_id.trim()){
            throw new AppError(400, "fail", "Transaction ID already used");
          }
        }
        req.body = { ...req.body, team_id: team_id || '' };
        await eventsServices.saveRegistrationDetails({ ...req.body, ticket, event }, 4);
        res.status(201).json({success: true, ticket}).end()
      } else if (results.step_no === 5 && results.payment_id !== "")
        throw new AppError(
          400,
          "fail",
          "Registration already completed using this ticket"
        );
      else throw new AppError(400, "fail", "Registration steps not completed");
    } catch (err) {
      next(err);
    }
  }

  async function verifyPendingPayment(req, res, next) {
    try {
      const { ticket } = req.body;
      const { event_name } = req.params;
      const results = await eventsServices.getTicketDetails(ticket);
      if (!results) throw new AppError(404, "fail", "Ticket does not exist");
      if (results.step_no === 4) {
        const { pid } = await eventsServices.completeRegistration(
          event_name,
          results
        );
        const formattedEventName = event_name[0].toUpperCase() + event_name.slice(1);
        let formattedEmail = '';
        if(Array.isArray(results.step_2)){
          formattedEmail = results.step_2.map((member) => `${member.name} <${member.email}>`).slice(0, 2).join(',');
        }
        const whatsapp_url = whatsappLinks.get(event_name);
        await emailService.eventRegistrationEmail(formattedEventName, {
          ...results,
          email: formattedEmail,
          whatsapp_url,
          pid,
        });
        res.status(201).json({success: true}).end();
      } else if (results.step_no === 5 && results.payment_id !== "")
        throw new AppError(
          400,
          "fail",
          "Registration already completed using this ticket"
        );
      else throw new AppError(400, "fail", "Registration steps not completed");
    } catch (err) {
      next(err);
    }
  }

  async function updateProject(req, res, next) {
    try {
      const { pid, event_name } = req.query;
      const existingData = await eventsServices.getProject(event_name, pid);
      if (!existingData)
        throw new AppError(404, "fail", "Project does not exist");
      const newData = {
        title: req.body.title || existingData.title,
        abstract: req.body.abstract || existingData.abstract,
        mode: req.body.mode || existingData.mode,
      };
      await eventsServices.updateProject({ pid, event_name, ...newData });
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  async function insertInternalPICT(req, res, next) {
    try {
      const { event_name } = req.query
      const newData = {
        title: req.body.title,
        abstract: req.body.abstract,
        domain: req.body.domain,
        guide_name: req.body.guide_name || '',
        guide_email: req.body.guide_email || '',
        project_type: projectTypes[req.body.project_type],
        year: req.body?.year,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        department: req.body.department
      };
      // // // console.log(newData);
      // switch (event_name) {
      //   case eventsName[0]:
      //     const result = await eventsServices.insertPICT(newData)
      //     res.status(200).send(result);
      //     break;

      //   case eventsName[1]:
      //     const results = await eventsServices.insertImpetusPICT(newData)
      //     res.status(200).send(results);
      //     break;
      // }
    } catch (err) {
      next(err);
    }
  }

  async function getAllTeamLeaders(req, res, next){
    try {
      // const results = await eventsServices.getAllTeamLeaders();

      const sentEmails = ["adharashivkar17@gmail.com","ananya.jadhav59@gmail.com","himansheejaiswal2007@gmail.com","naumaanahmed3@gmail.com","chaitanyaasole@gmail.com","mohammadali.t2005@gmail.com","pranavsamal43@gmail.com","sakshirajpalchoudhari@gmail.com","anashasansiddique@gmail.com","tushardhokariya@gmail.com","harshadkothawale1@gmail.com","gangardedipali2104@gmail.com","aditijadhav1208@gmail.com","anurag.official626@gmail.com","adarshythakare@gmail.com","harshkharat9011@gmail.com","omkar.patil_entc23@pccoer.in","tanawadend@gmail.com","palmateshubham9@gmail.com","ss2727303@gmail.com","khyatichaudhari2626@gmail.com","yashwavhal525@gmail.com","hrutamsabale@gmail.com","maliatharv3012@gmail.com","apurvajoshi@gmail.com","jaydip.22310913@viit.ac.in","aniketwarule775@gmail.com","aabha.jog@gmail.com","gargirahane2105@gmail.com","rushabhratnaparkhi1@gmail.com","anjaliraste545@gmail.com","rayyan23012005@gmail.com","pratham.tomar23@vit.edu","contact2abmahajan@gmail.com","mehtaharsh3012@gmail.com","aniketh.pala22@vit.edu","innanigunjan@gmail.com","4731gauravsingh@gmail.com","aftabnaik1419@gmail.com","arya.shinde23@vit.edu","varadfegade@gmail.com","aniketpathak581@gmail.com","parthhpatil2005@gmail.com","badepranav2045@gmail.com","sakksheegandhi17@gmail.com","bokilaary@gmail.com","hkumbhar675@gmail.com","snehagulve25@gmail.com","dishaghodke29@gmail.com","yaminithakare7@gmail.com","raj.parikh23@vit.edu","bhaktiwarghude13@gmail.com","Kapadetejas198@gmail.com","rajiv.chaurasiya23@vit.edu","shreyapillai819@gmail.com","atharvraut2109@gmail.com","dnyaneshwariborse12@gmail.com","rohitjadhav5105@gmail.com","gouribasantgupta@gmail.com","nakshatrasaboo123@gmail.com","kmpatil9922@gmail.com","aaditya.22310092@viit.ac.in","Dakshatrawat77@gmail.com","atharvachamp45@gmail.com","sdyadav7049@gmail.com","nidhiofficial700@gmail.com","shuvayu0811@gmail.com","5riteshrp@gmail.com","pratiknarule88@gmail.com","archishaagrawal224@gmail.com","palakssingh.205@gmail.com","swaroopsandanshive@gmail.com","gaureshaher2005@gmail.com","abhinavshinde47@gmail.com","abhirajjawalkar556@gmail.com","anushka.mamane@cumminscollege.in","adityakarhale.computertcoer@kjei.edu.in","ghugeshruti27@gmail.com","purvesh0207@gmail.com","gajaresujit52@gmail.com","allen8106.j@gmail.com","omh85375@gmail.com","gayatrikhade04@gmail.com","majrituraj@gmail.com","revanwarvaishnavi@gmail.com","arpitap1902@gmail.com","swaramhatre2020@gmail.com","madhurisonawane151104@gmail.com","chavandiksha524@gmail.com","anaghakadam1305@gmail.com","aditiyelpale1777@gmail.com","rajshreebabar2006@gmail.com","cpranali405@gmail.com","nehadhawle09@gmail.com","gaurichilwant0109@gmail.com","jaspalsinghwasal@gmail.com"];

      // const emails = results
      // .map((result) => result.email)
      // .filter((email) => email && !sentEmails.includes(email));

      console.log('starting job to send mails');

      // await emailService.sendBulkEmail({emails});

      console.log('sent all mails successfully');
      return res.json('mails sent successfully');
    } catch (error) {
      next(error);
    }
  }

  return {
    saveProject,
    insertMember,
    getAddedMembers,
    saveCollegeDetails,
    requestRegistration,
    verifyPendingPayment,
    updateProject,
    insertInternalPICT,
    deleteMember,
    getTechfiestaMembers,
    addTechfiestaMembers,
    getAllTeamLeaders,

  };
}

export default createRegistrationsController;