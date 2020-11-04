import multer from 'multer';
export default {
  public_folder: multer({dest: 'public/uploads'}),
  tmp_folder: multer({dest: 'tmp/'}),
  disk: multer({storage: multer.diskStorage({
    destination: (request, file, cb)=>{
      cb(null, 'public/uploads');
    },
    fileName: (request, file, cb)=>{
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  })}),
};
