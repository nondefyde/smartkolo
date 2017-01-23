
module.exports = {
    homePage: function (req,res) {
        if(!req.user){
            return res.redirect("/");
        }
        res.render("user/home");
    }
};

