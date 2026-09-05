const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const port = 8080;
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./model/listing");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const listingschema = require("./schema.js");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", engine);

main()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const validateListing = (req, res, next) => {
  let { error } = listingschema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    return next(new ExpressError(400, errMsg));
  }
  next();
};

app.get("/", (req, res) => {
  res.send("root working");
});

// Index Route
app.get(
  "/listing",
  wrapAsync(async (req, res) => {
    const data = await Listing.find({});
    res.render("listing/home.ejs", { data });
  }),
);

// New Route (Must be above /:id)
app.get("/listing/new", (req, res) => {
  res.render("listing/new.ejs");
});

// Create Route
app.post(
  "/listing",
  validateListing,
  wrapAsync(async (req, res) => {
    const newlisting = new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listing");
  }),
);

// Show Route
app.get(
  "/listing/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id);
    if (!list) {
      throw new ExpressError(404, "Listing Not Found");
    }
    res.render("listing/showid.ejs", { list });
  }),
);

// Edit Route
app.get(
  "/listing/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id);
    if (!list) {
      throw new ExpressError(404, "Listing Not Found");
    }
    res.render("listing/editform.ejs", { list });
  }),
);

// Update Route
app.put(
  "/listing/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listing/${id}`);
  }),
);

// Delete Route
app.delete(
  "/listing/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listing");
  }),
);

// Page Not Found Catch-all
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Centralized Error Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listing/error.ejs", { err, message });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
