var mongoose = require ('mongoose');

var ProfileSchema = new mongoose.Schema({
	firstName: {type:String, trim:true, lowercase:true, default:''},
	lastName: {type:String, trim:true, lowercase:true, default:''},
	email: {type:String, trim:true, lowercase:true, default:''},
	device: {type:String, trim:true, lowercase:true, default:''},
	password: {type:String, default:''},
	image: {type:String, default:''},
	timestamp: {type:Date, default:Date.now},
});

ProfileSchema.methods.summary = function(){
	return {'firstName':this.firstName, 'device':this.device, 'lastName':this.lastName, 'email':this.email, 'image':this.image, 'timestamp':this.timestamp, 'id':this._id};
};

module.exports = mongoose.model('ProfileSchema',ProfileSchema);