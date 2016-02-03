var aboutCtr = angular.module('AboutModule',[]);

aboutCtr.controller('AboutController', ['$scope', 'restService', 'accountService', function($scope, restService, accountService){

    $scope.visible = true;
    $scope.hidden = true;
    $scope.profile = null;

    $scope.init = function(){
        checkUser();
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