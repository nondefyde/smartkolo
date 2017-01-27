/**
 * Created by ILYASANATE on 25/01/2017.
 */
var User=require("../models/user");
module.exports = {
    signupActivationPage: function (req,res,next) {
        if(req.params.id && req.params.jo){
            User.findOne({_id:req.params.id,activation_code: req.params.jo},function(err,result){
                if(err){
                    console.log(err);
                    return res.send("<h1>Oops! Something went wrong</h1><h3>Your activation not successful. Try again...</h3>");
                    //returnnext(err)
                }

                if(result){
                    if(!result.verified){
                        result.verified=true;
                        result.save(function(err){
                            if(err) throw err;
                            return res.render("main/signup_activation",{successType: "new"});
                        })
                    }else {
                        return res.render("main/signup_activation",{successType: "already"})
                    }
                }else{
                    return res.send("<h1>Oops! Something went wrong</h1><h3>Your activation not successful. Try again...</h3>");
                }
            });
        }else{
            res.status(404).send("<h1>404!</h1><h3> Page not found</h3>");
        }

    }
};


