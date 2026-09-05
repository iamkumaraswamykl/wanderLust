const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const port = 8080;
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require('./model/listing');
const methodOverride = require('method-override')
const engine = require('ejs-mate');

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname , 'public')))
app.set('views',path.join(__dirname , 'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'))
app.engine('ejs', engine);

main().then(()=>{
    console.log("connection database succesfully");
})
.catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get('/',(req , res)=>{
    res.send(`root working`);
})

app.get('/listing',async (req ,res)=>{
    const data = await Listing.find({});
    res.render('listing/home.ejs' , {data});
})

app.get('/listing/new',(req,res)=>{
    res.render('listing/new.ejs');
})

app.get('/listing/:id',async (req,res)=>{
    let {id} = req.params;
    const list = await Listing.findById(id);
    res.render('listing/showid.ejs', {list});
})

app.get('/listing/:id/edit' , async (req, res)=>{
    let { id } = req.params;
    const list = await Listing.findById(id);
    console.log(list._id);
    res.render('listing/editform.ejs',{list});
})

app.post('/listing',async (req ,res)=>{
    const newlisting = new Listing(req.body.listing)
    await newlisting.save().catch(err => {
        console.log(err);
    })
    res.redirect('/listing');
})

app.put('/listing/:id',async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listing/${id}`);
})

app.delete('/listing/:id',async (req,res)=>{
    let {id} = req.params;
    console.log(id);
    await Listing.findByIdAndDelete(id);
    res.redirect(`/listing`);
})

app.listen(port, ()=>{
    console.log(`server listening`);
})