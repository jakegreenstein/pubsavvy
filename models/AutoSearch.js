var mongoose = require ('mongoose');

var AutoSearchSchema = new mongoose.Schema({
	terms:[String],
	timestamp:{type:Date, default:Date.now}
});

AutoSearchSchema.methods.summary = function(){
	return {'terms':this.terms, 'timestamp':this.timestamp, 'id':this._id};
};

module.exports = mongoose.model('AutoSearchSchema', AutoSearchSchema);