import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/storage/services');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueSuffix);
    }
});

export const upload = multer({ storage: storage });

