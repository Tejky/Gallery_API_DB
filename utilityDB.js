const express = require("express");
const app = express();
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const getModifiedTime = (newPath) => {
  return new Promise((resolve) => {
    fs.stat(newPath, (err, stats) => {
      if (err) {
        console.log(err);
      } else {
        var mtime = stats.mtime;
        return resolve(mtime);
      }
    });
  });
};

const saveFile = async (req, res, newPath) => {
  try {
    fs.writeFileSync(newPath, req.file.buffer, (err) => {
      if (err) {
      } else {
        console.log("The file was saved");
      }
    });
  } catch {
    return res.status(404).json({ msg: "Gallery not found" });
  }
};

module.exports.getModifiedTime = getModifiedTime;
module.exports.saveFile = saveFile;
