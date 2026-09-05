const mongoose = require('mongoose');
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const listing = require('../model/listing');
const initdata = require('./data');

main().then( async ()=>{
    console.log("connection database succesfully");
    await initData();
})
.catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initData = async () => {
    await listing.deleteMany({});
    await listing.insertMany(initdata.data);
    console.log(`data intialization success`);
}