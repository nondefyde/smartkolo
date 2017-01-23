module.exports={
    logout: function(req,res){
        req.session.destroy();
        req.logout();
        res.redirect("/");
    }
};
