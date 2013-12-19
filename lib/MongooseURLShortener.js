'use strict';

var urlUtil = require('url');
var _ = require('lodash');
var shortID = require('shortid');
var Q = require('q');

module.exports = function MongooseURLShortener(connection, options) {

    options = _.defaults(options || {}, {
        seed: 1000
    });

    shortID.seed(options.seed);

    /**
     * Mongoose Model for direct interaction.
     * @type {*}
     */
    var Model = this.Model = initialize(connection, options);

    /**
     * Shorten a URL and return it.
     * @param url to shorten
     * @param data to add to the url through the
     * options options.schema()
     * @returns Promise.
     */
    this.shorten = function (url, data) {
        url = setUrlProtocol(url);
        data = _.extend(data || {}, {
            url: url
        });
        var deferred = Q.defer();
        Model.findOne({url: url}, function (err, res) {
            if (err || !res) {
                Model.create(data, function (err, res) {
                    resolveDeferred(deferred, err, res);
                });
            } else {
                resolveDeferred(deferred, err, res);
            }
        });
        return deferred.promise;
    };

    /**
     * Shorten a URL and return it.
     * @param url to shorten
     * @param data to add to the url resolve
     * options options.schema()
     * @return Promise
     */
    this.resolve = function (hash, data) {
        data = data || {};
        var deferred = Q.defer();
        Model.findOneAndUpdate({hash: hash}, {
                $push: {
                    hits: data
                },
                $inc: {
                    totalHits: 1
                }
            }, function (err, res) {
                resolveDeferred(deferred, err, res);
            }
        );
        return deferred.promise;
    };

    //-------------------------------------------------------------------------
    //
    // Private Methods
    //
    //-------------------------------------------------------------------------

    /**
     * Url's always need a protocol
     * @param url
     * @returns {*}
     */
    function setUrlProtocol(url) {
        var urlObj = urlUtil.parse(url);
        if (!urlObj.protocol) {
            url = 'http://' + url;
        }
        return url;
    }

    function resolveDeferred(deferred, err, result){
        if(err){
            return deferred.reject(err);
        }
        return deferred.resolve(result);
    }
};

function initialize(connection, options) {
    var TYPE = 'MongooseURLShortener';

    try {
        return connection.model(TYPE);
    } catch (e) {
        var schema = connection.model('____' + TYPE + '____', {}).schema;
        schema.add({
            type: {type: String, 'default': TYPE},
            url: {type: String, unique: true},
            hash: {type: String, unique: true},
            hits: [
                {}
            ],
            totalHits: {type: Number, 'default': 0},
            created: {type: Date, 'default': Date.now}
        });

        if (options.schema) {
            schema.add(options.schema);
        }

        schema.pre('save', function (next) {
            if (!this.hash) {
                this.hash = shortID.generate();
            }
            next();
        });

        return connection.model(TYPE, schema);
    }
}