var questionCtr = angular.module('QuestionModule',[]);

questionCtr.controller('QuestionController', ['$scope', 'restService', 'accountService', function($scope, restService, accountService){

    $scope.newQuestion = {'question':'', 'answer':'', 'index':0};
    $scope.questions = null;
    $scope.visible = true;
    $scope.hidden = true;
    $scope.profile = null;

    $scope.init = function(){
        getQuestions();
        checkUser();
    }

    function getQuestions(){
        restService.query({resource:'question'}, function(response){
            console.log(JSON.stringify(response));

            if (response.confirmation != 'success') {
                alert('Error: ' + response.message);
                return;
            }

            $scope.questions = response.questions;
            for (var i=0; i<$scope.questions.length; i++){
                var question = $scope.questions[i];
                question['visible'] = 'yes';
                question['hidden'] = 'yes';
            }
            $scope.newQuestion.index = $scope.questions.length;

        });
    }

    function checkUser(){
        accountService.checkCurrentUser(function(response, error){

            if (error != null){
                console.log('ERROR ! ! ! -- '+JSON.stringify(error));
                return;
            }

          $scope.profile = response.profile;
        });
    }


    $scope.addQuestion = function(){
        restService.post({resource:'question'}, $scope.newQuestion, function(response){
            if (response.confirmation != 'success') {
                alert('Error: ' + response.message);
                return;
            }
            $scope.questions.push($scope.newQuestion);
            for (var i=0; i<$scope.questions.length; i++){
                var question = $scope.questions[i];
                question['visible'] = 'yes';
                question['hidden'] = 'yes';
            }
            orderByIndex();
            $scope.newQuestion = {'question':'', 'answer':'', 'index':$scope.questions.length};
        });
    }

    $scope.deleteQuestion = function(question){
        restService.delete({resource:'question', id:question.id}, function(response){
            if (response.confirmation != 'success') {
                alert('Error: ' + response.message);
                return;
            }

            var index = $scope.questions.indexOf(question);
            if (index == -1)
                return;

            $scope.questions.splice(index, 1);
        });
    }

    $scope.updateQuestion = function(question){
        console.log(question);
        console.log('updateQuestion: '+JSON.stringify(question));
        restService.put({resource:'question', id:question.id}, question, function(response){
            if (response.confirmation != 'success') {
                alert('Error: ' + response.message);
                return;
            }
        });
    }


    $scope.finishedEditing = function(question){
        $scope.toggleVisibility(question);
        orderByIndex();
    }


    // HELPER METHODS

    function orderByIndex(){

        function compare(a,b) {
          if (a.index < b.index)
            return -1;
          if (a.index > b.index)
            return 1;
          return 0;
        }

        $scope.questions.sort(compare);

    }

    $scope.toggleVisibility = function(question){
        if (question['visible'] =='no' && question['hidden'] =='no') {
            question['visible'] = 'yes';
            question['hidden'] = 'yes';
            return;
        }

        question['visible'] = 'no';
        question['hidden'] = 'no';
    }

    $scope.login = function(){
      accountService.login($scope.loginUser, function(response, error){
        if (error != null){
          alert(error.message);
          console.log('ERROR ! ! ! -- '+JSON.stringify(error));
          return;
        }
        window.location.href = '/site/account';
      });
    }
    
     $scope.logout = function(){
      accountService.logout(function(response, error){
        if (error != null){
          alert(error.message);
          console.log('ERROR ! ! ! -- '+JSON.stringify(error));
          return;
        }
        $scope.profile = {'id':null, 'email':'', 'password':'', 'firstName':'', 'lastName':''};
        window.location = "/"
      });
    }

}]);