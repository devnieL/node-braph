require('dotenv').config();

import { assert } from 'chai';
import {Braph, Instance} from '../src/index';
import async from 'async'; 

const BRAPH_CLIENT_ID = process.env.BRAPH_CLIENT_ID;
const BRAPH_CLIENT_SECRET = process.env.BRAPH_CLIENT_SECRET;
const BRAPH_ID = process.env.BRAPH_ID;
const BRAPH_API_URL = process.env.BRAPH_API_URL;

var BRAPH = null;

describe('Instance Tests', () => {

    describe("Instance Create", function(){
        
        before((done) => {

            BRAPH = new Braph({
                id : BRAPH_ID,
                client_id : BRAPH_CLIENT_ID,
                client_secret : BRAPH_CLIENT_SECRET,
                api_url : BRAPH_API_URL
            });

            done();

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

            pichanga.save(function(err){
                if(err) return done(err);
                assert(pichanga.id != null, "There were an error while saving the instance.");
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

    describe("Instance List", function(){

        this.timeout(0);

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
        
        it('should list Instances', (done) => {

            INSTANCE_CLASS.list(1, 10, function(err, instances){
                if(err) return done(err);
                console.log("should list Instances - instances :", instances);
                assert.isNotNull(instances);
                assert.isArray(instances);
                done();
            });

        }).timeout(0);

    });

});
