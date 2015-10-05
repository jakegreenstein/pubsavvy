
var app = angular.module('AccountModule', ['angularFileUpload']);

app.controller('AccountController', ['$scope', '$http', '$upload', 'restService', 'accountService', 'generalService', function($scope, $http, $upload, restService, accountService, generalService){
	$scope.currentUser = {'loggedIn':'no'};
    $scope['generalService'] = generalService;
	$scope.profile = {'email':'', 'firstName':'', 'lastName':'', 'image':''};
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

        if (error != null){
          console.log('ERROR ! ! ! -- '+JSON.stringify(error));
          return;
        }
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

	$scope.onFileSelect = function(files, property, entity){
   		var url = 'http://media-service.appspot.com/api/upload';
        $http.get(url).success(function(data, status, headers, config){
            if(data['confirmation'] != 'success'){
                alert(data['message']);
                return;
            }
            var uploadString = data['upload'];
            uploadFiles(files, uploadString, property, entity);
        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
    }

    function uploadFiles($files, uploadString, property, entity) { 
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            $scope.upload = $upload.upload({
                url: uploadString, //upload.php script, node.js route, or servlet url
                method: 'POST',
                // headers: {'header-key': 'header-value'},
                // withCredentials: true,
                data: {myObj: $scope.myModelObj},
                file: file // or list of files: $files for html5 only
                /* set the file formData name ('Content-Desposition'). Default is 'file' */
                //fileFormDataName: myFile, //or a list of names for multiple files (html5).
            }).progress(function(evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(data, status, headers, config){ // file is uploaded successfully           
            //console.log(JSON.stringify(data));
            var confirmation = data['confirmation'];
            
            if (confirmation != 'success'){
                alert(data['message']);
                return;
            }
            
            if(property=='image'){
                var image = data['image'];
                if(entity=='profile'){
                    $scope.profile['image'] = image['address'];
                }
            }

            console.log('profile: '+JSON.stringify($scope.profile));

          });
        }
    }

    $scope.update = function(){
        if($scope.newPassword != $scope.confirmPassword){
            alert('Passwords Do Not Match');
            return;
        }

        if($scope.newPassword != '' && $scope.newPassword == $scope.confirmPassword){
            $scope.profile.password = $scope.newPassword;
        }

        var url = '/api/profile/'+ $scope.profile.id;
        var json = JSON.stringify($scope.profile);

        $http.put(url, json).success(function(data, status, headers, config) {
            var confirmation = data['confirmation'];
            //console.log('CONFIRMATION: '+JSON.stringify(data));
            
            if (confirmation != 'success'){
                alert(data['message']);
                return;
            }
            
            var p = data['profile'];
            alert(p.firstName+ ' '+p.lastName+' succesfully updated profile.');
            //$scope.profile = {'firstName':'', 'lastName':'', 'email':'', 'password':''};
            $scope.newPassword = '';
            $scope.confirmPassword = '';
            
        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
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
