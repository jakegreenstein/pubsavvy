var questionCtr = angular.module('QuestionModule',[]);

questionCtr.controller('QuestionController', ['$scope', 'restService', function($scope, restService){

    $scope.newQuestion = {'question':'', 'answer':'', 'index':0};
    $scope.questions = null;
    $scope.visible = true;
    $scope.hidden = true;

    $scope.getQuestions = function(){
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

}]);