
var accountCtr = angular.module('AccountModule', []);

accountCtr.controller('AccountController', ['$scope', 'restService', 'accountService', 'generalService', 'uploadService', function($scope, restService, accountService, generalService, uploadService){
    $scope['generalService'] = generalService;
	$scope.profile = {'id':null, 'email':'', 'firstName':'', 'lastName':'', 'image':'','password':'', 'phone':'', 'specialty':''};
    $scope.newPassword = '';
    $scope.confirmPassword = '';

    $scope.init = function(){
        console.log('init account controller')
        accountService.checkCurrentUser(function(response, error){
            if (error != null)
                return;
            
            $scope.profile = response['profile'];
        });
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
        window.location.href = '/';
      });
    }

}]);
