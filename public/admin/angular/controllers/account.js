
var accountCtr = angular.module('AccountModule', []);

accountCtr.controller('AccountController', ['$scope', 'restService', 'accountService', 'generalService', 'uploadService', function($scope, restService, accountService, generalService, uploadService){
    $scope['generalService'] = generalService;
	$scope.profile = {'id':null, 'email':'', 'firstName':'', 'lastName':'', 'image':'','password':'', 'phone':'', 'specialty':''};
    $scope.newPassword = '';
    $scope.confirmPassword = '';
    $scope.section = 'account-information';
    $scope.device = null;
    $scope.articles = {};
    $scope.relatedArticles = {};


    $scope.init = function(){
        console.log('init account controller')
        $scope.randomBackground = 'img/account-background-'+$scope.generalService.getRandomInt(1,3)+'.png';
        accountService.checkCurrentUser(function(response, error){
            if (error != null)
                return;
            
            $scope.profile = response['profile'];
            getDevices();
        });
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
            console.log($scope.device);

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

    $scope.updateSection = function(newSection){
        $scope.section = newSection;
    }

    $scope.redirect = function(term){
        window.location.href = '/admin/search-pubmed?term='+term;
    }

    $scope.onFileSelect = function(files, entity, media){
        $scope.loading = true;
        uploadService.uploadFiles({'files':files, 'media':media}, function(response, error){
            $scope.loading = false;
            
            if (error != null){
                alert(error.message);
                return;
            }            
            
            var image = response['image'];
            $scope.profile.image = image.id;
            $scope.update();
        });
    }

    $scope.update = function(){
        if($scope.newPassword != $scope.confirmPassword){
            alert('Passwords Do Not Match');
            return;
        }

        if($scope.newPassword != '' && $scope.newPassword == $scope.confirmPassword){
            $scope.profile.password = $scope.newPassword;
        }

        accountService.updateProfile($scope.profile, function(response, error){
            if (error != null){
              alert(error.message);
              return;
            }

            alert('You have succesfully updated your profile.');
            $scope.newPassword = '';
            $scope.confirmPassword = '';
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
        window.location.href = '/admin/home';
      });
    }

}]);
