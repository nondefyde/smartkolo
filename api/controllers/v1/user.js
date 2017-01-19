/**
 * Created by Emmanuel on 4/30/2016.
 */
var config = require('config');
var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var User = require('../../models/user');
var Validator = require('validatorjs');

var formatResponse = require('../../shared/format-response');
var helper = require('../../shared/helper');

module.exports = {
    userIdParam: function (req, res, next, user_id) {
        var error = {};
        User.findById(user_id,{password:0}).exec()
            .then(function (user) {
                if (user) {
                    req.user = user;
                    return next();
                }
                else {
                    error = helper.transformToError({code: 404, message: "User not found"}).toCustom();
                    return next(error);
                }
            }, function (err) {
                console.error("user_id params error ", err);
                error = helper.transformToError({
                    code: 404,
                    message: "Error in server interaction",
                    extra: err
                }).toCustom();
                return next(error);
            });
    },
    find: function (req, res, next) {
        var query = req.query,
            meta = {code: 200, success: true},
            userId = req.userId,
            error = {},
            queryCriteria = {};
        console.log("userId ", userId);
        var per_page = query.per_page ? parseInt(query.per_page, "10") : config.get('itemsPerPage.default');
        var page = query.page ? parseInt(query.page, "10") : 1;

        var baseRequestUrl = config.get('app.baseUrl') + config.get('api.prefix') + "/users";

        meta.pagination = {
            per_page: per_page,
            page: page,
            current_page: helper.appendQueryString(baseRequestUrl, "page=" + page)
        };

        if (page > 1) {
            var prev = page - 1;
            meta.pagination.previous = prev;
            meta.pagination.previous_page = helper.appendQueryString(baseRequestUrl, "page=" + prev);
        }

        Q.all([
            User.find(queryCriteria,{password:0}).lean().skip(per_page * (page - 1)).limit(per_page).sort('-createdAt'),
            User.count(queryCriteria).exec()
        ])
            .spread(function (users, count) {
                var array = [users, count];
                if (users.length > 0 && userId) {
                    var promises = [];
                    _.forEach(users, function (user) {
                        var promise = Q.all([
                            Follow.findOne({user: userId, follower: user._id}),
                            Follow.findOne({user: user._id, follower: userId})
                        ]);
                        promises.push(promise);
                    });

                    array.push(Q.allSettled(promises));
                }

                return array;

            })
            .spread(function (users, count, results) {
                if (results) {
                    _.each(users, function (user, index) {
                        if (results && results[index]) {
                            var result = results[index];
                            var isFulfilled = result.state === "fulfilled";
                            _.extend(user, {is_follower: (isFulfilled && result.value[0] && user._id != userId) ? true : false});
                            _.extend(user, {is_following: (isFulfilled && result.value[1] && user._id != userId) ? true : false});
                        }
                    });
                }
                meta.pagination.total_count = count;
                if (count > (per_page * page)) {
                    var next = page + 1;
                    meta.pagination.next = next;
                    meta.pagination.next_page = helper.appendQueryString(baseRequestUrl, "page=" + next);
                }
                res.status(meta.code).json(formatResponse.do(meta, users));
            }, function (err) {
                console.log("err ", err);
                error = helper.transformToError({code: 503, message: "Error in server interaction", extra: err});
                return next(error);
            });
    },
    findOne: function (req, res, next) {
        var meta = {code: 200, success: true};
        var user = req.user.toObject(),
            userId = req.userId;
        if (userId && userId != user._id) {
            Q.all([
                Follow.findOne({user: userId, follower: user._id}),
                Follow.findOne({user: user._id, follower: userId})
            ]).spread(function (follower, following) {
                _.extend(user, {is_follower: follower ? true : false});
                _.extend(user, {is_following: following ? true : false});
                res.status(meta.code).json(formatResponse.do(meta, user));
            }, function (err) {
                res.status(meta.code).json(formatResponse.do(meta, user));
            });
        }
        else
            res.status(meta.code).json(formatResponse.do(meta, user));

    },
    update: function (req, res, next) {
        var meta = {code: 200, success: true},
            error = {},
            obj = req.body,
            userId = req.userId,
            user = req.user;
        if(userId !=user._id){
            error = helper.transformToError({
                code: 400, message: "You don't the privilege to update this profile!"}).toCustom();
            return next(error);
        }
        if (req.file && req.file.fieldname && req.file.fieldname == "avatar") {
            obj.avatar = req.file.location;
        }
        if(Object.hasOwnProperty.call(obj,'longitude') && Object.hasOwnProperty.call(obj,'latitude')){
            obj.coordinates = [obj.longitude,obj.latitude];
            delete obj.longitude;
            delete obj.latitude;
        }
        _.extend(user, obj);
        user.save(function (err, savedUser) {
            if (err) {
                error = helper.transformToError({code: 503, message: "We encountered an error while updating your details!"}).toCustom();
                return next(error);
            }
            else {
                meta.message = "Details updated successfully!";
                res.status(meta.code).json(formatResponse.do(meta, savedUser));
            }
        });
    },
    getUserByEmail: function (req, res, next) {
        var error = {};
        var meta = {code: 200, success: true};
        var email = req.params.email;
        User.findOne({email: email}).exec()
            .then(function (user) {
                if (!user) {
                    error = helper.transformToError({code: 404, message: "User not found"}).toCustom();
                    return next(error);
                }
                else
                    res.status(meta.code).json(formatResponse.do(meta, user));
            }, function (err) {
                error = helper.transformToError({
                    code: 404,
                    message: "Error in server interaction",
                    extra: err
                }).toCustom();
                return next(error);
            });
    }
};
