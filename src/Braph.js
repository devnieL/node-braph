import request from 'request';
import async from 'async';
import {API_URL} from './Constants';

export default class Braph {

    constructor(data){

        this._id = data.id;

        this._credentials = {
            client_id : data.client_id,
            client_secret : data.client_secret
        }

        this.api_url = data.api_url;
    }

    get id(){
        return this._id;
    }

    set id(value){
        this._id = value;
    }

    get credentials(){
        return this._credentials;
    }

    set credentials(value){
        this._credentials = value;
    }

    getAccessToken(callback){

        var self = this;
        
        request({
            url : (self.api_url || API_URL) + "/oauth/token",
            method: "POST", 
            json: true,
            body: {
                grant_type: 'client_credentials',
                client_id: this.credentials.client_id,
                client_secret: this.credentials.client_secret
            }
        }, function (err, res, body) {

            if(err) return callback(err);

            if(res.statusCode <= 400){
                callback(null, body);
            }else{
                callback(body);
            }

        });

    }

    checkAccessToken(callback){
        // TODO
    }

    about(callback){

        var self = this;

        async.waterfall([

            function(cb){
                self.getAccessToken(cb);
            },

            function(access_token, cb){
                request({
                    url : (self.api_url || API_URL) + "/braph/" + self.id,
                    method: "GET", 
                    json: true,
                    headers : {
                        'Authorization' : 'Bearer ' + access_token.token
                    }
                }, function (error, res, body) {
                    if(error) return cb(error);
                    if(res.statusCode > 400) return cb(body);
                    cb(null, body);
                });
            }
            
        ], callback);
        
    }

    getInstances(callback){

        var self = this;

        async.waterfall([

            function(cb){
                self.getAccessToken(cb);
            },

            function(access_token, cb){                
                request({
                    url : (self.api_url || API_URL) + "/braph/" + self.id + "/instances/",
                    method: "GET", 
                    json: true,
                    headers : {
                        'Authorization' : 'Bearer ' + access_token.token
                    }
                }, function (error, res, body) {
                    if(error) return cb(error);
                    if(res.statusCode > 400) return cb(body);
                    cb(null, body.data);
                });
            }
            
        ], function(err, data){
            if(err) return callback(err);
            callback(null, data);
        });
        
    }

    getClasses(callback){
        
        var self = this;

        async.waterfall([

            function(cb){
                self.getAccessToken(cb);
            },

            function(access_token, cb){                
                request({
                    url : (self.api_url || API_URL) + "/braph/" + self.id + "/classes/",
                    method: "GET", 
                    json: true,
                    headers : {
                        'Authorization' : 'Bearer ' + access_token.token
                    }
                }, function (error, res, body) {
                    if(error) return cb(error);
                    if(res.statusCode > 400) return cb(body);
                    cb(null, body.data);
                });
            }
            
        ], function(err, data){
            if(err) return callback(err);
            callback(null, data);
        });

    }

    // Controller

    get Authentication(){

        var self = this;

        return {

            login : function(req, res){

                request({
                    url : (self.api_url || API_URL) + "/braph/" + self.id + "/login",
                    method: "POST", 
                    json: true,
                    headers : {
                        'BG-Auth-Token' : req.query.access_token
                    }
                }, function (error, response, body) {

                    if(error) return res.status(500).send(error);

                    if(response.statusCode >= 400){
                        return res.status(response.statusCode).send(body)
                    }else{
                        res.json(body);
                    }

                });

            }
        }

    }

    get Middleware(){

        var self = this;

        return {

            B_Auth_Token : function(req, res, next){
           
                request({
                    url : (self.api_url || API_URL) + "/braph/" + self.id + "/middleware/b_auth_token",
                    method: req.method, 
                    json: true,
                    headers : {
                        'B-Auth-Token' : req.query.access_token
                    },
                    body: {
                        grant_type: 'client_credentials',
                        client_id: self.credentials.client_id,
                        client_secret: self.credentials.client_secret
                    }
                }, function (error, response, body) {
                    
                    console.log(error, body);

                    if(error) return res.status(500).send(error);

                    if(response.statusCode >= 400){
                        return res.status(response.statusCode).send(body)
                    }else{
                        req.user = body.data.user;
                        req.braph = body.data.braph;
                        next();
                    }

                });

            }

        }
    }


}