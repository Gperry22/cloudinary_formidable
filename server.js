const express = require("express");
const path = require("path");
const formidable = require("formidable");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
require("dotenv").config();

//Set your port
const PORT = 3001;
const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Serve up Public Folder
app.use(express.static("public"));

//Cloudinary.config
cloudinary.config({
  secure: true,
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.Api_Key,
  api_secret: process.env.Api_Secret,
});

// Log the configuration
console.log(cloudinary.config());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

//Post route that captures file
app.post("/api/upload", (req, res, next) => {

  const form = new formidable.IncomingForm();
  //Grabbing file path
  form.parse(req, function (err, fields, files) {

    console.log(files.profilePic.filepath);
    var oldPath = files.profilePic.filepath;
    //Creating new filename and directory to store file locally
    var newPath =
      path.join(__dirname, "uploads") + "/" + files.profilePic.originalFilename;
    var rawData = fs.readFileSync(oldPath);

    fs.writeFile(newPath, rawData, function (err) {
      if (err) console.log(err);
      //Upload to Cloudinary
      uploadImage(newPath);
      //Delete file locally
      deletefile(newPath);
      return res.send("Successfully uploaded");
    });
  });
});

// Cloudinary Function that Uploads an image file
const uploadImage = async (imagePath) => {
  // Use the uploaded file's name as the asset's public ID and
  // allow overwriting the asset with new versions
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, options);
    console.log(result);
    console.log(result.public_id);
  } catch (error) {
    console.error(error);
  }
};

// Function to delete uploaded image
const deletefile = async (filePath) => {
  const removeFile = await fs.access(filePath, (error) => {
    if (!error) {
      fs.unlink(filePath, function (error) {
        if (error) console.error("Error Occured:", error);
        console.log("File deleted!");
      });
    } else {
      console.error("Error Occured:", error);
    }
  });
};

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
