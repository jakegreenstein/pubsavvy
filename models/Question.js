var mongoose = require ('mongoose');

var QuestionSchema = new mongoose.Schema({
  index: {type:Number, default:0}, 
  question: {type:String, trim:true, default:''},
  answer: {type:String, trim:true, default:''},
  timestamp: {type:Date, default:Date.now}
});

QuestionSchema.methods.summary = function(){
  var summary = {
    'index': this.index,
    'question': this.question,
    'answer': this.answer,
    'timestamp':this.timestamp,
    'id':this._id
  };

  return summary;
};

module.exports = mongoose.model('QuestionSchema', QuestionSchema);