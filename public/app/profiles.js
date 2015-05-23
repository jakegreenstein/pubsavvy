var app = angular.module('ProfilesModule', []);


app.controller('ProfilesController', ['$scope', '$http', function($scope, $http){
	$scope.profile = {'firstName':'', 'lastName':'','email':'','password':''};
	$scope.profiles = null;
	
	$scope.init = function(){
		console.log('Profiles Controller: INIT');
		fetchProfiles();
	}

	$scope.createProfile = function(){
		var json = JSON.stringify($scope.profile);
		console.log('CREATE PROFILE: '+ json);

    	var url = '/api/profiles';
        $http.post(url, json).success(function(data, status, headers, config) {
            console.log(JSON.stringify(data));
                        
            var confirmation = data['confirmation'];

            if (confirmation != 'success'){
                alert(data['message']);
                return;
            }            
            
            $scope.profiles.push(data['profile']);
            
        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
	}

	function fetchProfiles(){
		var url = '/api/profiles';
        $http.get(url).success(function(data, status, headers, config) {
            console.log(JSON.stringify(data));
            var confirmation = data['confirmation'];

            if (confirmation != 'success'){
                alert(data['message']);
                return;
            } 

            $scope.profiles = data['profiles'];           
            
        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
	}

}]);
