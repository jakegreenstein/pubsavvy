var app = angular.module('AutoSearchModule', []);


app.controller('AutoSearchController', ['$scope', '$http', function($scope, $http){
	$scope.initialSearch = {'terms':[]};
    $scope.newTerm = null;
    $scope.autoSearchValue = null;
    $scope.autoSearchID = 0;

	
	$scope.init = function(){
		console.log('AutoSearch Controller: INIT');
        getAutoSearchID();
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
        console.log('NEWTERM INDEX: '+ $scope.autoSearchValue['terms'].indexOf($scope.newTerm));
        if($scope.autoSearchValue['terms'].indexOf($scope.newTerm) != -1){
            alert('Term already included in list');
            return;
        }

        $scope.autoSearchValue['terms'].push($scope.newTerm);

        var json = JSON.stringify($scope.autoSearchValue);
        console.log('UPDATE AUTOSEARCH: '+ json);
        updateAutoSearch(json);
        $scope.newTerm = null;
    }

    $scope.deleteTerm = function(term){
        console.log('TERM TO DELETE: '+ term);
        var index = $scope.autoSearchValue['terms'].indexOf(term);
        if (index > -1)
            $scope.autoSearchValue['terms'].splice(index, 1);

        var json = JSON.stringify($scope.autoSearchValue);
        console.log('UPDATE AUTOSEARCH: '+ json);
        updateAutoSearch(json);
    }

    function getAutoSearchID(){
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

    function updateAutoSearch(json){
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
	

}]);
