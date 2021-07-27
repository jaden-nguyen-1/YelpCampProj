const User = require('../models/user');

module.exports.renderRegisterForm = (req,res) => {
    res.render('users/register.ejs');
}

module.exports.createNewAccount = async (req,res,next) => {
    try{
        const { email, username, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success','Welcome to Yelp Camp');
            res.redirect('/campgrounds');
        })
    } catch(err){
        req.flash('error', err.message);
        res.redirect('register');
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login.ejs');
}

module.exports.login = (req, res) => {
    req.flash('success','welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res) => {
    req.logout();
    req.flash('success','Logged out');
    res.redirect('/campgrounds');
}