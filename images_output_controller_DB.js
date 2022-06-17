const express = require("express");
const app = express.Router();
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const webp = require("webp-converter");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//display image file
app.get("/images/:resolution/:path(*)", (req, res) => {
  const originalImage = `Galleries/${req.params.path}`;
  fs.stat(originalImage, (err, stats) => {
    if (err === null) {
      let [width, height] = req.params.resolution.split("x");
      width = parseInt(width);
      height = parseInt(height);
      (async () => {
        try {
          await sharp(originalImage)
            .resize({
              width: width || null,
              height: height || null,
            })
            .toFile("Output_Images/output.jpg");
          const result = webp.cwebp(
            "Output_Images/output.jpg",
            "Output_Images/output.webp"
          );
          result.then(() => {
            res.sendFile(path.resolve("Output_Images/output.webp"));
          });
        } catch (err) {
          if (stats.isFile()) {
            return res
              .status(500)
              .json({ msg: "Photo preview can't be generated" });
          } else {
            return res.status(500).json({ msg: "Not a file" });
          }
        }
      })();
    } else {
      return res.status(404).json({ msg: "Photo not found" });
    }
  });
});

module.exports = app;
