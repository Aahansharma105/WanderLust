const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}= require("./schema.js");

module.exports.isLoggedIn = (req,res,next) => {

    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in to create a new listing!");
        return res.redirect("/login")
    }
    next();
}; 

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl =  req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not authorized to do this action!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req,res,next) => {
    let { error} = listingSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else {
        next();
    }
};

module.exports.validateReview = (req,res,next) => {
    let { error} = reviewSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect("/listings");
    }

    // Check if `currUser` exists
    if (!res.locals.currUser) {
        req.flash("error", "You must be logged in to perform this action.");
        return res.redirect("/login");
    }

    // Check if the current user is the author of the review
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You do not have permission to do that.");
        return res.redirect("/listings");
    }

    next();
};
