import cloudinary from '../config/cloudinary.js'


const uploadToCloudinary = async (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "company_logos"
            },
            (error, result) => {
                if(error) return reject(error)
                    resolve(result);
            }
        ).end(fileBuffer);
    });
}

export default uploadToCloudinary;