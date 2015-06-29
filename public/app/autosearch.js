var app = angular.module('AutoSearchModule', []);


app.controller('AutoSearchController', ['$scope', '$http', function($scope, $http){
	$scope.initialSearch = {'terms':[]};
    $scope.newTerm = null;
    $scope.autoSearchValue = null;
    $scope.autoSearchID = 0;

	
	$scope.init = function(){
		console.log('AutoSearch Controller: INIT');
        getAutoSeachID();
	}

    $scope.createAutoSearch = function(){
        var json = JSON.stringify($scope.initialSearch);
        console.log('CREATE AUTOSEARCH: '+ json);

        var url = '/api/autosearch';
        $http.post(url, json).success(function(data, status, headers, config) {
            console.log(JSON.stringify(data));
                        
            var confirmation = data['confirmation'];

            if (confirmation != 'success'){
                alert(data['message']);
                return;
            }              
        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
    }

    $scope.addTerm = function(){
        console.log('NEWTERM: '+$scope.newTerm);
        $scope.autoSearchValue['terms'].push($scope.newTerm);

        var json = JSON.stringify($scope.autoSearchValue);
        console.log('UPDATE AUTOSEARCH: '+ json);

        var url = '/api/autosearch/'+$scope.autoSearchID;
        $http.put(url, json).success(function(data, status, headers, config) {
            console.log(JSON.stringify(data));
                        
            var confirmation = data['confirmation'];

            if (confirmation != 'success'){
                alert(data['message']);
                return;
            }            
            
        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
    }

    function getAutoSeachID(){
        var url = '/api/autosearch';
        $http.get(url).success(function(data, status, headers, config) {
            console.log(JSON.stringify(data));
            var confirmation = data['confirmation'];

            if (confirmation != 'success'){
                alert(data['message']);
                return;
            } 
            $scope.autoSearchValue = data['autosearches'][0];
            $scope.autoSearchID = $scope.autoSearchValue['id'];
            console.log('AutoSearchID: '+$scope.autoSearchID)           
            
        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
    }
	

}]);
