var app = angular.module('HomeModule', []);

app.controller('HomeController', ['$scope', '$http', 'accountService', function($scope, $http, accountService){
	$scope.currentUser = {'loggedIn':'no'};
	$scope.profile = {'email':'', 'password':'', 'firstName':'', 'lastName':''};
	$scope.loginUser = {'email':'', 'password':''};

	
	$scope.init = function(){
		console.log('Home Controller: INIT');
		checkCurrentUser();
	}

	function checkCurrentUser(){
    accountService.checkCurrentUser(function(response, error){

      if (error != null){
          console.log('ERROR ! ! ! -- '+JSON.stringify(error));
          return;
        }
          $scope.profile = response['profile'];
          $scope.currentUser.loggedIn = 'yes';
    });
  }

    $scope.login = function(){
      accountService.login($scope.loginUser, function(response, error){
        if (error != null){
          alert(error.message);
          console.log('ERROR ! ! ! -- '+JSON.stringify(error));
          return;
        }

        window.location.href = '/admin/account';
      });
    }


	$scope.logout = function(){
		console.log('logout and delete session id');
		var url = '/api/logout';
        $http.get(url).success(function(data, status, headers, config) {
            console.log(JSON.stringify(data));
            if (data['confirmation'] != 'success'){
            	alert(data['message']);
                return;
            }
            $scope.profile = {'email':'', 'password':'', 'firstName':'', 'lastName':''};
            $scope.currentUser.loggedIn = 'no';
            window.location.href = '/admin/home';

        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
	}
	
}]);
