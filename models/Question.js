var mongoose = require ('mongoose');

var QuestionSchema = new mongoose.Schema({
  index: {type:Number, trim:true, default:''}, 
  question: {type:String, trim:true, default:''},
  answer: {type:String, trim:true, default:''},
  timestamp: {type:Date, default:Date.now}
});

Question.methods.summary = function(){
  return {'index': this.index, 'question': this.question, 'answer': this.answer, 'timestamp':this.timestamp, 'id':this._id};
};

module.exports = mongoose.model('QuestionSchema', QuestionSchema);