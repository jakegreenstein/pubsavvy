var Question = require('../models/Question.js');

var mongoose = require('mongoose');

this.handleGet = function(req, res, pkg){
  if (pkg.id !=null){
    Question.findById(pkg.id, function(err, question){
      if (err) {
        res.send({'confirmation': 'fail', 'message': "Question " + pkg.id + "not found"});
        return;
      }

      if (question == null){
        res.send({'confirmation':'fail', 'message':"Question"+ pkg.id+" not found"});
        return;
      }

      res.json({'confirmation':'success', "question": question.summary()});
    });
    return;
  }

  Question.find(req.query, function(err, questions){
    if (err){
      res.json({'confirmation':'fail','message':err.message});
      return;
    }
    var results = new Array();
    for (var i=0; i<questions.length; i++){
      var p = questions[i];
      results.push(p.summary());
    }
    res.json({'confirmation':'success', 'questions':results});
  });
  return;
}


this.handlePost = function(req, res, pkg){
  Question.create(req.body, function(err, question){
    if (err){
      res.send({'confirmation':'fail', 'message':err.message});
      return;
    }
    
    res.json({'confirmation':'success', 'question':question.summary()});
  });
  return;
}



this.handlePut = function(req, res, pkg){
    var query = {_id: pkg.id};
    var options = {new: true};    
    
    Question.findOneAndUpdate(query, req.body, options,function(err, question){
      if (err){
        res.send({'confirmation':'fail', 'message':err.message});
        return;
      }
      
      res.json({'confirmation':'success', 'question':question.summary()});
    });
    return;

}

this.handleDelete = function(req, res, pkg){
  console.log(pkg.id);


Question.findByIdAndRemove(pkg.id, function(err, question){
      if (err) {
        res.send({'confirmation': 'fail', 'message': "Question " + pkg.id + "not found"});
        return;
      }

      if (question == null){
        res.send({'confirmation':'fail', 'message':"Question"+ pkg.id+" not found"});
        return;
      }

      res.json({'confirmation':'success'});
    });
    return;
  }





