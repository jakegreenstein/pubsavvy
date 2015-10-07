var mongoose = require ('mongoose');

var DeviceSchema = new mongoose.Schema({
	deviceToken: {type:String, default:''},
	saved:{type:Array, default:new Array()},
	timestamp:{type:Date, default:Date.now},
	searchHistory:{type:mongoose.Schema.Types.Mixed, default:{}},
	profileId:{type:String, default:''},
});

DeviceSchema.methods.summary = function(){
  var summary = {
    'searchHistory':this.searchHistory, 
    'saved':this.saved, 
    'profileId':this.profileId, 
    'deviceToken':this.deviceToken, 
    'timestamp':this.timestamp, 
    'id':this._id

  }

	return summary;
};

module.exports = mongoose.model('DeviceSchema', DeviceSchema);