var app = angular.module('AccountModule', ['angularFileUpload']);

app.controller('AccountController', ['$scope', '$http', '$upload', function($scope, $http, $upload){
	$scope.currentUser = {'loggedIn':'no'};
	$scope.profile = {'email':'', 'firstName':'', 'lastName':'', 'image':''};
	$scope.upload;
    $scope.newPassword = '';
    $scope.confirmPassword = '';
    $scope.section = 'account-information';
    $scope.devices;
    $scope.searches = {'saved':[], 'searchHistory':{}};
    $scope.device;

    $scope.randomBackground;

	
	$scope.init = function(){
		console.log('Account Controller: INIT');
        checkCurrentUser();
        generateBackground();
	}

    function generateBackground(){
        var selection = getRandomInt(1,3);

        if(selection == 1)
            $scope.randomBackground = 'img/account-background-1.png';

        else if(selection == 2)
            $scope.randomBackground = 'img/account-background-2.png';

        else 
            $scope.randomBackground = 'img/account-background-3.png';
        
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function checkCurrentUser(){
        var url = '/api/currentuser';
        $http.get(url).success(function(data, status, headers, config) {
            console.log(JSON.stringify(data));
            if (data['confirmation'] != 'success'){
                //alert(data['message']);
                return;
            }
 
            $scope.profile = data['profile'];
            //console.log($scope.profile.image);
            if($scope.profile.image == '' || $scope.profile.image == "none"){
                $scope.profile.image = '/admin/img/no-profile-image.jpg';
            }

            //UPDATE VARIABLES FROM CURRENT USER
            getDevices();
            $scope.currentUser.loggedIn = 'yes';


        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
    }

    function getDevices(){
        var url = '/api/device?profileId='+$scope.profile.id;
        $http.get(url).success(function(data, status, headers, config) {
            //console.log(JSON.stringify(data));
            if (data['confirmation'] != 'success'){
                //alert(data['message']);
                return;
            }
            //$scope.devices = data['devices'];
            $scope.device = data.devices[0];
            //updateSaved();
        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
    }

    //THIS IS USED TO CREATE SINGLE LISTS OF ARTICLES AND HISTORY FOR ALL DEVICES
    //LEAVE HERE INCASE WE DECIDE TO GET MORE COMPLICATED THAN JUST USING THE NEWEST DEVICE
    // function updateSaved(){
    //     for(var i = 0; i < $scope.devices.length; i++){
    //         //Update Saved Article PMIDS
    //         for(var j = 0; j < $scope.devices[i].saved.length; j++)
    //             $scope.searches.saved.push($scope.devices[i].saved[j]);

    //         for(var mySearch in $scope.devices[i].searchHistory)
    //             $scope.searches.searchHistory[mySearch] = $scope.devices[i].searchHistory[mySearch];
    //     }
    // }

    $scope.removeArticle = function(pmidIndex){
        if(pmidIndex != -1){
            $scope.device.saved.splice(pmidIndex, 1);

            var url = '/api/device/'+ $scope.device.id;
            var json = JSON.stringify($scope.device);

            $http.put(url, json).success(function(data, status, headers, config) {
                var confirmation = data['confirmation'];            
                if (confirmation != 'success'){
                    alert(data['message']);
                    return;
                }
                //DO SOMETHING AFTER
             
            }).error(function(data, status, headers, config) {
                console.log("error", data, status, headers, config);
            });
        }
        else
            alert('Error: Cannot Remove - Index Not Found');
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
        console.log('logout and delete session id');
        var url = '/api/logout';
        $http.get(url).success(function(data, status, headers, config) {
            console.log(JSON.stringify(data));
            if (data['confirmation'] != 'success'){
                alert(data['message']);
                return;
            }
            $scope.profile = {'email':'', 'password':'', 'firstName':'', 'lastName':''};
            $scope.currentUser.loggedIn = 'no';
            window.location.href = '/admin/home';

        }).error(function(data, status, headers, config) {
            console.log("error", data, status, headers, config);
        });
    }

}]);
