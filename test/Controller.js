require('dotenv').config();

import { assert } from 'chai';
import {Braph, Instance} from '../src/index';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import async from 'async';

import request from 'supertest';
import express from 'express';

const BRAPH_CLIENT_ID = process.env.BRAPH_CLIENT_ID;
const BRAPH_CLIENT_SECRET = process.env.BRAPH_CLIENT_SECRET;
const BRAPH_ID = process.env.BRAPH_ID;
const BRAPH_API_URL = process.env.BRAPH_API_URL;

var BRAPH = null;
var CLASS = null;
var API = null;

describe("Controller", () => {

    before((done) => {

        BRAPH = new Braph({
            id : BRAPH_ID,
            client_id : BRAPH_CLIENT_ID,
            client_secret : BRAPH_CLIENT_SECRET,
            api_url : BRAPH_API_URL
        });

        done();

    });

    it('should create a Controller for the Instance', function(done){
        
        var CLASS = class Pichanga extends Instance {
         
            constructor(data){
                super();
                this.goles = data.goles;
                this.jugadores = data.jugadores;
            }

            toString(){
                return "Una pichanga con " + this.goles + " goles.";
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

        }

        var controller = CLASS.Controller;
        console.log("Controller instance:", controller);
        assert.isNotNull(controller);
        assert.isNotNull(controller.instance);
        done();

    });

})

describe('Controller - Instance Create', () => {

  before((done) => {

    // BRAPH

    BRAPH = new Braph({
        id : BRAPH_ID,
        client_id : BRAPH_CLIENT_ID,
        client_secret : BRAPH_CLIENT_SECRET,
        api_url : BRAPH_API_URL
    });

    // CLASS 

    CLASS = class Pichanga extends Instance {

        toString(){
            return "Una pichanga con " + this.goles + " goles.";
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

    }

    // API

    API = express();
    API.use(methodOverride());
	API.use(bodyParser.urlencoded({
		extended: true
	}));
	API.use(bodyParser.json());

    API.post('/pichangas', CLASS.Controller.create.bind(CLASS.Controller));

    done();

  });

  it('should create an Instance using the Instance controller', (done) => {

      request(API)
      .post('/pichangas')
      .send({
          goles : 5,
          jugadores : 6
      })
      .expect(201)
      .end(function(err, res){
          if(err) return done(err);
          done();
      });

  }).timeout(0);

});

describe('Controller - Instance List', () => {

  before((done) => {

    // BRAPH

    BRAPH = new Braph({
        id : BRAPH_ID,
        client_id : BRAPH_CLIENT_ID,
        client_secret : BRAPH_CLIENT_SECRET,
        api_url : BRAPH_API_URL
    });

    // CLASS 

    CLASS = class Pichanga extends Instance {
        
        toString(){
            return "Una pichanga con " + this.goles + " goles.";
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

    }

    // API

    API = express();
    API.use(methodOverride());
	API.use(bodyParser.urlencoded({
		extended: true
	}));
	API.use(bodyParser.json());

    API.get('/pichangas', CLASS.Controller.list.bind(CLASS.Controller));

    done();

  });

  it('should create an Instance using the Instance controller', (done) => {

      request(API)
      .get('/pichangas')
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res, body){
          if(err) return done(err);
          assert.isArray(res.body.data);
          done();
      });

  }).timeout(0);

});

describe('Controller - Instance Read', () => {

  var INSTANCE = null;
  var API = null;

  before((done) => {

    async.series([
        function(cb){

            // BRAPH

            BRAPH = new Braph({
                id : BRAPH_ID,
                client_id : BRAPH_CLIENT_ID,
                client_secret : BRAPH_CLIENT_SECRET,
                api_url : BRAPH_API_URL
            });

            // CLASS 

            CLASS = class Pichanga extends Instance {
            
                toString(){
                    return "Una pichanga con " + this.goles + " goles.";
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

            }

            // API

            API = express();
            API.use(methodOverride());
            API.use(bodyParser.urlencoded({
                extended: true
            }));
            API.use(bodyParser.json());

            API.post('/pichangas', CLASS.Controller.create.bind(CLASS.Controller));
            API.get('/pichangas/:id', CLASS.Controller.read.bind(CLASS.Controller));
            
            cb();
        },  

        function(cb){
            request(API)
            .post('/pichangas')
            .send({
                goles : 5,
                jugadores : 6
            })
            .expect(201)
            .end(function(err, res){
                if(err) return cb(err);
                INSTANCE = res.body.data;
                cb();
            });
        }
    ], done)
    
  });

  it('should read an Instance using the Instance controller', (done) => {

      var url = '/pichangas/' + INSTANCE.id;
      console.log("url:", url);

      request(API)
      .get(url)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res, body){
          if(err) return done(err);
          assert.equal(res.body.data.id, INSTANCE.id);
          done();
      });

  }).timeout(0);

});
