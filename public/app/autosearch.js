var app = angular.module('AutoSearchModule', []);


app.controller('AutoSearchController', ['$scope', '$http', function($scope, $http){
	
	
	$scope.init = function(){
		console.log('AutoSearch Controller: INIT');
	}

	

}]);
