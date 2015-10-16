var questionCtr = angular.module('QuestionModule',[]);

questionCtr.controller('QuestionController', ['$scope', '$http', function($scope, $http){

  $scope.initialSearch = {'terms':[]};
  $scope.newQuestion = null;
  $scope.newAnswer = null;
  $scope.questionID = 0;

  $scope.init = function(){
    console.log('QuestionController:INIT');
    getQuestionID();
  }

    function getQuestionID(){
      console.log('hiiiiiiiii!!!!!')
    }

}]);