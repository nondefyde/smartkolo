
module.exports = {
    checkActivationPage: function (req,res) {
        if(!req.user){
            return res.redirect("/");
        }
        if(req.user.verified){
            return res.redirect("/home");
        }
        var user=req.user;

        req.logout();
        res.render("user/check_activation",{user:user});
    }
};


