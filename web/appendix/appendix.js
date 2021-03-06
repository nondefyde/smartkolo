/**
 * Created by ILYASANATE on 24/01/2017.
 */
const nodemailer = require('@nodemailer/pro');
var Q=require('q');
var crypto=require("crypto");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jim.hadi10@gmail.com',
        pass: '75867586'
    }
});

exports.sendMail=function(from,to,subject,message){
    var deferred= Q.defer();

    var mailOptions = {
        from: from, // sender address
        to: to, // list of receivers, could be array, or string of email separated with comma. i.e "p@q.com,m@n.com"
        subject: subject, // Subject line
        html:  message// html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions,function(error, info){
        if (error) {
            console.log(error);
            deferred.reject(error);
        }else{
            console.log('Message %s sent: %s', info.messageId, info.response);
            deferred.resolve(info);
        }

    });
    return deferred.promise;

}

var algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';
exports.encrypt=function(text){
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}
exports.decrypt=function(text){
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}
