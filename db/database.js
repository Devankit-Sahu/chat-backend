import mongoose from "mongoose";

const connectDatabase = async () => {
  const uri =
    process.env.NODE_ENV === "production"
      ? process.env.MONGODB_URI_PROD
      : process.env.MONGODB_URI_DEV;
  await mongoose
    .connect(uri)
    .then(() => {
      console.log("Mongodb connected");
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
};
export default connectDatabase;
