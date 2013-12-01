'use strict';

var _ = require('lodash');
var shortID = require('shortid');

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
     */
    this.shorten = function (url, data, done) {
        if (_.isFunction(data)) {
            done = data;
            data = {};
        }
        data = _.extend(data || {}, {
            url: url
        });
        Model.findOne({url: url}, function (err, res) {
            if (err || !res) {
                Model.create(data, function (err, res) {
                    done(err, res);
                });
            } else {
                done(err, res);
            }
        });
    };

    /**
     * Shorten a URL and return it.
     * @param url to shorten
     * @param data to add to the url resolve
     * options options.schema()
     */
    this.resolve = function (hash, data, done) {
        if (_.isFunction(data)) {
            done = data;
            data = {};
        }
        Model.findOneAndUpdate({hash: hash}, {
                $push: {
                    hits: data
                },
                $inc: {
                    totalHits: 1
                }
            }, function (err, res) {
                if (err || !res) {
                    return done(err);
                }
                done(err, res);
            }
        );
    };
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