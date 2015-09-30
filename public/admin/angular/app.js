var modules = [
  'HomeModule',
  'AccountServiceModule', 
  'GeneralServiceModule',
  'RestServiceModule'
];

var app = angular.module('PubSavvySwipe', modules, function($interpolateProvider) {
    // set custom delimiters for angular templates
    $interpolateProvider.startSymbol('<%');
    $interpolateProvider.endSymbol('%>');
});