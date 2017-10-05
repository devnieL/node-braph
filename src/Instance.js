import request from 'request';
import async from 'async';
import {API_URL} from './Constants';
import Braph from './Braph';

var non_instance_object_properties = ['_braph', '_class', '_schema'];

import Controller from './Controller';

export default class Instance {

    constructor(properties){

        this._id = null;
        
        if(properties && this.setProperties)
            this.setProperties(properties);
    }

    static get PRIMITIVE_TYPES() {
        return ['string', 'number', 'date', 'image', 'boolean'];
    }

    static set braph(value){
        this._braph = value;
    }

    static get braph(){
        return this._braph;
    }

    static set schema(value){
        this._schema = value;
    }

    static get schema(){
        return this._schema;
    }

    // Id
    set id(value){
        this._id = value;
    }

    get id(){
        return this._id;
    }

    // Properties
    get properties(){
        return this._properties;
    }

    set properties(value){
        this._properties = value;
    }

    // Creator
    get creator(){
        return this._creator;
    }

    set creator(value){
        this._creator = value;
    }

    // Picture
    get picture(){
        return this._picture;
    }

    set picture(value){
        this._picture = value;
    }

    // Name
    get name(){
        return this._name;
    }

    set name(value){
        this._name = value;
    }

    // Class
    set class(value){
        this._class = value;
    }

    get class(){
        return this._class || this.constructor.name;
    }

    // Roles
    get roles(){
        return this._roles;
    }

    set roles(value){
        this._roles = value;
    }

    // Labels
    get labels(){
        return this._labels;
    }

    set labels(value){
        this._labels = value;
    }

    static get Controller(){
        
        if(this._controller)
            return this._controller;

        var controller = new Controller(this);
        this._controller = controller;
        return controller;
    }

    toString(){
        return "An instance of " + this.class;
    }

    // Get properties
    getProperties(){
        var props = {};

        for(var i in this.constructor.schema){
            props[i] = this[i];
        }

        return props;
    }

    // Set properties

    setProperties(data){

        var self = this;
        var props = this.getProperties();
        for(var i in props){
            self[i] = data[i];
        }
        
    }

    /**
     * 
     * 
     * @param {Boolean} propertiesAsObject 
     * @returns 
     * @memberof Instance
     */
    toJSON(propertiesAsObject){

        var self = this;
        var propertiesAsObject = (propertiesAsObject != null) ? propertiesAsObject : false;
        
        // Class
        // The class name is gotten from the class property or the name
        // of the inherited class.
        
        var classname = this.class;

        // Properties 

        var properties = [];

        if(self.getProperties){
            
            var props = self.getProperties();

            for(var i in props){
                if(non_instance_object_properties.indexOf(props[i]) == '-1'){

                    var property = {
                        name : i
                    };

                    if (Instance.PRIMITIVE_TYPES.indexOf(self.constructor.schema[i]) == -1){
                        property.type = "object";
                        property.class = self.constructor.schema[i];
                        property.value = props[i].id;
                    }else{
                        property.type = self.constructor.schema[i];
                        property.value = props[i];
                    }

                    properties.push(property);
                }
            }

        }else{

            var property_names = Object.getOwnPropertyNames(this);

            for(var i in property_names){
                if(non_instance_object_properties.indexOf(property_names[i]) == '-1'){
                    
                    var property = {
                        name : i
                    };

                    if (Instance.PRIMITIVE_TYPES.indexOf(self.constructor.schema[i]) == -1){
                        property.type = "object";
                        property.class = self.constructor.schema[i];
                        property.value = props[i].id;
                    }else{
                        property.type = self.constructor.schema[i];
                        property.value = props[i];
                    }

                    properties.push(property);

                }
            }

        }
    
        var instance = {
            id : self.id,
            class : classname,
            name : self.toString(),
            properties : properties
        };

        return instance;
        
    }

    static fromJSON(json){

        var Constructor = this;

        var instance = new Constructor();
        instance.id = json.id;
        instance.properties = json.properties;

        var props = {};

        for(var i in json.properties){
            props[json.properties[i].name] = json.properties[i].value;
        }

        instance.setProperties(props);

        instance.name = json.name;
        instance.creator = json.creator;
        instance.picture = json.picture;
        instance.roles = json.roles;
        instance.labels = json.labels;

        return instance;

    }

    save(callback){

        var self = this;

        var instance = this.toJSON();

        async.waterfall([

            function(cb){
                self.constructor.braph.getAccessToken(cb);
            },

            function(access_token, cb){
                request({
                    url : (self.constructor.braph.api_url || API_URL) + "/braph/" + self.constructor.braph.id + "/instances",
                    method: "POST", 
                    json: true,
                    headers : {
                        'Authorization' : 'Bearer ' + access_token.token
                    },
                    body : {
                        instance : instance
                    }
                }, function (error, res, body) {
                    if(error) {
                        console.error(error);
                        return cb(error);
                    }
                    if(res.statusCode > 400) {
                        console.error(body);
                        return cb(body);
                    }

                    self.id = body.data.id;
                    cb(null, self);
                });
            }
            
        ], callback);

    }

