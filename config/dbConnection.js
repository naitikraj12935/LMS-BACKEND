import mongoose from "mongoose";

mongoose.set('strictQuery',false);

const connectionDb=async ()=>{
    try {
        const {connection}=await mongoose.connect(
          process.env.MONGO_URI
        )

        if(connection)
        {
            console.log(`connection to mongodb: ${connection.host}`)
        }
        
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
    
}

export default connectionDb;

