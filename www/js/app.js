var authWait = ["Auth", function(Auth) { return Auth.$waitForAuth(); }]
var authRequire = ["Auth", function(Auth) { return Auth.$requireAuth(); }]

angular.module('fitBuddi', ['ionic', 'firebase', 'fitBuddi.controllers', 'fitBuddi.services'])

.run(['$ionicPlatform', '$rootScope', '$state', function($ionicPlatform, $rootScope, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $state.go("login");
    }
  });
}])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');

  $stateProvider

  .state('signup', {
    cache: false,
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignupCtrl',
    resolve: {
      "currentAuth": authWait
    }
  })

  .state('login', {
    cache: false,
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl',
    resolve: {
      "currentAuth": authWait
    }
  })

  .state('start', {
    cache: false,
    url: '/start',
    templateUrl: 'templates/start.html',
    controller: 'StartCtrl',
    resolve: {
      "currentAuth": authRequire
    }
  })

  .state('create', {
    cache: false,
    url: '/create',
    templateUrl: 'templates/create.html',
    controller: 'CreateCtrl',
    resolve: {
      "currentAuth": authRequire
    }
  })

  .state('tab', {
    cache: false,
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    resolve: {
      "currentAuth": authRequire
    }
  })

  .state('tab.home', {
    cache: false,
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    },
    resolve: {
      "currentAuth": authRequire
    }
  })

  .state('tab.trends', {
      cache: false,
      url: '/trends',
      views: {
        'tab-trends': {
          templateUrl: 'templates/tab-trends.html',
          controller: 'TrendsCtrl'
        }
      },
      resolve: {
      "currentAuth": authRequire
    }
  })

  .state('tab.account', {
    cache: false,
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    },
    resolve: {
      "currentAuth": authRequire
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

});
