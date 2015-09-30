var app = angular.module('HomeModule', []);

app.controller('HomeController', ['$scope', 'generalService','restService', function($scope, generalService, restService) {

  $scope.profile = null;
  $scope['generalService'] = generalService;
  $scope.tagline = "a descriptive subtitle for your page";

  $scope.init = function (){
    $scope.profile = {'firstName':'Sarah', 'lastName':'Alder'}
    
    restService.query({resource:"profile", id:null}, function(response){
      console.log(JSON.stringify(response));
      if (response.confirmation != 'success')
        return
    });
  }

}]);