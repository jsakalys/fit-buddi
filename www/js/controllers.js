angular.module('fitBuddi.controllers', [])


.controller('SignupCtrl', ['$scope', 'Auth', 'currentAuth', '$state', function($scope, Auth, currentAuth, $state){
  var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
  // check if user is logged in
  Auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log("Not logged in yet");
    } else {
      console.log("Logged in as", authData.uid);
      // get current user info
      $scope.currentUser = '';
      usersRef.child(currentAuth.uid).on("value", function(user) {
        $scope.currentUser = user.val();
        console.log($scope.currentUser)
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    }
    $scope.authData = authData;
  });
  // bind form data to user model
  $scope.user = {
    name: '',
    email: '',
    password: ''
  }
  // create a new user from form data
  $scope.signup = function(){
    usersRef.createUser({
      name: $scope.user.name,
      email: $scope.user.email,
      password: $scope.user.password,
    }, function(error, userData) {
      if (error) {
        console.log("Error creating user:", error);
      } else {
        console.log("Successfully created user account with uid:", userData.uid);
        // log in the new user
        usersRef.authWithPassword({
          email: $scope.user.email,
          password: $scope.user.password
        }, function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            console.log("Authenticated successfully with payload:", authData);
            if (authData) {
              console.log(authData)
            // save the user's profile into Firebase so we can list users,
            // use them in Security and Firebase Rules, and show profiles
              usersRef.child(authData.uid).set({
                provider: authData.provider,
                name: $scope.user.name
              });
            };
            // redirect user to select state
            $state.go("select");
          }
        });
      }
    });
  };
  $scope.logout = function(){
    usersRef.unauth();
  };
}])

.controller('LoginCtrl', ['$scope', 'Auth', 'currentAuth', '$state', function($scope, Auth, currentAuth, $state){
  var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
  // check if user is logged in
  Auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log("Not logged in yet.");
    } else {
      console.log("Logged in as", authData.uid);
      // get current user info
      $scope.currentUser = '';
      usersRef.child(currentAuth.uid).on("value", function(user) {
        $scope.currentUser = user.val();
        console.log($scope.currentUser)
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    }
    $scope.authData = authData;
  });
  // bind form data to user model
  $scope.user = {
    email: '',
    password: ''
  }
  $scope.fbLogin = function() {
    Auth.$authWithOAuthRedirect("facebook").then(function(authData) {
      console.log(authData)
      // User successfully logged in
    }).catch(function(error) {
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        Auth.$authWithOAuthPopup("facebook").then(function(authData) {
          // User successfully logged in.
          console.log(authData);
          $state.go("tab.home");
        });
      } else {
        // Another error occurred
        console.log(error);
      }
    });
  };
  $scope.login = function(){
    usersRef.authWithPassword({
      email: $scope.user.email,
      password: $scope.user.password
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        $state.go("tab.home");
      }
    });
  };
  $scope.logout = function(){
    usersRef.unauth();
  };
}])

.controller('StartCtrl', ['$scope', 'currentAuth', '$state', function($scope, currentAuth, $state){
  var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
  usersRef.child(currentAuth.uid).on("value", function(user) {
    $scope.currentUser = user.val();
    console.log($scope.currentUser)
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
  $scope.texttyping = [
    "Hi there! ^500 Welcome to fitBuddi ^500 . ^500 . ^500 . <br> I notice this is your first time ^500 . ^500 . ^500 . <br> Before you can proceed, ^500 we need to create a buddi to help you along on your fitness journey."
  ]
  $scope.continue = function(){
    $state.go("create");
  }
}])

.controller('CreateCtrl', ['$scope', 'currentAuth', '$state', function($scope, currentAuth, $state){
  var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
  // get current user info
  $scope.currentUser = '';
  usersRef.child(currentAuth.uid).on("value", function(user) {
    $scope.currentUser = user.val();
    console.log($scope.currentUser)
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
  var randomNames = [
    "Bubbles", "Lupin", "Kip", "Screech", "Lenny", "Hedwig", "Snoop", "Luffy", "Max", "Ori"
  ]
  var petName = randomNames[Math.floor(Math.random() * 10)];
  var today = new Date();
  var petBirthday = today.getTime();
  // create new pet under user
  usersRef.child(currentAuth.uid).child('buddi').set({
    name: petName,
    birthday: petBirthday,
    health: 3,
    mood: 'happy'
  });
  $scope.texttyping = [
    "Now generating your fitBuddi ^500 . ^500 . ^500 . <br> Just a few more seconds ^500 . ^500 . ^500 . <br>  OK! ^500 . ^500 . Meet ^500 . ^500 . '" + petName + "'!"
  ]
  $scope.continue = function(){
    $state.go("tab.home");
  }
}])

.controller('HomeCtrl', ['$scope', 'currentAuth', function($scope, currentAuth) {

}])

.controller('TrendsCtrl', ['$scope', 'currentAuth', function($scope, currentAuth) {

}])

.controller('AccountCtrl', ['$scope', 'currentAuth', function($scope, currentAuth) {
  var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
  // get current user info
  $scope.currentUser = '';
  $scope.currentAuth = currentAuth;
  console.log(currentAuth)
  usersRef.child(currentAuth.uid).on("value", function(user) {
    $scope.currentUser = user.val();
    $scope.buddiBirthday = new Date($scope.currentUser.buddi.birthday);
    console.log($scope.currentUser)
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

}])

.directive('typedjs', function() {
  return {
    restrict: 'E',
    scope: {
      strings: '='
    },
    template: '<span id="typed-output"></span>',
    link: function($scope, $element, $attrs) {
      var options = {
        strings: $scope.strings,
        typeSpeed: 20,
        startDelay: 1000,
        contentType: "html",
        showCursor: false,
        backDelay: 1000,
        backSpeed: 0,
        cursorChar: " :"
      };
      $(function() {
        $("#typed-output").typed(options);
      });
    }
  };
});
