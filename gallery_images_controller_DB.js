const express = require("express");
const app = express.Router();
const mysql = require("mysql2");
const path = require("path");
const utility = require("./utilityDB.js");
const fs = require("fs");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "#Abc1234",
  database: "imageGallery",
});

// lists photos in gallery
app.get("/gallery/:path(*)", (req, res) => {
  var sqlID = `SELECT id, path, name
    FROM galleries
    WHERE name = '${req.params.path}'
    LIMIT 1`;
  con.connect((err) => {
    if (err) throw err;
    con.query(sqlID, (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
        return res.status(404).json({ msg: "Gallery does not exist" });
      }
      getImageList(result[0]);
    });
  });
  const getImageList = (galleryID) => {
    var sql = `SELECT i.path, i.fullpath, i.name, i.modified
      FROM images AS i
      WHERE i.galleryID = ${galleryID.id}`;
    con.query(sql, (err, result) => {
      if (err) throw err;
      gallery = { path: galleryID.path, name: galleryID.name };
      return res.status(200).json({ gallery: gallery, images: result });
    });
  };
});

//delete photo or gallery
app.delete("/gallery/:path(*)", (req, res) => {
  var deleteDir = `Galleries/${req.params.path}`;
  const checkDirExist = (req, res, dirPath) => {
    try {
      fs.access(dirPath, () => {
        deleteFile(req, res, dirPath);
      });
    } catch {
      return res.status(404).json({ msg: "Gallery/photo does not exist" });
    }
  };
  const deleteFile = (req, res, dirPath) => {
    fs.stat(dirPath, (err, stats) => {
      if (stats.isDirectory()) {
        fs.rmdir(dirPath, { recursive: true }, (err) => {
          if (err) {
            throw err;
          }
        });
        deleteDirDB();
      } else {
        fs.unlink(dirPath, (err) => {
          if (err) {
            throw err;
          }
        });
        deleteFileDB();
      }
    });
  };

  const deleteDirDB = async () => {
    var sql = `DELETE FROM galleries
      WHERE name = '${req.params.path}'`;
    con.connect((err) => {
      if (err) throw err;
      con.query(sql, (err, result) => {
        if (err) throw err;
        return res.status(200).json({ msg: "Gallery was deleted" });
      });
    });
  };

  const deleteFileDB = async () => {
    var sql = `DELETE FROM images
      WHERE path = '${path.basename(req.params.path)}'`;
    con.connect((err) => {
      if (err) throw err;
      con.query(sql, (err, result) => {
        if (err) throw err;
        return res.status(200).json({ msg: "Photo was deleted" });
      });
    });
  };
  checkDirExist(req, res, deleteDir);
});

//upload file and save it to local directory
app.post("/gallery/:path(*)", upload.single("image"), (req, res) => {
  if (req.file === undefined) {
    return res.status(400).json({ msg: "Invalid request - file not found" });
  }
  if (req.file.mimetype != "image/jpeg") {
    return res.status(400).json({ msg: "File not of type image/jpeg" });
  }
  const checkDirExist = () => {
    var galleryPath = `Galleries/${req.params.path}`;
    try {
      fs.accessSync(galleryPath, () => {});
      getGalleryID();
    } catch {
      return res.status(404).json({ msg: "Gallery does not exist" });
    }
  };
  const imageNewPath = `Galleries/${req.params.path}/${req.file.originalname}`;
  let imageName = path.basename(imageNewPath, path.extname(imageNewPath));
  imageName = imageName[0].toUpperCase() + imageName.substring(1);

  const getGalleryID = () => {
    con.connect((err) => {
      con.query(
        `SELECT id FROM galleries WHERE name='${req.params.path}'`,
        (err, result) => {
          if (err) throw err;
          var galleryID = result[0].id;
          insertImage(galleryID);
        }
      );
    });
  };

  const insertImage = async (galleryID) => {
    await utility.saveFile(req, res, imageNewPath);
    var sql = `INSERT INTO images (path, fullpath, name, modified, galleryID) VALUES (?, ?, ?, ?, ?)`;
    con.query(
      sql,
      [
        path.basename(imageNewPath),
        encodeURI(req.params.path) + "/" + path.basename(imageNewPath),
        imageName,
        await utility.getModifiedTime(imageNewPath),
        galleryID,
      ],
      (err, result) => {
        if (err) throw err;
        console.log("Values inserted");
        imageID = result.insertId;
        con.query(
          `SELECT path, fullpath, name, modified FROM images WHERE id = ${imageID}`,
          (err, resultOutput) => {
            return res.status(201).json({ uploaded: resultOutput });
          }
        );
      }
    );
  };
  checkDirExist();
});

module.exports = app;
