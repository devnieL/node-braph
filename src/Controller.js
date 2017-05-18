import request from 'request';
import async from 'async';
import {API_URL} from './Constants';
import Braph from './Braph';

var non_instance_object_properties = ['_braph', '_class', '_schema'];

export default class Controller {

    constructor(instance){
        this.Instance = instance;
    }

    create(req, res){  

        var Instance = this.Instance;
        var properties = {};

        for(var i in Instance.schema){
            properties[i] = req.body[i];
        }

        var instance = new Instance(properties);

        instance.save(function(error){  
            if(error) {
                console.error(error);
                return res.status(500).send(error);
            }
            return res.status(201).json({
                message : "Instance successfully created.",
                data : instance.toJSON()
            })
        });

    }

    read(req, res){
        var Instance = this.Instance;
        Instance.read(req.params.id, function(error, instance){
            if(error) {
                console.error(error);
                return res.status(500).send(error);
            }

            return res.status(200).json({
                message : "Instance successfully created.",
                data : instance.toJSON()
            });

        })

    }

    list(req, res){
        var Instance = this.Instance;
        Instance.list(req.query.page, req.query.itemsPerPage, function(error, results){

            if(error) {
                console.error(error);
                return res.status(500).send(error);
            }

            async.map(results, function(result, next){
                next(null, result.toJSON());
            }, function(err, _results){

                if(error) {
                    console.error(error);
                    return res.status(500).send(error);
                }

                return res.status(200).json({
                    page : req.query.page || 1,
                    itemsPerPage : req.query.itemsPerPage || 10,
                    data : _results
                });
            });
        })
    }

    update(req, res){
        var Instance = this.Instance;
    }

    delete(req, res){
        var Instance = this.Instance;
    }


}