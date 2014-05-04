/**
 * Override Mongoose's "remove" function. 
 * Removed docs get stored in the "removedDocument" collection in addition
 * to being removed from the original collection.
 * 
 * @param options.callback= {function(err, removedDocumentResults, callback)} Optional extension point.
 */
module.exports = function (schema, options) {
	options = options || {};

  var mongoose = require('mongoose'),
      Query = mongoose.Query,
      RemovedDocumentModel = require('./RemovedDocument').model;

  /**
   *
   * @param query {Object} Mongoose query
   * @param callback {function(err)} Function called after completion
   */
  schema.static('remove', function(query, callback) {
    var DocumentModel = this;

    DocumentModel.find(query).exec(function(err, results){
      var removedDocuments = results.map(function(result){
        return {
          collectionName : DocumentModel.collection.name,
          documentId : result._id,
          documentObject : result.toJSON()
        }
      });
      RemovedDocumentModel.create(removedDocuments, function(err){
        var removedDocumentResults = Array.prototype.slice.call(arguments, 1);
        // Copying code from Mongoose Model.remove
        // http://mongoosejs.com/docs/api.html#model_Model.remove
        
        // get the mongodb collection object
        var mq = new Query(query, {}, DocumentModel, DocumentModel.collection);

        return mq.remove(function(err){
          if (options.callback) { 
            return options.callback(err, removedDocumentResults, callback); 
          }
          return callback(err, removedDocumentResults);
        });
      });
    });
  });
};