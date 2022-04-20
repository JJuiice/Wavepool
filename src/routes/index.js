var express = require("express");
var router = express.Router();

const multer = require("multer");
const path = require("path");
const helpers = require("../helpers");
const fs = require("fs");

const WAV_BYTE_OFFSET = 44;
const OUTPUT_DIR = process.cwd() + "/src/public/audio";
const UNIQUE_SUFFIX = Date.now() + " - " + Math.round(Math.random() * 1e9);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + " - " + UNIQUE_SUFFIX + path.extname(file.originalname)
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
      return res.render("index", {
        errMsgDesc: "Please select an audio file to upload",
      });
    else if (err) return res.send(err);

    fs.readFile(process.cwd() + "/" + req.file.path, (err, data) => {
      if (err) {
        return res.render("index", {
          errMsgDesc: "Could not locate file locally",
        });
      } else {
        const ENC_DATA_SIZE = Buffer.from(req.body.enc_data).length;

        if (req.body.action === "enc") {
          if (ENC_DATA_SIZE > data.length - WAV_BYTE_OFFSET - 1 - 2) {
            res.render("index", {
              errMsgDesc: "Data to encrypt is too big for provided audio file",
            });
          } else {
            let encDataBinRep = "";
            encDataBinRep = req.body.enc_data
              .split("")
              .map((char) => {
                return char.charCodeAt(0).toString(2).padStart(8, "0");
              })
              .join("");

            for (let i = 0; i < encDataBinRep.length; i++) {
              data[WAV_BYTE_OFFSET + i] &= 0b11111110;
              data[WAV_BYTE_OFFSET + i] |= parseInt(encDataBinRep[i]);
            }

            for (let i = 0; i < 7; i++)
              data[WAV_BYTE_OFFSET + encDataBinRep.length + i] &= 0;

            const UNIQUE_OUT_DIR = OUTPUT_DIR + "/" + UNIQUE_SUFFIX;
            if (!fs.existsSync(UNIQUE_OUT_DIR))
              fs.mkdirSync(UNIQUE_OUT_DIR, { recursive: true });

            const OUT_FNAME =
              req.file.originalname.slice(0, -4) +
              "_encrypted" +
              req.file.originalname.slice(-4);
            fs.writeFile(UNIQUE_OUT_DIR + "/" + OUT_FNAME, data, (err) => {
              if (err) {
                res.render("index", {
                  errMsgDesc: "Error creating audio",
                });
              } else {
                res.render("download", {
                  encAudioLink: "/audio/" + UNIQUE_SUFFIX + "/" + OUT_FNAME,
                });
              }
            });
          }
        } else if (req.body.action === "dec") {
          let binChar = Array(8).fill("");
          let msg = "";
          let charInx = 0;

          do {
            for (let i = 0; i < 8; i++, charInx++)
              binChar[i] = (data[WAV_BYTE_OFFSET + charInx] & 1).toString();

            msg += String.fromCharCode(`0b${binChar.join("")}`);
          } while (binChar.join("") != "00000000");

          res.render("decryption", { decMsg: msg });
        } else {
          res.render("index", {
            errMsgDesc: "Please select an appropriate action to execute",
          });
        }

        fs.unlinkSync(process.cwd() + "/" + req.file.path);
      }
    });
  });
});

module.exports = router;
