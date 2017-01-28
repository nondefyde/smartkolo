var mongoose=require("mongoose");
var Schema=mongoose.Schema;
var bcrypt=require("bcrypt-nodejs");
var crypto=require("crypto");

var appendix=require('../appendix/appendix');

var UserSchema=new Schema({
    email : { type: String, unique : true, lowercase: true },
    username : {type:String},
    password : {type:String,minlength: 6},
    first_name : { type: String},
    last_name : { type: String},
    mobile : { type: String},
    sex : { type: String},
    avatar: { type : String, default: ""},
    bio: { type : String},
    city: {type: String},
    country: { type: String},
    coordinates: [Number],
    active : { type: Boolean, default: false},
    verification_hash: {type:String, default: ""},
    password_reset_token: {type:String},
    password_reset_expiration: {type:Date},
    account_verified : { type: Boolean, default: false}
}, {
    timestamps: true
});


//var userSchema=new Schema({
//    username: {type: String,unique:true,lowercase:true,required: true},
//    name: {
//        fname: String,
//        lname: String
//    },
//    password: {type: String,required: true},
//    email:{type: String,unique:true,lowercase:true,required: true},
//    verified: {type: Boolean, default: false},
//    activation_code: {type: String,required: true},
//    phone: {type: Number,required: true},
//    reg_date : {type: Date,default: Date.now()}
//});


UserSchema.statics.createRules = function() {
    return {
        email : 'required|email',
        password : 'required|min:6',
        username : 'required|min:2'
    }
};

UserSchema.post('save',function(user){
    if(('email' in user && user.email) && ('verified' in user && !user.verified)){
        // setup email data with unicode symbols
        var userURL="http://localhost:7000/signup-activation/"+user._id+"/"+user.activation_code;
        var message="<b>You recently apply for MGI account, please <a href='"+userURL+"'>click </a> "+
            " to verify your account</b>";
        var from=' "Jimoh Hadi" <no-reply@gmail.com>';
        var to=user.email;
        var subject='Verify your MGI account ✔';

        appendix.sendMail(from,to,subject,message)
            .then(function(info){
                console.log(info);
            },function(err){
                console.log(err);
            });
    }
});

UserSchema.pre("save",function(next){
    var user=this;
    if(!user.isModified("password")) return next();//go to next operation if password is not given a value
    bcrypt.genSalt(10,function(err,salt){
        if(err) return next(err);
        bcrypt.hash(user.password,salt,null,function(err,hash){ //hash the password and return it as hash in the function parameter
            if(err) return next(err);
            user.password=hash; //assigning the hash value to password again which is now ready to be saved into the database
            next();
        });
    });
});

//comparing the password in the database and the one user types in
UserSchema.methods.comparePassword=function(password){
    return bcrypt.compareSync(password,this.password);
};


module.exports=mongoose.model("User",UserSchema);
