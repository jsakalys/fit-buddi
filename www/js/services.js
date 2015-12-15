angular.module('fitBuddi.services', [])

.factory("Auth", function($firebaseAuth) {
  var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
  return $firebaseAuth(usersRef);
})
