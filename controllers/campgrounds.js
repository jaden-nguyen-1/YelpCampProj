const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { allCampgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs');
};


module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map(file => ({url: file.path, filename: file.filename}))
    newCampground.author = req.user._id;
    await newCampground.save();
    console.log(newCampground);
    req.flash('success','Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCampground._id}`);
}


module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(foundCampground);
    if (!foundCampground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', { foundCampground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    if (!foundCampground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit.ejs', { foundCampground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(file => ({url: file.path, filename: file.filename}));
    updatedCampground.images.push(...imgs);
    await updatedCampground.save();
    if (req.body.deleteImages){
        for (let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    req.flash('success','Successfully updated campground');
    res.redirect(`/campgrounds/${updatedCampground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted campground!');
    res.redirect('/campgrounds');
}

