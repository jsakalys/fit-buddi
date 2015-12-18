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
    "Hi there! ^500Welcome to fitBuddi^500.^500.^500.^1000<br>I see that this is your first time^500.^500.^500.^1000<br>Before you can proceed, ^500we need to create a buddi to help you along on your fitness journey."
  ]
  $(function() {
    $(document.getElementById("start-text")).typed({
      strings: $scope.texttyping,
      typeSpeed: 20,
      startDelay: 1000,
      contentType: "html",
      showCursor: false,
      backDelay: 1000,
      backSpeed: 0,
      cursorChar: " :"
    });
  });
  $scope.continue = function(){
    $state.transitionTo("create");
  };
}])

.controller('CreateCtrl', ['$scope', 'currentAuth', '$state', function($scope, currentAuth, $state){
  $scope.$on('$ionicView.beforeEnter', function(){
    var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
    var randomNames = [
      "Bubbles", "Bubba", "Lupin", "Olly", "Kip", "Screech", "Lenny", "Hedwig", "Snoop", "Luffy", "Max", "Ori"
    ]
    var petName = randomNames[Math.floor(Math.random() * 12)];
    var today = new Date();
    var petBirthday = today.getTime();
    // create new pet under user
    usersRef.child(currentAuth.uid).child('buddi').set({
      name: petName,
      birthday: petBirthday,
      health: 3,
      mood: 'happy'
    });
    // get username and run script
    usersRef.child(currentAuth.uid).on("value", function(user){
      $scope.currentUser = user.val();
      $scope.texttyping = [
      "Now generating your personal fitness companion^500.^500.^500.^1000<br>It should only be a few more seconds^500.^500.^500.^1000<br>All done! ^1000" + $scope.currentUser.name  + ",^500 meet^500 '" + petName + "'!"
      ];
      $(function() {
        $(document.getElementById("create-text")).typed({
          strings: $scope.texttyping,
          typeSpeed: 20,
          startDelay: 1000,
          contentType: "html",
          showCursor: false,
          backDelay: 1000,
          backSpeed: 0,
          cursorChar: " :"
        });
      });
    }, function (errorObject) {
      alert("Sorry! There was an error getting your data:" + errorObject.code);
    });
    $scope.continue = function(){
      $state.go("tab.home");
    };
  });
}])

.controller('HomeCtrl', ['$scope', 'currentAuth', function($scope, currentAuth){
  $scope.$on('$ionicView.beforeEnter', function(){
    // get current user and buddi info
    var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
    usersRef.child(currentAuth.uid).on("value", function(user){
      $scope.currentUser = user.val();
      $scope.fullHearts = $scope.currentUser.buddi.health;
      $scope.emptyHearts = (3 - $scope.fullHearts);
      $scope.mood = $scope.currentUser.buddi.mood;
    }, function (errorObject) {
      alert("Sorry! There was an error getting your data:" + errorObject.code);
    });
    $scope.getHealth = function(num){
      return new Array(num);   
    };
    $scope.getMood = function(mood){
      if (mood == $scope.mood) {
        return true;
      } else {
        return false;
      };
    };
    $scope.giveGift = function(){
      usersRef.child(currentAuth.uid).child('buddi').child('mood').set(
        'happy'
      );
    };
    // get step data and execute appropriate script
    stepcounter.getTodayStepCount(function(success){
      $scope.stepsToday = success;
      // $scope.stepsToday = 11000
      if ($scope.stepsToday < 1000) {
        $('#pet').spState(1);
        $scope.texttyping = [
          "Zzz^500.^500.^500.^500 Zzzzzz.^500.^500.^500"
        ]
      } else if ($scope.stepsToday < 5000) {
        usersRef.child(currentAuth.uid).child('buddi').child('health').set(1);
        usersRef.child(currentAuth.uid).child('buddi').child('mood').set('unhappy');
        $('#pet').spState(5);
        $scope.texttyping = [
          "Hey! ^500 I noticed you haven't walked that much today yet^500.^500.^500.^1000 How about we go outside and see the sights?"
        ]
      } else if ($scope.stepsToday < 10000) {
        usersRef.child(currentAuth.uid).child('buddi').child('health').set(2);
        usersRef.child(currentAuth.uid).child('buddi').child('mood').set('stable');
        $('#pet').spState(6);
        $scope.texttyping = [
          "Wow! ^500.^500.^500.^500You've walked quite a bit today.^1000 Let's see if we can get to 10,000 steps!"
        ]
      } else if ($scope.stepsToday >= 10000) {
        usersRef.child(currentAuth.uid).child('buddi').child('health').set(3);
        usersRef.child(currentAuth.uid).child('buddi').child('mood').set('happy');
        $('#pet').spState(3);
        $scope.texttyping = [
          "Holy cow! ^500 I'd say we've put in quite a workout today! :sweat:"
        ];
      } else {
        $('#pet').spState(1);
        $scope.texttyping = [
          "Zzz^500.^500.^500.^500 Zzzzzz.^500.^500.^500"
        ]
      }
      $(function() {
        $(document.getElementById("typed-output")).typed({
          strings: $scope.texttyping,
          typeSpeed: 20,
          startDelay: 1000,
          contentType: "html",
          showCursor: false,
          backDelay: 1000,
          backSpeed: 0,
          cursorChar: " :"
        });
        $('#pet').sprite({fps: 4, no_of_frames: 7});
        $('#pet').isDraggable({
          start: function() {
          },
          stop: function() {
            $('#pet').spState(7);
          },
          drag: function() {
            $('#pet').spState(4);
          }
        });
      });
    },function(failure){
      alert(failure)
    });
  });
}])

.controller('StatsCtrl', ['$scope', 'currentAuth', function($scope, currentAuth){
  $scope.$on('$ionicView.beforeEnter', function(){
    // get current user info
    var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
    usersRef.child(currentAuth.uid).on("value", function(user){
      $scope.currentUser = user.val();
    }, function (errorObject) {
      alert("Sorry! There was an error getting your data:" + errorObject.code);
    });
    // $scope.stepHistory = { // sample data
    //   "2015-01-01":{"offset": 123, "steps": 456},
    //   "2015-01-02":{"offset": 579, "steps": 789},
    //   "2015-01-03":{"offset": 579, "steps": 1034},
    //   "2015-01-04":{"offset": 579, "steps": 2345},
    //   "2015-01-05":{"offset": 579, "steps": 456},
    //   "2015-01-06":{"offset": 579, "steps": 788},
    //   "2015-01-07":{"offset": 579, "steps": 3645},
    //   "2015-01-08":{"offset": 579, "steps": 5678},
    //   "2015-01-09":{"offset": 579, "steps": 3454},
    //   "2015-01-10":{"offset": 579, "steps": 1233}
    // };
    // function to get date from step history
    $scope.getKey = function(obj, idx){
      return Object.keys(obj)[idx]
    };
    // get step history and create bar chart/list data
    stepcounter.getHistory(function(success){
      $scope.stepHistory = success;
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
          i++;
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
    },function(failure){
      alert(failure);
    });
  });
}])

.controller('AccountCtrl', ['$scope', 'currentAuth', '$state', function($scope, currentAuth, $state){
  $scope.$on('$ionicView.beforeEnter', function(){
    // get current user info
    var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
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
  });
}])
