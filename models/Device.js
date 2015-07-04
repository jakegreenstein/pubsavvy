var mongoose = require ('mongoose');

var DeviceSchema = new mongoose.Schema({
	deviceToken:String,
	saved:{type:Array, default:new Array()},
	timestamp:{type:Date, default:Date.now},
	//searchHistory:[{term:String, count:Number}]
	//searchHistory:{default:{'default':0}}
	searchHistory:{type:mongoose.Schema.Types.Mixed, default:{}}
});

DeviceSchema.methods.summary = function(){
	return {'searchHistory':this.searchHistory,'saved':this.saved, 'deviceToken':this.deviceToken, 'timestamp':this.timestamp, 'id':this._id};
};

module.exports = mongoose.model('DeviceSchema', DeviceSchema);