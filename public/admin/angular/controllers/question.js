var questionCtr = angular.module('QuestionModule',[]);

questionCtr.controller('QuestionController', ['$scope', 'restService', function($scope, restService){

  $scope.newQuestion = {'question':'', 'answer':'', 'index':0};
  $scope.questions = [];

  $scope.init = function(){
    console.log('Question Controller: INIT');
        getQuestions();
  }

  getQuestions = function (){
    console.log('triggered get questions');
         restService.query({resource:'question'}, function(response){
            console.log(JSON.stringify(response));
            if (response.confirmation != 'success') {
                alert('Error: ' + response.message);
                return;
            }
            $scope.questions = response.questions;

        });
  }


    $scope.addQuestion = function(){
        console.log('NEW QUESTION: '+JSON.stringify($scope.newQuestion));

        restService.post({resource:'question'}, $scope.newQuestion, function(response){
            console.log(JSON.stringify(response));
            if (response.confirmation != 'success') {
                alert('Error: ' + response.message);
                return;
            }

            $scope.questions.push($scope.newQuestion);

            $scope.newQuestion = {'question':'', 'answer':'', 'index':$scope.questions.length};

        });

    }

    $scope.deleteQuestion = function(question){
        restService.delete({resource:'question', id:question.id}, function(response){
            console.log(JSON.stringify(response));
            if (response.confirmation != 'success') {
                alert('Error: ' + response.message);
                return;
            }
        });

        var index = $scope.questions.indexOf(question);

        if (index > -1) {
            $scope.questions.splice(index, 1);
        }
    }

    $scope.updateQuestion = function(question){
        console.log('updateQuestion: '+JSON.stringify(question));
    }

    

 
  


}]);