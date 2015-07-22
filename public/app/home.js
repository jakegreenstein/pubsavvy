var app = angular.module('HomeModule', []);

app.controller('HomeController', ['$scope', '$http', function($scope, $http){
	$scope.currentUser = {'loggedIn':'no'};
	$scope.profile = {'email':'', 'password':'', 'firstName':'', 'lastName':''};
	$scope.loginUser = {'email':'', 'password':''};

	
	$scope.init = function(){
		console.log('Home Controller: INIT');
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
	



	
}]);
