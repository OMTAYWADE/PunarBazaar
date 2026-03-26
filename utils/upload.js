const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cd) {
        cd(null, 'public/uploads')
    },
    filename: function (req, file, cd) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cd(null, uniqueName);
    }
});

const fileFilter = (req, file, cd) => {
    const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowed.includes(ext)) {
        cd(null, true);
    } else {
        cd(new Error("Only images and pdf is allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

module.exports = upload;