var searchCtr = angular.module('SearchModule', []);

searchCtr.controller('SearchController', ['$scope', 'restService', 'generalService', 'accountService', function($scope, restService, generalService, accountService){
    $scope['generalService'] = generalService;
    $scope.terms = null;
    $scope.articles = null;
    $scope.results = new Array();
    $scope.loading = false;
    $scope.profile = null;
	
	$scope.init = function(){
        accountService.checkCurrentUser(function(response, error){

            if (error != null){
                console.log('ERROR ! ! ! -- '+JSON.stringify(error));
                return;
            }

            $scope.profile = response.profile;
        });

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

    $scope.logout = function(){
      accountService.logout(function(response, error){
        if (error != null){
          alert(error.message);
          console.log('ERROR ! ! ! -- '+JSON.stringify(error));
          return;
        }
        $scope.profile = {'id':null, 'email':'', 'password':'', 'firstName':'', 'lastName':''};
        window.location = "/"
      });
    }
}]);