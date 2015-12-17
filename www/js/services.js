angular.module('fitBuddi.services', [])
// provides access to firebase auth service
.factory("Auth", function($firebaseAuth) {
	var usersRef = new Firebase("https://fitbuddi.firebaseio.com/users");
	return $firebaseAuth(usersRef);
});
