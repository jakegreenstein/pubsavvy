
var app = angular.module('AccountModule', ['angularFileUpload']);

app.controller('AccountController', ['$scope', '$http', '$upload', 'restService', 'accountService', 'generalService', 'uploadService', function($scope, $http, $upload, restService, accountService, generalService, uploadService){
	$scope.currentUser = {'loggedIn':'no'};
    $scope['generalService'] = generalService;
	$scope.profile = {'email':'', 'firstName':'', 'lastName':'', 'image':'','password':'',};
    $scope.newPassword = '';
    $scope.confirmPassword = '';
    $scope.section = 'account-information';
    $scope.device = null;
    $scope.articles = {};
    $scope.randomBackground = null;

	
	$scope.init = function(){
		console.log('Account Controller: INIT');
        checkCurrentUser();
        generateBackground();
	}


    function generateBackground(){
        var selection = $scope.generalService.getRandomInt(1,3);

        if(selection == 1)
            $scope.randomBackground = 'img/account-background-1.png';

        else if(selection == 2)
            $scope.randomBackground = 'img/account-background-2.png';

        else 
            $scope.randomBackground = 'img/account-background-3.png';
    }



    function checkCurrentUser(){
        accountService.checkCurrentUser(function(response, error){
            if (error != null)
                return;
            
            $scope.profile = response['profile'];
            $scope.currentUser.loggedIn = 'yes';
        });
    }

    function getDevices(){
         restService.query({resource:'device', profileId:$scope.profile.id}, function(response){
            console.log(JSON.stringify(response));
            if (response.confirmation != 'success') {
                alert('Error: ' + response.message);
                return;
            }
            $scope.device = response.devices[0];
            console.log($scope.device);


            if ($scope.device != null) {
                if ($scope.device.saved.length > 0){
                    var pmid = $scope.device.saved[0];
                    getArticle(pmid);
                    console.log('called get articles');
                }
            }
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

        }); 

    }

    $scope.removeArticle = function(pmidIndex){
        var newPmidList = $scope.device.saved.splice(pmidIndex, 1);
        restService.put({resource:'device', id:$scope.device.id}, $scope.device, function(response){
            console.log(JSON.stringify(response));
            $scope.device = response.device;
        }, function(error, headers){
            console.log('ERROR ! ! ! -- '+JSON.stringify(error));
        });
    }
    

    $scope.updateSection = function(newSection){
        $scope.section = newSection;
    }

    $scope.redirect = function(term){
        console.log('Redirect: '+term);
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
