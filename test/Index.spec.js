'use strict';

describe('MongooseExtension Tests', function () {

    var mockgoose = require('mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);
    mongoose.createConnection('mongodb://localhost:3001/Whatever');

    var Shortener = require('../index').MongooseURLShortener;

    var urlShortener;
    beforeEach(function (done) {
        mockgoose.reset();
        urlShortener = new Shortener(mongoose, {
            schema: {
                userId: String
            }
        });
        done();
    });

    describe('SHOULD', function () {

        it('Add userId to model schema', function (done) {
            urlShortener.shorten('http://www.google.com', {userId: 'google'}, function (err, res) {
                expect(res.hash).toBeDefined();
                expect(res.userId).toBe('google');
                expect(res.url).toBe('http://www.google.com');
                done(err);
            });
        });

        it('Shorten a URL', function (done) {
            urlShortener.shorten('http://www.google.com', function (err, res) {
                expect(res.hash).toBeDefined();
                expect(res.url).toBe('http://www.google.com');
                done(err);
            });
        });

        it('Be able to find a shortened URL', function (done) {
            urlShortener.shorten('http://www.google.com', function (err, res) {
                expect(res.hash).toBeDefined();
                expect(res.url).toBe('http://www.google.com');
                urlShortener.resolve(res.hash, function (err, res) {
                    expect(res.hash).toBeDefined();
                    expect(res.url).toBe('http://www.google.com');
                    expect(res.hits.length).toBe(1);
                    done(err);
                });
            });
        });

        it('Return the same url if it already exists', function (done) {
            urlShortener.shorten('http://www.google.com', function (err, first) {
                expect(first.hash).toBeDefined();
                expect(first.url).toBe('http://www.google.com');
                urlShortener.shorten('http://www.google.com', function (err, second) {
                    expect(second.hash).toBeDefined();
                    expect(second.url).toBe('http://www.google.com');
                    expect(first._id.toString()).toBe(second._id.toString());
                    done(err);
                });
            });
        });

        it('Hold information about the user that requests the shortened url', function (done) {
            urlShortener.shorten('http://www.google.com', function (err, first) {
                expect(first.hash).toBeDefined();
                expect(first.url).toBe('http://www.google.com');
                urlShortener.resolve(first.hash, {ip: '127.0.0.1', realm: 'twitter'}, function (err, second) {
                    expect(second.hash).toBeDefined();
                    expect(second.url).toBe('http://www.google.com');
                    expect(second.hits[0]).toEqual({ ip: '127.0.0.1', realm: 'twitter' });
                    done(err);
                });
            });
        });

        it('Hold information about the user that requests the shortened url multiple times', function (done) {
            urlShortener.shorten('http://www.google.com', function (err, first) {
                expect(first.hash).toBeDefined();
                urlShortener.resolve(first.hash, {ip: '127.0.0.1', realm: 'twitter'}, function () {
                    urlShortener.resolve(first.hash, {ip: '127.0.0.2', realm: 'google'}, function (err, second) {
                        expect(second.hits[0]).toEqual({ ip: '127.0.0.1', realm: 'twitter' });
                        expect(second.hits[1]).toEqual({ ip: '127.0.0.2', realm: 'google' });
                        expect(second.totalHits).toBe(2);
                        done(err);
                    });
                });
            });
        });

    });
});