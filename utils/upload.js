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

const upload = multer({ storage });
module.exports = upload;