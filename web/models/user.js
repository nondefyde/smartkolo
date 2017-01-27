var mongoose=require("mongoose");
var Schema=mongoose.Schema;
var bcrypt=require("bcrypt-nodejs");
var crypto=require("crypto");

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
},{
    timestamps: true
});


UserSchema.statics.createRules = function() {
    return {
        email : 'required|email',
        password : 'required|min:6',
        username : 'required|min:2'
    }
};

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
