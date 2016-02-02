var aboutCtr = angular.module('AboutModule', []);

aboutCtr.controller('AboutController', ['$scope', 'accountService', function($scope, accountService){
	$scope.profile = {'id':null, 'email':'', 'password':'', 'firstName':'', 'lastName':''};

	
	$scope.checkCurrentUser = function(){
		console.log('Home Controller: checkCurrentUser');
		accountService.checkCurrentUser(function(response, error){

      if (error != null){
          console.log('ERROR ! ! ! -- '+JSON.stringify(error));
          return;
        }
          $scope.profile = response.profile;
    });
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
      });
    }

}]);