    delete(callback){

        var self = this;

        async.waterfall([

            function(cb){
                self.constructor.braph.getAccessToken(cb);
            },

            function(access_token, cb){
                request({
                    url : (self.constructor.braph.api_url || API_URL) + "/braph/" + self.constructor.braph.id + "/instances/" + self.id,
                    method: "DELETE", 
                    json: true,
                    headers : {
                        'Authorization' : 'Bearer ' + access_token.token
                    }
                }, function (error, res, body) {

                    if(error) {
                        console.error(error);
                        return cb(error);
                    }

                    if(res.statusCode > 400) {
                        console.error(body);
                        return cb(body);
                    }

                    self.id = null;
                    cb(null, self);
                });
            }
            
        ], callback);

    }

    static read(id, callback){

        var self = this;

        async.waterfall([

            function(cb){
                self.braph.getAccessToken(cb);
            },

            function(access_token, cb){
                request({
                    url : (self.braph.api_url || API_URL) + "/braph/" + self.braph.id + "/instances/" + id,
                    method: "GET", 
                    json: true,
                    headers : {
                        'Authorization' : 'Bearer ' + access_token.token
                    }
                }, function (error, res, body) {
                    if(error) return cb(error);
                    if(res.statusCode > 400) return cb(body);                    
                    cb(null, self.fromJSON(body.data));
                });
            }
            
        ], callback);

    }

    static list(page, itemsPerPage, callback){

        var self = this;

        async.waterfall([

            function(cb){
                self.braph.getAccessToken(cb);
            },

            function(access_token, cb){
                request({
                    url : (self.braph.api_url || API_URL) + "/braph/" + self.braph.id + "/instances",
                    qs : {
                        page : page,
                        itemsPerPage : itemsPerPage
                    },
                    method: "GET", 
                    json: true,
                    headers : {
                        'Authorization' : 'Bearer ' + access_token.token
                    }
                }, function (error, res, body) {
                    if(error) return cb(error);
                    if(res.statusCode > 400) return cb(body);

                    async.map(body.data.results, function(result, next){
                        next(null, self.fromJSON(result));
                    }, function(err, _results){

                        if(error) {
                            console.error(error);
                            return cb(error);
                        }

                        return cb(null, _results);
                    });

                });
            }
            
        ], callback);

    }

    /**
     * Transform a minimalist query into the proper
     * query format understandable by Braph.
     * 
     * TODO: A graph-ql parser. 
     * TODO: Improve query format, specially for default properties.
     * 
     * Query example : 
     * 
     * {
     *  title : 'A example title',
     *  author : {
     *   email : 'example@braph.com'
     *  }
     * }
     * 
     * Query example for default properties : 
     * 
     * {
     *  _id : 32,
     *  _name : 'An example title'
     * }
     * 
     * 
     * @static
     * @param {JSON} query 
     * 
     * @memberOf Instance
     */
    static parseQuery(query){

        /*log.debug({
            query : query
        }, "Instance.parseQuery");*/

        var self = this;

        // Use schema to get the property
        // types.

        var schema = this.schema;

        var bquery = {
            class : this.name,
            name : null,
            properties : []
        }

        for(var i in schema){

            var property = {};

            if (Instance.PRIMITIVE_TYPES.indexOf(self.schema[i]) == -1){
                property.name = i;
                property.type = "object";
                property.class = self.schema[i];
                property.value = query.properties[i].id;
            }else{
                property.type = self.schema[i];
                property.value = query.properties[i];
                property.name = i;
            }

            bquery.properties.push(property)
        }

        /*log.debug({
            query : query,
            bquery : bquery
        }, "Instance.parseQuery | result : ");*/

        return bquery;

    }

    static query(query, callback){

        var self = this;

        async.waterfall([

            function(cb){
                self.braph.getAccessToken(cb);
            },

            function(access_token, cb){
                request({
                    url : (self.braph.api_url || API_URL) + "/braph/" + self.braph.id + "/instances/query",
                    body : {
                        query : self.parseQuery(query)
                    },
                    method: "GET", 
                    json: true,
                    headers : {
                        'Authorization' : 'Bearer ' + access_token.token
                    }
                }, function (error, res, body) {
                    
                    /*log.debug({
                        error : error,
                        body : body
                    }, self.name + '.query | results: ');*/

                    if(error) return cb(error);
                    if(res.statusCode > 400) return cb(body);

                    async.map(body.data, function(result, next){
                        next(null, self.fromJSON(result));
                    }, function(err, _results){

                        if(error) {
                            console.error(error);
                            return cb(error);
                        }

                        return cb(null, _results);
                    });

                });
            }
            
        ], callback);

    }

}