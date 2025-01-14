// import multer from 'multer';

// const storage = multer.memoryStorage()

// const memberIDParser = multer({ storage, limits: { fileSize: 200000, files: 1 }}).single('member_id')


import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./");
  },
  filename: function (req, file, cb) {
    cb(null,  String(Date.now()) + Math.random()*100 + file.originalname);
  },
});

const memberIDParser = multer({ storage: storage  ,limits: { fileSize: 200000, files: 1 }}).single('member_id');

export { memberIDParser }
