/**
 * Created by ILYASANATE on 22/01/2017.
 */
module.exports = {
    indexPage: function (req,res) {
        if(req.user){
            return res.redirect("/home");
        }
        res.render("main/index",{message: req.flash('loginMessage')});
    }
};