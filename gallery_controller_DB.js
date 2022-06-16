const mysql = require("mysql2");
const express = require("express");
const app = express();
const fs = require("fs");
const Ajv = require("ajv");
const ajv = new Ajv();

const imageSchema = require("./gallerySchema.json");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "imageGallery",
});

con.query(`CREATE DATABASE IF NOT EXISTS imageGallery`, (err, result) => {
  if (err) throw err;
});
con.query(
  `CREATE TABLE IF NOT EXISTS images
    (id INT AUTO_INCREMENT PRIMARY KEY, path VARCHAR(255), fullpath VARCHAR(255),
     name VARCHAR(255), modified VARCHAR(255), galleryID INT)`,
  (err, result) => {
    if (err) throw err;
  }
);
con.query(
  `CREATE TABLE IF NOT EXISTS galleries 
      (id INT AUTO_INCREMENT PRIMARY KEY, path VARCHAR(255),
       name VARCHAR(255))`,
  (err, result) => {
    if (err) throw err;
  }
);

// lists all galleries
app.get("/gallery", (req, res) => {
  const getTitleImages = (callback) => {
    var sqlTitleImages = `SELECT g.path AS galleryPath, g.name AS galleryName, i.path, i.fullpath, i.name, i.modified 
      FROM galleries AS g, images AS i 
      WHERE g.id = i.galleryID AND g.name = i.name`;
    con.connect((err) => {
      if (err) throw err;
      con.query(sqlTitleImages, (err, result) => {
        if (err) throw err;
        return callback(result);
      });
    });
  };

  const getGalleries = (callback) => {
    var sqlGalleries = `SELECT DISTINCT path, name 
      FROM galleries`;
    con.connect((err) => {
      if (err) throw err;
      con.query(sqlGalleries, (err, result) => {
        if (err) throw err;
        return callback(result);
      });
    });
  };

  const galleriesOutput = () => {
    getTitleImages((result1) => {
      var titleImages = result1;
      getGalleries((result2) => {
        var galleries = result2;
        var output = [];
        var galleryNames = [];
        titleImages.forEach((image) => {
          galleryNames.push(image.galleryName);
          output.push(image);
        });
        galleries.forEach((gallery) => {
          if (galleryNames.includes(gallery.name)) {
          } else {
            output.push(gallery);
          }
        });
        return res.status(200).json({ galleries: output });
      });
    });
  };
  galleriesOutput();
});

// create new gallery
app.post("/gallery", (req, res) => {
  var galleryName = req.body.name;
  var galleryPath = encodeURI(req.body.name);

  const validate = ajv.compile(imageSchema);
  const valid = validate(req.body);
  if (!valid || req.body.name.includes("/")) {
    return res.status(400).json({
      msg: "Invalid request. The request doesn't conform to the schema.",
      error: validate.errors,
    });
  }

  const newDir = `Galleries/${req.body.name}`;
  fs.access(newDir, (err) => {
    if (err) {
      fs.mkdir(newDir, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("New directory creaeted succesfully");
          insertGallery();
        }
      });
    } else {
      return res.status(409).send({ msg: "Given directory already exists" });
    }
  });

  const insertGallery = () => {
    con.connect((err) => {
      if (err) throw err;
      var sql = `INSERT INTO galleries (path, name) VALUES ('${galleryPath}', '${galleryName}')`;
      con.query(sql, (err, result, fields) => {
        if (err) throw err;
      });
      con.query(
        `SELECT path, name FROM galleries WHERE name='${galleryName}'`,
        (err, result) => {
          if (err) throw err;
          return res
            .status(201)
            .json({ msg: "Gallery was created", gallery: result[0] });
        }
      );
    });
  };
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
