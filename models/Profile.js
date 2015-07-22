var mongoose = require ('mongoose');

var ProfileSchema = new mongoose.Schema({
	firstName:String,
	lastName:String,
	email:String,
	password:String,
	image:{type:String, default:'none'},
	timestamp:{type:Date, default:Date.now}
});

ProfileSchema.methods.summary = function(){
	return {'firstName':this.firstName, 'lastName':this.lastName, 'email':this.email, 'image':this.image, 'timestamp':this.timestamp, 'id':this._id};
};

module.exports = mongoose.model('ProfileSchema',ProfileSchema);