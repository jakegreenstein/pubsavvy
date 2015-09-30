var app = angular.module('SearchModule', []);


app.controller('SearchController', ['$scope', '$http', 'restService', function($scope, $http, restService){
    $scope.terms = null;
    $scope.articles = null;
    $scope.results = new Array();
    $scope.keys = null;
    $scope.loading = false;
	
	$scope.init = function(){
		console.log('Search Controller: INIT');
        var address = parseLocation('/admin');
        console.log('addres: '+JSON.stringify(address));
        //console.log('searchTerm: '+address.params.term);
        if( address.params.term != null ){
            $scope.terms = address.params.term;
            $scope.search(0);
        }

	}

    $scope.search = function(offset){
        if ($scope.terms==null||$scope.terms==""){
            alert("Please enter search terms");
            return;
        }
        $scope.loading = true;

        restService.query({resource:'search', term:$scope.terms.toString(), offset:offset, id:null}, function(response){
            $scope.loading = false;
            console.log(JSON.stringify(response));
            if (response.confirmation != 'success') {
                alert('Error: ' + response.message);
                return;
            }

            $scope.results = response['results'];
            $scope.count = response['count'];
            });
        }



    function parseLocation(stem){
        console.log('PARSE LOCATION: '+stem);
        var resourcePath = location.href.replace(window.location.origin, ''); // strip out the domain root (e.g. http://localhost:8888)
        var requestInfo = {"resource":null, "identifier":null, 'params':{}};

        // parse out the parameters:
        var p = resourcePath.split('?');
        if (p.length > 1){
            var paramString = p[1];
            var a = paramString.split('&');
            var params = {};
            for (var i=0; i<a.length; i++){
                var keyValue = a[i].split('=');
                if (keyValue.length<1)
                    continue;
                
                params[keyValue[0]] = keyValue[1];
            }
            
            requestInfo['params'] = params;
        }
        
        resourcePath = p[0];

        var parts = resourcePath.split(stem+'/');
        if (parts.length > 1){
            var hierarchy = parts[1].split('/');
            for (var i=0; i<hierarchy.length; i++){
                if (i==0)
                    requestInfo['resource'] = hierarchy[i]

                if (i==1) 
                    requestInfo['identifier'] = hierarchy[i];
                
            }
        }

        return requestInfo;
    }    


}]);
