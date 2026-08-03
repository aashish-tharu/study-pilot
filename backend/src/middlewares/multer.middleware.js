import multer from "multer";

const storage = multer.memoryStorage();

const allowedFilesType = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg"
];

export const upload = multer({
    storage,
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
        if (!allowedFilesType.includes(file.mimetype)) {
            return cb(new Error("Only PDF file are allowed."))
        }
        cb(null, true)
    }
})