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

    it('should login an user to the Braph', function(done){
        
    });

})
