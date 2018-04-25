var express =  require("express");
var router  =  express.Router();
var Campground = require("../models/campground");
var middleware =  require("../middleware");

//Index - show all campgrounds

router.get("/", function(req, res){

//get all campgrounds from db
Campground.find({}, function(err, allcampgrounds){
    if(err){
        console.log(err);
    } else{
            res.render("campgrounds/index", {campgrounds:allcampgrounds, currentUser: req.user});
        }
    });
});

//Create - add new camp ground to DB

router.post("/", middleware.isLoggedIn, function(req ,res){
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, price: price, description: desc, author:author};
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/campgrounds");
        }
    });
    
});

//New -shows form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});


//Show -shows the stuff
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if(err || !foundCampground){
           req.flash("error", "Page not found")
           res.redirect("back")
       }else{
           res.render("campgrounds/show", {campground: foundCampground});
       }
    });
});

//Edit route

router.get("/:id/edit", middleware.checkCampgroundOwnerShip, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//update route

router.put("/:id", middleware.checkCampgroundOwnerShip, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//destroy

router.delete("/:id", middleware.checkCampgroundOwnerShip, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else{
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;