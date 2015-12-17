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
      usersRef.child(authData.uid).on("value", function(user){
        $scope.currentUser = user.val();
      }, function (errorObject) {
        alert("Sorry! There was an error getting your data:" + errorObject.code);
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
        alert("Error creating user:", error);
      } else {
        console.log("Successfully created user account with uid:", userData.uid);
        // log in the new user
        usersRef.authWithPassword({
          email: $scope.user.email,
          password: $scope.user.password
        }, function(error, authData) {
          if (error) {
            alert("Login Failed!", error);
          } else {
            console.log("Authenticated successfully with payload:", authData);
            if (authData) {
              // save the user's profile into Firebase
              usersRef.child(authData.uid).set({
                provider: authData.provider,
                name: $scope.user.name
              });
            };
            // redirect user to select state
            $state.go("start");
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
  Auth.$onAuth(function(authData){
    if (authData === null) {
      console.log("Not logged in yet.");
    } else {
      console.log("Logged in as", authData.uid);
      // get current user info
      usersRef.child(authData.uid).on("value", function(user){
        $scope.currentUser = user.val();
      }, function (errorObject){
        alert("Sorry! There was an error getting your data:" + errorObject.code);
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
    Auth.$authWithOAuthRedirect("facebook").then(function(authData){
    }).catch(function(error) {
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        Auth.$authWithOAuthPopup("facebook").then(function(authData){
          console.log("Login Successful!", authData);
          $state.go("tab.home");
        });
      } else {
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
        console.log("Login Successful!", authData);
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
  usersRef.child(currentAuth.uid).on("value", function(user){
    $scope.currentUser = user.val();
  }, function (errorObject) {
    alert("Sorry! There was an error getting your data:" + errorObject.code);
  });
  $scope.texttyping = [
    "Hi there! ^500 Welcome to fitBuddi ^500 . ^500 . ^500 . <br> I notice this is your first time ^500 . ^500 . ^500 . <br> Before you can proceed, ^500 we need to create a buddi to help you along on your fitness journey."
  ]
  $scope.continue = function(){
    $state.transitionTo("create");
  };
}])

.controller('CreateCtrl', ['$scope', 'currentAuth', '$state', function($scope, currentAuth, $state){
  var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
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
  ];
  $scope.continue = function(){
    $state.go("tab.home");
  };
}])

.controller('HomeCtrl', ['$scope', 'currentAuth', function($scope, currentAuth){
  var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
  // get current user info
  usersRef.child(currentAuth.uid).on("value", function(user){
    $scope.currentUser = user.val();
    $scope.getHealth = function(num){
      return new Array(num);   
    };
    $scope.getMood = function(mood){
      if (mood == 'happy') {
        return true;
      } else {
        return false;
      };
    };
    $scope.fullHearts = $scope.currentUser.buddi.health;
    $scope.emptyHearts = (3 - $scope.fullHearts);
    $scope.mood = $scope.currentUser.buddi.mood;
  }, function (errorObject) {
    alert("Sorry! There was an error getting your data:" + errorObject.code);
  });
  $scope.giveGift = function(){
    usersRef.child(currentAuth.uid).child('buddi').child('mood').set(
      'happy'
    );
  };
  // stepcounter.getTodayStepCount(function(success){
  //   $scope.stepsToday = success;
    $scope.stepsToday = 5000
    if ($scope.stepsToday < 5000) {
      usersRef.child(currentAuth.uid).child('buddi').child('health').set(1);
      usersRef.child(currentAuth.uid).child('buddi').child('mood').set('unhappy');
      $scope.texttyping = [
        "Hey! ^500 I noticed you haven't walked that much today yet^500.^500.^500.^500<br>How about we go outside and see the sights?"
      ]
    } else if ($scope.stepsToday < 10000) {
      usersRef.child(currentAuth.uid).child('buddi').child('health').set(2);
      usersRef.child(currentAuth.uid).child('buddi').child('mood').set('happy');
      $scope.texttyping = [
        "Wow! ^500.^500.^500.^500You've walked quite a bit today.^1000<br>Let's see if we can get to 10,000 steps!"
      ]
    } else if ($scope.stepsToday >= 10000) {
      usersRef.child(currentAuth.uid).child('buddi').child('health').set(3);
      usersRef.child(currentAuth.uid).child('buddi').child('mood').set('happy');
      $scope.texttyping = [
        "Holy cow! ^500 I'd say we've put in quite a workout today! :sweat:"
      ];
    } else {
      $scope.texttyping = [
        "ZzzZzzzzz"
      ]
    }
  // },function(failure){
  //   alert(failure)
  // });
}])

.controller('StatsCtrl', ['$scope', 'currentAuth', function($scope, currentAuth){
  $scope.$on('$ionicView.afterEnter', function(){
    var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
    // get current user info
    usersRef.child(currentAuth.uid).on("value", function(user){
      $scope.currentUser = user.val();
    }, function (errorObject) {
      alert("Sorry! There was an error getting your data:" + errorObject.code);
    });
    $scope.stepHistory = {
      "2015-01-01":{"offset": 123, "steps": 456},
      "2015-01-02":{"offset": 579, "steps": 789},
      "2015-01-03":{"offset": 579, "steps": 1034},
      "2015-01-04":{"offset": 579, "steps": 2345},
      "2015-01-05":{"offset": 579, "steps": 456},
      "2015-01-06":{"offset": 579, "steps": 788},
      "2015-01-07":{"offset": 579, "steps": 3645},
      "2015-01-08":{"offset": 579, "steps": 5678},
      "2015-01-09":{"offset": 579, "steps": 3454},
      "2015-01-10":{"offset": 579, "steps": 1233}
    };
    $scope.getKey = function(obj, idx){
      return Object.keys(obj)[idx]
    };
    // stepcounter.getTodayStepCount(function(success){
    //   $scope.stepsToday = success
    // },function(failure){
    //   alert(failure)
    // });
    // stepcounter.getStepCount(function(success){
    //   $scope.totalSteps = success
    // },function(failure){
    //   alert(failure)
    // });
    // stepcounter.getHistory(function(success){
    //   $scope.stepHistory = success
    // },function(failure){
    //   alert(failure)
    // });
    // *bar chart stuff* //
    var stepLabels = [];
    var stepData = [];
    var dataLimit = 7;
    var i = 0;
    angular.forEach($scope.stepHistory, function(data, key){
      if (i == dataLimit) {
        return;
      } else {
        stepLabels.push(key);
        stepData.push(data.steps);
        i++
      }
    });
    
    var data = {
      labels: stepLabels,
      datasets: [
        {
          label: "My First dataset",
          fillColor: "rgba(220,220,220,0.5)",
          strokeColor: "rgba(220,220,220,0.8)",
          highlightFill: "rgba(220,220,220,0.75)",
          highlightStroke: "rgba(220,220,220,1)",
          data: stepData
        }
      ]
    };
    var options = {
      scaleBeginAtZero : true,
      scaleShowGridLines : false,
      scaleGridLineColor : "rgba(0,0,0,.05)",
      scaleGridLineWidth : 1,
      scaleShowHorizontalLines: true,
      scaleShowVerticalLines: true,
      scaleFontSize: 10,
      scaleFontFamily: 'Half-Bold-Pixel-7',
      scaleLineWidth: 0,
      tooltipFontFamily: 'Half-Bold-Pixel-7',
      tooltipFontSize: 10,
      tooltipFontStyle: 'normal',
      responsive: true,
      barShowStroke : false,
      barStrokeWidth : 1,
      barValueSpacing : 2,
      barDatasetSpacing : 1,
      legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
    };
    var ctx = document.getElementById("stepChart").getContext("2d");
    var stepChart = new Chart(ctx).Bar(data, options);
  });
}])

.controller('AccountCtrl', ['$scope', 'currentAuth', '$state', function($scope, currentAuth, $state){
  var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
  // get current user info
  $scope.currentAuth = currentAuth;
  usersRef.child(currentAuth.uid).on("value", function(user){
    $scope.currentUser = user.val();
    // important! get birthday from timestamp
    var buddiBirthday = new Date($scope.currentUser.buddi.birthday);
    $scope.buddiBirthday = buddiBirthday.toDateString();
  }, function (errorObject) {
    alert("Sorry! There was an error getting your data:" + errorObject.code);
  });
  $scope.logout = function(){
    usersRef.unauth();
    $state.go("login");
  };
  $scope.create = function(){
    $state.go("create");
  };
}])

.directive('typedjs', function(){
  return {
    restrict: 'E',
    replace: true,
    scope: {
      strings: '='
    },
    template: '<span id="typed-output"></span>',
    link: function($scope, $element, $attrs){
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
        $(document.getElementById("typed-output")).typed(options);
      });
    }
  };
});
