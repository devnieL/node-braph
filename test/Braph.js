require('dotenv').config();

import { assert } from 'chai';
import {Braph} from '../src/index';

const BRAPH_CLIENT_ID = process.env.BRAPH_CLIENT_ID;
const BRAPH_CLIENT_SECRET = process.env.BRAPH_CLIENT_SECRET;
const BRAPH_ID = process.env.BRAPH_ID;
const BRAPH_API_URL = process.env.BRAPH_API_URL;

var BRAPH = null;

describe('Braph Tests', () => {

  before((done) => {

    BRAPH = new Braph({
        id : BRAPH_ID,
        client_id : BRAPH_CLIENT_ID,
        client_secret : BRAPH_CLIENT_SECRET,
        api_url : BRAPH_API_URL
    });

    done();

  });

  it('should get an access token', (done) => {

      BRAPH.getAccessToken(function(err, access_token){
          if(err) return done(err);
          assert(access_token != null, "Not access token :(");
          //console.log("access_token:", access_token);
          done();
      });

  });

  it('should get basic info about the braph', (done) => {

    BRAPH.about(function(err, info){
        if(err) return done(err);
        assert(info != null, "No information was returned.");
        //console.log("Braph Information : ", info);
        done();
    });
      
  });

  it('should list all the braph instances', (done) => {

    BRAPH.getInstances(function(err, instances){
        if(err) return done(err);
        assert(instances != null, "No instances were returned.");
        //console.log("Braph Instances : ", instances);
        done();
    });

  });

  it('should list all the braph classes', (done) => {

    BRAPH.getClasses(function(err, classes){
        if(err) return done(err);
        assert(classes != null, "No classes were returned.");
        //console.log("Braph Classes : ", classes);
        done();
    });

  });

});
