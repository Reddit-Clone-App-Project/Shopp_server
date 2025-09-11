import multer from 'multer';

const storage = multer.memoryStorage();

// Change from .fields() to .any() to accept all incoming files
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    }
}).any();

export default upload;