const express = require("express");
const app = express();
const mysql = require("mysql2");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345",
});

con.query(`CREATE DATABASE IF NOT EXISTS imageGallery`, (err, result) => {
  if (err) throw err;
  con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "imageGallery",
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
  con.end();
});

const gallery = require("./gallery_controller_DB.js");
const gallery_images = require("./gallery_images_controller_DB.js");
const images_output = require("./images_output_controller_DB.js");

app.use("/", gallery);
app.use("/", gallery_images);
app.use("/", images_output);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
