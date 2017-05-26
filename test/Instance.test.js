require('dotenv').config();

import chai from 'chai';
chai.should();

var assert = chai.assert;

import {Braph, Instance} from '../src/index';
import async from 'async'; 

const BRAPH_CLIENT_ID = process.env.BRAPH_CLIENT_ID;
const BRAPH_CLIENT_SECRET = process.env.BRAPH_CLIENT_SECRET;
const BRAPH_ID = process.env.BRAPH_ID;
const BRAPH_API_URL = process.env.BRAPH_API_URL;

var BRAPH = null;

var log = require("bunyan").createLogger({
	name : "Instances.test.js",
	level : "debug",
	serializers : {
		metadata : function(metadata) {
			return JSON.stringify(metadata, null, 2);
		},
		params : function(params) {
			return JSON.stringify(params, null, 2);
		},
		db_results : function(db_results){
			return JSON.stringify(db_results, null, 2);
		}
	}
});

describe('Instance Tests', () => {

    describe("Instance.toJSON()", function(){
        
        var INSTANCES_TO_DELETE = [];

        before((done) => {

            BRAPH = new Braph({
                id : BRAPH_ID,
                client_id : BRAPH_CLIENT_ID,
                client_secret : BRAPH_CLIENT_SECRET,
                api_url : BRAPH_API_URL
            });

            done();

        });

        after((done) => {
            
            async.eachSeries(INSTANCES_TO_DELETE, function(instance, next){
                instance.delete(next);
            }, done);

        });

        it('- should return the common json representation', (done) => {

            class Pichanga extends Instance {
                
                constructor(data){
                    super();
                    this.goles = data.goles;
                    this.jugadores = data.jugadores;
                }

                static get braph(){
                    return BRAPH;
                }

                static get schema(){
                    return {
                        goles : 'number',
                        jugadores : 'number'
                    }
                }

                getProperties() {
                    return {
                        goles : this.goles,
                        jugadores : this.jugadores
                    }
                }

                toString(){
                    return "Una pichanga con " + this.goles + " goles.";
                }

            }

            var pichanga = new Pichanga({
                goles : 5,
                jugadores : 6
            });

            log.debug({
                pichanga : pichanga.toJSON()
            }, "Instance.toJSON() - should return the common json representation | pichanga.toJSON():");

            pichanga.toJSON().should.be.eql({
                id : null,
                class : "Pichanga",
                name : pichanga.toString(),
                properties : [
                    {
                        name : "goles",
                        type : "number",
                        value : 5
                    },
                    {
                        name : "jugadores",
                        type : "number",
                        value : 6
                    }
                ]
            });

            done();

        }).timeout(0);

        it('- should return the common json representation when creating an Instance without passing data directly to the constructor', (done) => {

            class Pichanga extends Instance {
                
                constructor(data){
                    super();
                }

                static get braph(){
                    return BRAPH;
                }

                static get schema(){
                    return {
                        goles : 'number',
                        jugadores : 'number'
                    }
                }

                toString(){
                    return "Una pichanga con " + this.goles + " goles.";
                }

                get getGoles(){
                    return this.goles;
                }

                set setGoles(value){
                    this.goles = value;
                }

                get getJugadores(){
                    return this.jugadores;
                }

                set setJugadores(value){
                    this.jugadores = value;
                }

                getProperties() {
                    return {
                        goles : this.goles,
                        jugadores : this.jugadores
                    }
                }

            }

            var pichanga = new Pichanga();
            pichanga.goles = 16;
            pichanga.jugadores = 11;

            pichanga.toJSON().should.be.eql({
                id : null,
                class : "Pichanga",
                name : pichanga.toString(),
                properties : [
                    {
                        name : "goles",
                        type : "number",
                        value : 16
                    },
                    {
                        name : "jugadores",
                        type : "number",
                        value : 11
                    }
                ]
            });

            done();

        }).timeout(0);

        it('- should return the common json representation when creating an Instance including object properties', (done) => {

            class Place extends Instance {

                static get schema(){
                    return {
                        name : 'string'
                    }
                }

                static get braph(){
                    return BRAPH;
                }

                getProperties() {
                    return {
                        name : this.name
                    }
                }

            }

            class Pichanga extends Instance {
                
                constructor(data){
                    super();
                }

                static get braph(){
                    return BRAPH;
                }

                static get schema(){
                    return {
                        goles : 'number',
                        jugadores : 'number',
                        place : 'Place'
                    }
                }

                toString(){
                    return "Una pichanga con " + this.goles + " goles.";
                }

                get getGoles(){
                    return this.goles;
                }

                set setGoles(value){
                    this.goles = value;
                }

                get getJugadores(){
                    return this.jugadores;
                }

                set setJugadores(value){
                    this.jugadores = value;
                }

                getProperties() {
                    return {
                        goles : this.goles,
                        jugadores : this.jugadores,
                        place : this.place
                    }
                }

            }

            async.waterfall([

                function(cb){
                    
                    var place = new Place();
                    place.name = "A stadium";

                    INSTANCES_TO_DELETE.push(place);

                    place.save(function(err){
                        if(err) return c(err);
                        cb(null, place);
                    });
                    
                },

                function(place, cb){

                    var pichanga = new Pichanga();
                    pichanga.goles = 16;
                    pichanga.jugadores = 11;
                    pichanga.place = place;

                    cb(null, pichanga, place);                   

                }

            ], function(err, pichanga, place){
                if(err) return done(err);

                pichanga.toJSON().should.be.eql({
                    id : null,
                    class : "Pichanga",
                    name : pichanga.toString(),
                    properties : [
                        {
                            name : "goles",
                            type : "number",
                            value : 16
                        },
                        {
                            name : "jugadores",
                            type : "number",
                            value : 11
                        },
                        {
                            name : "place",
                            type : "object",
                            class : "Place",
                            value : place.id
                        }
                    ]
                });

                done();
            });

        }).timeout(0);

    });

    describe("Instance Create", function(){
        
        var INSTANCES_TO_DELETE = [];

        before((done) => {

            BRAPH = new Braph({
                id : BRAPH_ID,
                client_id : BRAPH_CLIENT_ID,
                client_secret : BRAPH_CLIENT_SECRET,
                api_url : BRAPH_API_URL
            });

            done();

        });

        after((done) => {
            
            async.eachSeries(INSTANCES_TO_DELETE, function(instance, next){
                instance.delete(next);
            }, done);

        });

        it('should create an Instance passing data directly to the constructor', (done) => {

            class Pichanga extends Instance {
                
                constructor(data){
                    super();
                    this.goles = data.goles;
                    this.jugadores = data.jugadores;
                }

                static get braph(){
                    return BRAPH;
                }

                static get schema(){
                    return {
                        goles : 'number',
                        jugadores : 'number'
                    }
                }

                getProperties() {
                    return {
                        goles : this.goles,
                        jugadores : this.jugadores
                    }
                }

                toString(){
                    return "Una pichanga con " + this.goles + " goles.";
                }

            }

            var pichanga = new Pichanga({
                goles : 5,
                jugadores : 6
            });

            INSTANCES_TO_DELETE.push(pichanga);

            pichanga.save(function(err){
                if(err) return done(err);

                console.log("Pichanga save:", pichanga);

                assert(pichanga.id != null, "There were an error while saving the instance.");
                done();
            });

        }).timeout(0);

        it('should create an Instance without passing data directly to the constructor', (done) => {

            class Pichanga extends Instance {
                
                constructor(data){
                    super();
                }

                static get braph(){
                    return BRAPH;
                }

                static get schema(){
                    return {
                        goles : 'number',
                        jugadores : 'number'
                    }
                }

                toString(){
                    return "Una pichanga con " + this.goles + " goles.";
                }

                get getGoles(){
                    return this.goles;
                }

                set setGoles(value){
                    this.goles = value;
                }

                get getJugadores(){
                    return this.jugadores;
                }

                set setJugadores(value){
                    this.jugadores = value;
                }

                getProperties() {
                    return {
                        goles : this.goles,
                        jugadores : this.jugadores
                    }
                }

            }

            var pichanga = new Pichanga();
            pichanga.goles = 16;
            pichanga.jugadores = 11;

            INSTANCES_TO_DELETE.push(pichanga);

            pichanga.save(function(err){
                if(err) return done(err);
                assert(pichanga.id != null, "There were an error while saving the instance.");
                done();
            });

        }).timeout(0);

        it('should create an Instance including object properties', (done) => {

            class Place extends Instance {

                static get schema(){
                    return {
                        name : 'string'
                    }
                }

                static get braph(){
                    return BRAPH;
                }

                getProperties() {
                    return {
                        name : this.name
                    }
                }

            }

            class Pichanga extends Instance {
                
                constructor(data){
                    super();
                }

                static get braph(){
                    return BRAPH;
                }

                static get schema(){
                    return {
                        goles : 'number',
                        jugadores : 'number',
                        place : 'Place'
                    }
                }

                toString(){
                    return "Una pichanga con " + this.goles + " goles.";
                }

                get getGoles(){
                    return this.goles;
                }

                set setGoles(value){
                    this.goles = value;
                }

                get getJugadores(){
                    return this.jugadores;
                }

                set setJugadores(value){
                    this.jugadores = value;
                }

                getProperties() {
                    return {
                        goles : this.goles,
                        jugadores : this.jugadores,
                        place : this.place
                    }
                }

            }

            async.waterfall([

                function(cb){
                    
                    var place = new Place();
                    place.name = "A stadium";

                    INSTANCES_TO_DELETE.push(place);

                    place.save(function(err){
                        if(err) return cb(err);
                        cb(null, place);
                    });
                    
                },

                function(place, cb){

                    var pichanga = new Pichanga();
                    pichanga.goles = 16;
                    pichanga.jugadores = 11;
                    pichanga.place = place;

                    INSTANCES_TO_DELETE.push(pichanga);

                    pichanga.save(function(err, saved_pichanga){
                        if(err) return cb(err);
                        cb(null, saved_pichanga);
                    });

                }

            ], function(err, pichanga){
                if(err) return done(err);
                console.log('created pichanga:', pichanga);
                done();
            });

        }).timeout(0);

    });

    describe("Instance Read", function(){

        var BRAPH = null;
        var INSTANCE = null;
        var INSTANCE_CLASS = null;

        before((done) => {

            async.series([
                function(cb){
                    BRAPH = new Braph({
                        id : BRAPH_ID,
                        client_id : BRAPH_CLIENT_ID,
                        client_secret : BRAPH_CLIENT_SECRET,
                        api_url : BRAPH_API_URL
                    });

                    cb();
                },

                function(cb){

                    class Pichanga extends Instance {
                
                        static get braph(){
                            return BRAPH;
                        }

                        static get schema(){
                            return {
                                goles : 'number',
                                jugadores : 'number'
                            }
                        }

                        toString(){
                            return "Una pichanga con " + this.goles + " goles.";
                        }

                        get getGoles(){
                            return this.goles;
                        }

                        set setGoles(value){
                            this.goles = value;
                        }

                        get getJugadores(){
                            return this.jugadores;
                        }

                        set setJugadores(value){
                            this.jugadores = value;
                        }

                        getProperties() {
                            return {
                                goles : this.goles,
                                jugadores : this.jugadores
                            }
                        }

                    }

                    INSTANCE_CLASS = Pichanga;

                    cb();

                },

                function(cb){
                    var pichanga = INSTANCE = new INSTANCE_CLASS();
                    pichanga.goles = 16;
                    pichanga.jugadores = 11;

                    pichanga.save(function(err){
                        if(err) return cb(err);
                        cb();
                    });
                }
            ], done);
            
        });

        after((done)=>{
            INSTANCE.delete(function(err){
                if(err) return done(err);
                done();
            })
        })
        
        it('- should read an Instance', (done) => {

            INSTANCE_CLASS.read(INSTANCE.id, function(err, instance){
                if(err) return done(err);
                assert.equal(instance.id, INSTANCE.id);
                done();
            });

        }).timeout(0);

        it('- the read Instance should be an object', (done) => {

            INSTANCE_CLASS.read(INSTANCE.id, function(err, instance){
                if(err) return done(err);
                assert.instanceOf(instance, INSTANCE_CLASS)
                assert.equal(instance.id, INSTANCE.id);
                done();
            });

        }).timeout(0);
        

    });

    describe("Instance Delete", function(){

        var BRAPH = null;
        var INSTANCE = null;
        var INSTANCE_CLASS = null;

        before((done) => {

            async.series([
                function(cb){
                    BRAPH = new Braph({
                        id : BRAPH_ID,
                        client_id : BRAPH_CLIENT_ID,
                        client_secret : BRAPH_CLIENT_SECRET,
                        api_url : BRAPH_API_URL
                    });

                    cb();
                },

                function(cb){

                    class Pichanga extends Instance {
                
                        static get braph(){
                            return BRAPH;
                        }

                        static get schema(){
                            return {
                                goles : 'number',
                                jugadores : 'number'
                            }
                        }

                        toString(){
                            return "Una pichanga con " + this.goles + " goles.";
                        }

                        get getGoles(){
                            return this.goles;
                        }

                        set setGoles(value){
                            this.goles = value;
                        }

                        get getJugadores(){
                            return this.jugadores;
                        }

                        set setJugadores(value){
                            this.jugadores = value;
                        }

                        getProperties() {
                            return {
                                goles : this.goles,
                                jugadores : this.jugadores
                            }
                        }

                    }

                    INSTANCE_CLASS = Pichanga;

                    cb();

                },

                function(cb){
                    var pichanga = INSTANCE = new INSTANCE_CLASS();
                    pichanga.goles = 16;
                    pichanga.jugadores = 11;

                    pichanga.save(function(err){
                        if(err) return cb(err);
                        cb();
                    });
                }
            ], done);
            
        });
        
        it('- should delete the Instance', (done) => {

            INSTANCE.delete(function(err){
                if(err) return done(err);
                
                INSTANCE_CLASS.read(INSTANCE.id, function(err, instance){
                    assert.notEqual(err, null);
                    done();                    
                });

            });

        }).timeout(0);

    });

    describe("Instance Query", function(){

        var BRAPH = null;
        var INSTANCE = null;
        var INSTANCE_CLASS = null;

        before((done) => {

            async.series([
                function(cb){
                    BRAPH = new Braph({
                        id : BRAPH_ID,
                        client_id : BRAPH_CLIENT_ID,
                        client_secret : BRAPH_CLIENT_SECRET,
                        api_url : BRAPH_API_URL
                    });

                    cb();
                },

                function(cb){

                    class Pichanga extends Instance {
                
                        static get braph(){
                            return BRAPH;
                        }

                        static get schema(){
                            return {
                                goles : 'number',
                                jugadores : 'number'
                            }
                        }

                        toString(){
                            return "Una pichanga con " + this.goles + " goles.";
                        }

                        get getGoles(){
                            return this.goles;
                        }

                        set setGoles(value){
                            this.goles = value;
                        }

                        get getJugadores(){
                            return this.jugadores;
                        }

                        set setJugadores(value){
                            this.jugadores = value;
                        }

                        getProperties() {
                            return {
                                goles : this.goles,
                                jugadores : this.jugadores
                            }
                        }

                    }

                    INSTANCE_CLASS = Pichanga;

                    cb();

                },

                function(cb){
                    var pichanga = INSTANCE = new INSTANCE_CLASS();
                    pichanga.goles = 16;
                    pichanga.jugadores = 11;

                    pichanga.save(function(err){
                        if(err) return cb(err);
                        cb();
                    });
                }
            ], done);
            
        });
        
        it('- should return the instances by query', (done) => {

            INSTANCE_CLASS.query({
                properties : {
                    goles : 16
                }
            }, function(err, results){

                log.debug({
                    err : err,
                    results : results
                }, "Instances.query - results");

                if(err) {
                    log.error(err);
                    return done(err);
                }

                results.should.have.length(1);
                assert.equal(results[0].id, INSTANCE.id);
                done();
            });

        }).timeout(0);

        it('- the queried Instance should be an object', (done) => {

            INSTANCE_CLASS.query({
                properties : {
                    goles : 16
                }
            }, function(err, results){

                log.debug({
                    err : err,
                    results : results
                }, "Instances.query - results");

                if(err) return done(err);
                results.should.have.length(1);
                assert.instanceOf(results[0], INSTANCE_CLASS)
                assert.equal(results[0].id, INSTANCE.id);
                done();
            });

        }).timeout(0);

        after((done) => {

            INSTANCE.delete(function(err){
                if(err) return done(err);
                done();
            });

        });

    });

    describe("Instance List", function(){

        this.timeout(0);

        var BRAPH = null;
        var INSTANCE = null;
        var INSTANCE_CLASS = null;

        var INSTANCES_TO_DELETE = [];


        before((done) => {

            async.series([
                function(cb){
                    BRAPH = new Braph({
                        id : BRAPH_ID,
                        client_id : BRAPH_CLIENT_ID,
                        client_secret : BRAPH_CLIENT_SECRET,
                        api_url : BRAPH_API_URL
                    });

                    cb();
                },

                function(cb){

                    class Pichanga extends Instance {
                
                        static get braph(){
                            return BRAPH;
                        }

                        static get schema(){
                            return {
                                goles : 'number',
                                jugadores : 'number'
                            }
                        }

                        toString(){
                            return "Una pichanga con " + this.goles + " goles.";
                        }

                        get getGoles(){
                            return this.goles;
                        }

                        set setGoles(value){
                            this.goles = value;
                        }

                        get getJugadores(){
                            return this.jugadores;
                        }

                        set setJugadores(value){
                            this.jugadores = value;
                        }

                        getProperties() {
                            return {
                                goles : this.goles,
                                jugadores : this.jugadores
                            }
                        }

                    }

                    INSTANCE_CLASS = Pichanga;

                    cb();

                },

                function(cb){
                    var pichanga = INSTANCE = new INSTANCE_CLASS();
                    pichanga.goles = 16;
                    pichanga.jugadores = 11;

                    INSTANCES_TO_DELETE.push(pichanga);
                    
                    pichanga.save(function(err){
                        if(err) return cb(err);
                        cb();
                    });
                }
            ], done);
            
        });

        after((done) => {
            
            async.eachSeries(INSTANCES_TO_DELETE, function(instance, next){
                instance.delete(next);
            }, done);

        });
        
        it('should list Instances', (done) => {

            INSTANCE_CLASS.list(1, 10, function(err, instances){

                log.debug({
                    err : err,
                    instances : instances
                }, "Instances.list - results");

                if(err) return done(err);
                assert.isNotNull(instances);
                assert.isArray(instances);
                done();
            });

        }).timeout(0);

    });

});
