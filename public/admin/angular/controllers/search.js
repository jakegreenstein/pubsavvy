var searchCtr = angular.module('SearchModule', []);

searchCtr.controller('SearchController', ['$scope', 'restService', 'generalService', 'accountService', function($scope, restService, generalService, accountService){
    $scope['generalService'] = generalService;
    $scope.terms = null;
    $scope.section = 'search';
    $scope.device = null;
    $scope.articles = {};
    $scope.relatedArticles = {};
    $scope.loading = false;
    
    $scope.loading = false;
    $scope.profile = null;
    $scope.resultsVisible = false;
    // scope variables for pagination
    $scope.results = new Array();
    $scope.currentPage = 1
    $scope.numPerPage = 10
    $scope.searchClass = 'active';
    $scope.historyClass = '';
    $scope.savedClass = '';

	
	$scope.init = function(){
        accountService.checkCurrentUser(function(response, error){

            if (error != null){
                console.log('ERROR ! ! ! -- '+JSON.stringify(error));
                return;
            }

            $scope.profile = response.profile;
            getDevices();
        });

        var requestObject = $scope.generalService.parseLocation('admin');

        if( requestObject.params.term == null ) // no default search, ignore
            return;

        $scope.terms = requestObject.params.term;
        $scope.search(0);

	}

    function getDevices(){
        console.log('triggered get devices');
         restService.query({resource:'device', profileId:$scope.profile.id}, function(response){
            console.log(JSON.stringify(response));
            if (response.confirmation != 'success') {
                alert('Error: ' + response.message);
                return;
            }
            $scope.device = response.devices[0];
            console.log("DEVICE:" + JSON.stringify($scope.device));

            if ($scope.device == null) 
                return;

            if ($scope.device.saved.length == 0)
                return;
            
            var pmid = $scope.device.saved[0];
            getArticle(pmid);
        });
    }

    function getArticle(pmid){
        restService.query({resource:'search', pmid:pmid}, function(response){
            console.log(JSON.stringify(response));

            if (response.confirmation == 'success') {
                var article = response['article'][0];
                $scope.articles[article['pmid']] = article;
            }

            var index = $scope.device.saved.indexOf(pmid);

            if (index < $scope.device.saved.length-1)
                getArticle($scope.device.saved[index+1]);
            else {
                relatedPmids = $scope.device.saved.slice(0,3).join();
                restService.query({resource:'related', pmid:relatedPmids, limit:5}, function(response){
                    function createRelatedArticles(article, index, array) {
                      $scope.relatedArticles[article['pmid']] = article;
                      console.log(article);
                    }
                    var results = response.results;
                    results.forEach(createRelatedArticles);
                }, function(error, headers){
                    console.log('ERROR ! ! ! -- '+JSON.stringify(error));
                });


            }

        }); 
    }

    $scope.removeArticle = function(pmidIndex){
        var newPmidList = $scope.device.saved.splice(pmidIndex, 1);
        restService.put({resource:'device', id:$scope.device.id}, $scope.device, function(response){
            $scope.device = response.device;
        }, function(error, headers){
            console.log('ERROR ! ! ! -- '+JSON.stringify(error));
        });
    }    

    $scope.search = function(offset){
        if ($scope.terms==null || $scope.terms==""){
            alert("Please enter search terms");
            return;
        }
        
        $scope.loading = true;
        restService.query({resource:'search', term:$scope.terms.toString(), device:$scope.profile.device, offset:offset, id:null}, function(response){
            $scope.loading = false;
            if (response.confirmation != 'success') {
                alert('Error: ' + response.message);
                return;
            }

            $scope.results = response['results'];

            $scope.$watch('currentPage + numPerPage', function() {
            var begin = (($scope.currentPage - 1) * $scope.numPerPage)
            , end = begin + $scope.numPerPage;

            $scope.results = $scope.results.slice(begin, end);
            });

            $scope.count = response['count'];
            $scope.resultsVisible = true;
        });
    }

    $scope.redirect = function(key){
        console.log("REDIRECT");
        $scope.terms = key;
        $scope.section = 'search';
        document.getElementById('searchTab').click();
        $scope.historyClass = '';
        $scope.searchClass = 'active';

        $scope.search(0);
    }

    $scope.updateSection = function(newSection){
        $scope.section = newSection;

            if (newSection == "account-information"){
                $('.recommended-articles').hide();
            }
            else 
                $('.recommended-articles').show();

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