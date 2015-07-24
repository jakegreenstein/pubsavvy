var app = angular.module('HomeModule', []);

app.controller('HomeController', ['$scope', '$http', function($scope, $http){
	$scope.currentUser = {'loggedIn':'no'};
	$scope.profile = {'email':'', 'password':'', 'firstName':'', 'lastName':''};
	$scope.loginUser = {'email':'', 'password':''};

	
	$scope.init = function(){
		console.log('Home Controller: INIT');
		checkCurrentUser();
	}

	function checkCurrentUser(){
		var url = '/api/currentuser';
        $http.get(url).success(function(data, status, headers, config) {
            console.log(JSON.stringify(data));
            if (data['confirmation'] != 'success'){
            	//alert(data['message']);
            	return;
            }
 
            $scope.profile = data['profile'];
            $scope.currentUser.loggedIn = 'yes';
        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
	}

	$scope.register = function(){		
		console.log(JSON.stringify($scope.profile));

		if ($scope.profile.firstName.length==0){
			alert('Please enter your first name.');
			return;
		}
		
		if ($scope.profile.lastName.length==0){
			alert('Please enter your last name.');
			return;
		}
		
		if ($scope.profile.email.length==0){
			console.log(JSON.stringify($scope.profile));
			alert('Please enter your email.');
			return;
		}


		if ($scope.profile.email.indexOf('@')==-1){
			alert('Please enter a valid email.');
			return;
		}
		
		if ($scope.profile.password.length==0){
			alert('Please enter your password.');
			return;
		}
		
		var json = JSON.stringify($scope.profile);
		
		$scope.profile = {'email':'', 'password':'', 'firstName':'', 'lastName':''};
		
    	var url = '/api/profile';
        $http.post(url, json).success(function(data, status, headers, config) {
            var confirmation = data['confirmation'];
            console.log('CONFIRMATION: '+confirmation);
            
            if (confirmation != 'success'){
                alert(data['message']);
                return;
            }
            
            
        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
	}


	$scope.login = function(){
		if ($scope.loginUser.email.length==0){
			alert("Please enter your email");
			return;
		}

		if ($scope.loginUser.password.length==0){
			alert("Please enter your password");
			return;
		}

		var json = JSON.stringify($scope.loginUser);
		console.log('Login: '+json);
		
		var url = '/api/login';
        $http.post(url, json).success(function(data, status, headers, config) {
            console.log(JSON.stringify(data));
            var confirmation = data['confirmation'];

            if (confirmation != 'success'){
                alert(data['message']);
                return;
            }
			
			$scope.profile = data['profile'];
            window.location.href = '/admin/home';

        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
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
