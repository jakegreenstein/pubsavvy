var mongoose = require ('mongoose');

var DeviceSchema = new mongoose.Schema({
	deviceToken:String,
	timestamp:{type:Date, default:Date.now}
});

DeviceSchema.methods.summary = function(){
	return {'deviceToken':this.deviceToken, 'timestamp':this.timestamp, 'id':this._id};
};

module.exports = mongoose.model('DeviceSchema', DeviceSchema);