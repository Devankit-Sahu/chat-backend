import mongoose from "mongoose";

const connectDatabase = async () => {
  await mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("Mongodb connected");
    })
    .catch((error) => {
      console.log(error);
    });
};
export default connectDatabase;
