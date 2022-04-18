var express = require("express");
var router = express.Router();

const multer = require("multer");
const path = require("path");
const helpers = require("../helpers");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Wavepool" });
});

/* POST form data */
router.post("/", function (req, res) {
  // Store uploaded audio file
  let upload = multer({
    storage: storage,
    fileFilter: helpers.audioFilter,
  }).single("af");

  upload(req, res, (err) => {
    if (req.fileValidationError) return res.send(req.fileValidationError);
    else if (!req.file)
      return res.send("Please select an audio file to upload");
    else if (err instanceof multer.MulterError) return res.send(err);
    else if (err) return res.send(err);

    fs.readFile(process.cwd() + "/" + req.file.path, (err, data) => {
      if (err) {
        res.send("Could not locate file locally");
      } else {
        const buf16Byte = Buffer.alloc(16);

        for (const pair of data.entries()) {
          const inx = pair[0] % 16;
          buf16Byte[inx] = pair[1];
          if (inx === 15) {
            console.log(buf16Byte);
            break;
          }
        }
        res.send("Done");
      }
    });
  });
});

module.exports = router;
