var app = angular.module('SearchModule', []);


app.controller('SearchController', ['$scope', '$http', function($scope, $http){
    $scope.terms = null;
    $scope.articles = null;
    $scope.results = new Array();
    $scope.keys = null;
	
	$scope.init = function(){
		console.log('Search Controller: INIT');
	}

    $scope.search = function(){
        if ($scope.terms==null||$scope.terms==""){
            alert("Please enter search terms");
            return;
        }
        var url = 'http://pubsavvyswipe.herokuapp.com/api/search?term='+$scope.terms.toString();
        $http.get(url).success(function(data, status, headers, config) {
            // console.log(JSON.stringify(data));
            var confirmation = data['confirmation'];

            if (confirmation != 'success'){
                alert(data['message']);
                return;
            }            
            
            $scope.articles = data['results']['PubmedArticleSet']['PubmedArticle'];
//            console.log(JSON.stringify($scope.articles[0]));
            for (var i=0; i<$scope.articles.length;i++){
                var medlineCitation = $scope.articles[i]['MedlineCitation'];
                var summary = medlineCitation[0];
                if (summary['Article'][0]!=null){
                    var article = summary['Article'][0];
                    if (article['Abstract']!=null){
                        var abstract = article['Abstract'][0];
                        var abstractText = abstract['AbstractText'][0]['_'];
//                        console.log("AbstractText: "+ JSON.stringify(abstractText));
                        var title = article['ArticleTitle'][0];
//                        console.log("Title: "+ title);
                        var authorList = article['AuthorList'][0];
                        var author = authorList['Author'];
                        var authors = new Array();
                         for (var j=0; j<author.length; j++) {
                            var authorInfo = author[j];
                            if (authorInfo['ForeName']!= null){
                                var authorName = authorInfo['ForeName'][0]+ " " + authorInfo['LastName'][0];
                                authors.push(authorName);
                            }
                        }
//                        console.log("Authors: "+authors);
                        var result = {'title':title, 'abstract':abstractText, 'authors':authors};
//                        console.log("Result: "+JSON.stringify(result));
                        $scope.results.push(result);
                    }
                }
            }
            $scope.keys = Object.keys($scope.results);
            console.log(JSON.stringify($scope.results));


        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
    }


}]);
