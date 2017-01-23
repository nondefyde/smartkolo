/**
 * Created by ILYASANATE on 23/01/2017.
 */
var router=require("express").Router();
var logoutController=require('../controllers/logout');

router.get("/logout",logoutController.logout);
module.exports=router;
