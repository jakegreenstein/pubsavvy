var mongoose = require ('mongoose');

var ProfileSchema = new mongoose.Schema({
	firstName: {type:String, trim:true, lowercase:true, default:''},
	lastName: {type:String, trim:true, lowercase:true, default:''},
	email: {type:String, trim:true, lowercase:true, default:''},
	device: {type:String, trim:true, lowercase:true, default:''},
  phone: {type:String, trim:true, lowercase:true, default:''},
  specialty: {type:String, trim:true, lowercase:true, default:''},
	password: {type:String, default:''},
	image: {type:String, default:''},
	timestamp: {type:Date, default:Date.now},
});

ProfileSchema.methods.summary = function(){
  var summary = {
    'firstName':this.firstName,
    'device':this.device,
    'lastName':this.lastName,
    'specialty': this.specialty,
    'phone':this.phone,
    'email':this.email,
    'image':this.image,
    'timestamp':this.timestamp,
    'id':this._id
  };

	return summary;
};

module.exports = mongoose.model('ProfileSchema',ProfileSchema);