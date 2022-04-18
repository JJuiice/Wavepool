const audioFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(wav|WAV)$/)) {
    req.fileValidationError = "Only *.wav files are supported at the moment";
    return cb(
      new Error("Only *.wav files are supported at the moment!"),
      false
    );
  }
  cb(null, true);
};
exports.audioFilter = audioFilter;
