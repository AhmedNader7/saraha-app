import multer from "multer";
import path from "path";
import config from "../config/index.js";
import sharp from "sharp"; // Optional resize, install if needed `npm i sharp`

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.path);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") &&
    ["jpg", "jpeg", "png"].includes(
      path.extname(file.originalname).toLowerCase().slice(1),
    )
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxSize },
  fileFilter,
});

export const uploadProfilePic = upload.single("profilePicture");

export const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `resized-${req.file.filename}`;
    const resizedPath = path.join(config.upload.path, filename);

    await sharp(req.file.path)
      .resize(300, 300)
      .jpeg({ quality: 80 })
      .toFile(resizedPath);

    req.file.path = resizedPath;
    req.file.filename = filename;

    // Delete original if needed
    // fs.unlinkSync(req.file.path);

    next();
  } catch (error) {
    next(error);
  }
};

export default upload;
