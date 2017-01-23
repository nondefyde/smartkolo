/**
 * Created by ILYASANATE on 23/01/2017.
 */
var User=require('../models/user');
module.exports = {

    signupPage: function (req,res) {
        res.render("main/signup",{message: req.flash('msg1')});
    },
    singupPost: function(req,res,next){
        if(req.body.username && req.body.fname && req.body.lname && req.body.email && req.body.cpassword && req.body.password){
            if(req.body.password==req.body.cpassword){
                User.findOne({username :req.body.username.toLowerCase()}, function(err,result){
                    if(err) return next(err);
                    if(result){
                        req.flash("msg1","User already exists");
                        res.redirect("/signup");
                        return;
                    }
                    User.findOne({email :req.body.email.toLowerCase()}, function(err,rs){
                        if(err) return next(err);
                        if(rs){
                            req.flash("msg1","This email is already used");
                            res.redirect("/signup");
                            return;
                        }
                        User.create({
                            username : req.body.username,
                            name :{
                                fname: req.body.fname,
                                lname: req.body.lname
                            },
                            email: req.body.email,
                            password: req.body.password,
                        },function(err,user){
                            if(err) return next(err);
                            if(!user){
                                req.flash("msg1","No user was created");
                                res.redirect("/signup");
                            }
                            req.flash("msg1","Signup Successful");
                            res.redirect("/signup");
                        });
                    })
                });
            }else{
                req.flash("msg1","Password not matched");
                res.redirect("/signup");
                return;
            }

        }else{
            req.flash("msg1","All fields must be filled");
            res.redirect("/signup");
        }

    }
};
