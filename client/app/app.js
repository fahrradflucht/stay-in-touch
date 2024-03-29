'use strict';

angular.module('stayInTouchApp', [
  'stayInTouchApp.auth',
  'stayInTouchApp.admin',
  'stayInTouchApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'validation.match'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
