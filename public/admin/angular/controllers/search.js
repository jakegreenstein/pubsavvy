var app = angular.module('SearchModule', []);

app.controller('SearchController', ['$scope', 'restService', 'generalService', function($scope, restService, generalService){
    $scope['generalService'] = generalService;
    $scope.terms = null;
    $scope.articles = null;
    $scope.results = new Array();
    $scope.loading = false;
	
	$scope.init = function(){
        var requestObject = $scope.generalService.parseLocation('admin');

        if( requestObject.params.term == null ) // no default search, ignore
            return;

        $scope.terms = requestObject.params.term;
        $scope.search(0);
	}

    $scope.search = function(offset){
        if ($scope.terms==null || $scope.terms==""){
            alert("Please enter search terms");
            return;
        }

        $scope.loading = true;
        restService.query({resource:'search', term:$scope.terms.toString(), offset:offset, id:null}, function(response){
            $scope.loading = false;
            if (response.confirmation != 'success') {
                alert('Error: ' + response.message);
                return;
            }

            $scope.results = response['results'];
            $scope.count = response['count'];
        });
    }
}]);