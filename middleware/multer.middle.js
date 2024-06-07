import path from 'path'
import multer from 'multer'
import { Error } from 'mongoose';

const upload=multer({
    dest:'Upload/',
    limits:{fileSize: 50 *1024 *1024}, // maxlimit-50mb
    storage:multer.diskStorage({
        destination:"Upload/",
        filename:(_req,file,cb)=>{
            cb(null,file.originalname);
        },
    }),
    fileFilter:(_req,file,cb)=>{
        let ext=path.extname(file.originalname);

        if(ext !==".jpg" && ext !==".jpeg" && ext !==".webp" && ext !==".png" && ext !==".mp4" && ext!==".webm" )
        {
            cb(new Error(`unsupported file type !n${ext}`),false);
            return;
        }
        cb(null,true);
    }
});

export default upload;