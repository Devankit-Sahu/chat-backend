import cloudinary from "cloudinary";
import { error } from "console";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    console.log(localFilePath);
    const response = await cloudinary.v2.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "chatfiles",
    });
    // file has been uploaded successfull
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log(error);
    // remove the locally saved temporary file as the upload operation got failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFilesFromCloudinary = async (public_id) => {
  try {
    if (!public_id) return null;
    //delete file from cloudinary
    const response = await cloudinary.v2.uploader.destroy(public_id);
    // file has been uploaded successfull
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

export { uploadOnCloudinary, deleteFilesFromCloudinary };
