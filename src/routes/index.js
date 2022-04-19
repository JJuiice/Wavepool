var express = require("express");
var router = express.Router();

const multer = require("multer");
const path = require("path");
const helpers = require("../helpers");
const fs = require("fs");

const WAV_BYTE_OFFSET = 44;
const OUTPUT_DIR = process.cwd() + "/output";

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
        let encDataBinRep = "";
        encDataBinRep = req.body.enc_data
          .split("")
          .map((char) => {
            return char.charCodeAt(0).toString(2).padStart(8, "0");
          })
          .join("");

        for (let i in encDataBinRep) {
          data[WAV_BYTE_OFFSET + i] &= 0b11111110;
          data[WAV_BYTE_OFFSET + i] |= parseInt(encDataBinRep[i]);
        }

        const OUTPUT_FNAME =
          req.file.originalname.slice(0, -4) +
          " - " +
          Date.now() +
          " - " +
          Math.round(Math.random() * 1e9) +
          req.file.originalname.slice(-4);

        if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

        fs.writeFile(OUTPUT_DIR + "/" + OUTPUT_FNAME, data, (err) => {
          if (err) {
            console.error(err);
            res.send("Error");
          } else {
            res.send("Done");
          }
        });
      }
    });
  });
});

module.exports = router;
