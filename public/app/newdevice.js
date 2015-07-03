var app = angular.module('NewDeviceModule', []);


app.controller('NewDeviceController', ['$scope', '$http', function($scope, $http){
	$scope.device = {'deviceToken':''};
	
	$scope.init = function(){
		console.log('NewDeviceController: INIT');
	}
	
	$scope.createDevice = function(){
		var json = JSON.stringify($scope.device);
		console.log('GRAB MESSAGE DATA: ' + json)
		
		
    	var url = '/api/device';
        $http.post(url, json).success(function(data, status, headers, config) {
            var confirmation = data['confirmation'];
            console.log('CONFIRMATION: '+confirmation);
            
            if (confirmation != 'success'){
                alert(data['message']);
                return;
            }
            

            alert('Device COMPOSED: '+ JSON.stringify($scope.device));
            window.location.href = '/admin/newdevice';
           
            
        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
	}
	

}]);
