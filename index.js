var app = angular.module("myapp", ["ngRoute"]);

app.config(function($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "views/main.html",
      controller:"indexController"
    })
    .when("/login", {
      templateUrl: "views/login.html",
      controller: "loginController"
    })
    .when("/register", {
      templateUrl: "views/register.html",
      controller: "registerController"
    })
    .when("/profile", {
      templateUrl: "views/profile.html",
      controller: "profileController",
      resolve: [
        "authService",function(authService) {
          return authService.isLoggedIn();
        }
      ]
    })
    .when("/messages", {
      templateUrl: "views/messages.html",
      controller: "msgController",
      resolve: [
        "authService",function(authService) {
          return authService.isLoggedIn();
        }
      ]
    })
    .when("/detailmsg/:id", {
      templateUrl: "views/detailmsg.html",
      controller: "detailmsgController",
       resolve: ['authService', function (authService) {
                return authService.isLoggedIn();
            }]
    })
    .when("/logout", {
      templateUrl: "views/main.html",
      controller: "logoutController"
    });
});
app.factory("authService", function($http, $location, $q) {
  var defer = $q.defer();
  return {
    isLoggedIn: function() {
      $http.get("http://127.0.0.1:5500/status.json").then(function(data) {
        if (data.data.isLoggedIn) {
          defer.resolve();
        } else {
          $location.path("/");
          defer.reject();
        }
      });
      return defer.promise;
    } 
  };
});

app.controller("detailmsgController", function( $scope,$http, $location,$rootScope,$routeParams,authService) {
  authService.isLoggedIn();
  $scope.$emit("login", {});
  //$scope.num = $routeParams.id;
  //console.log($scope.num);
  $http.get(`http://localhost:3000/msgs/${$routeParams.id}`).then(function(res){
          if(res.data.favorite ==true){
            $scope.favtrue = true;
          }else{
            $scope.favtrue = false;
          }
          $scope.message = res.data;
      })
      .catch(function(err){
          console.log(err);
      });
      $scope.delete = function(event){
        var id = event.target.id;
        $http.get(`http://localhost:3000/delete/${id}`).then(function(res){
          if(res.data){
            $location.url('/messages');
          }
        }).catch((err)=>{
          console.log(err);
        });
      }
      $scope.replyOn = false;
      $scope.reply = function(event){
        $scope.replyOn = true;
      }
      $scope.favorite = function(event){
        console.log("hi");
        var id = event.target.id;
        $http.get(`http://localhost:3000/favorite/${id}`).then(function(res){
          if(res.data){
            if(res.data.favorite ==true){
              $scope.favtrue = true;
            }else{
              $scope.favtrue = false;
            }
            $scope.message = res.data;
            console.log($scope.message);
          }
        }).catch((err)=>{
          console.log(err);
        })
      }
      $scope.sendmessage = function(event){
        var id = event.target.id;
        $http.post(`http://localhost:3000/reply/${id}`,{
          reply:$scope.newreply
        }).then(function(res){
          if(res.data){
            if(res.data.favorite ==true){
              $scope.favtrue = true;
            }else{
              $scope.favtrue = false;
            }
            $scope.message = res.data;
            //console.log($scope.message);
          }
        }).catch((err)=>{
          console.log(err);
        })
      }
});

app.controller("msgController", function($http,$scope,authService) {
  authService.isLoggedIn();
  $scope.$emit("login", {});
  $http.get(`http://localhost:3000/messages/${sessionStorage.user}`).then(function(res){
      console.log(res.data);
      $scope.messages = res.data;
  }).catch(function(err){
      console.log(err);
  });
});
app.controller("indexController", function($scope, $rootScope) {
  $scope.login = true;
  $scope.$on("login", function() {
    $scope.login = false;
  });
  $scope.$on("logout", function() {
    $scope.login = true;
  });
});

app.controller("logoutController", function($scope, $rootScope) {
  localStorage.isLoggedIn = false;
  $scope.$emit("logout", {});
  alert("logged out successfully");
});
app.controller("loginController", function(
  $scope,
  $http,
  $location,
  $rootScope
) {
  sessionStorage.loggedin = false;
  sessionStorage.user = undefined;
  $scope.$emit("logout", {});
  $scope.login = function() {
    $http
      .post("http://localhost:3000/login", {
        loginform: $scope.loginform
      })
      .then(function(res) {
        if (res) {
          //  console.log(res)
          $location.url("/profile");
          $rootScope.user = res.data.username;
          sessionStorage.loggedin = true;;
          sessionStorage.user = res.data.username;
        } else {
          alert("incorrect username and password");
        }
      })
      .catch(() => {
        console.log("login request failed");
      });
  };
});

app.controller("profileController", function(
  $scope,
  $http,
  $location,
  $rootScope,
  authService
) {
  authService.isLoggedIn();
  $scope.$emit("login", {});
  if (sessionStorage.user) {
    var url = "http://localhost:3000/users/" + sessionStorage.user;
    $http.get(url).then(function(res) {
      $scope.updateform = res.data;
    }); 
  }
  $scope.update = function() {
    console.log("update method called");
    $http
      .post("http://localhost:3000/update", {
        username: $scope.updateform.username,
        password: $scope.updateform.password,
        firstname: $scope.updateform.firstname,
        lastname: $scope.updateform.lastname,
        email: $scope.updateform.email,
        phone: $scope.updateform.phone,
        location: $scope.updateform.location
      })
      .then(function(res) {
        if (res) {
          $scope.updateform = res.data;
          //alert("updated succesfully");
          $location.url("/messages");
        } else {
          alert("failed !!");
        }
      })
      .catch(() => {
        console.log(" request failed");
      });
  };
});
app.controller("registerController", function(
  $scope,
  $http,
  $location,
  $rootScope
) {
  $scope.$emit("logout", {});
  $scope.login = true;
  $scope.register = function() {
    $http
      .post("http://localhost:3000/register", {
        registerform: $scope.registerform
      })
      .then(function(res) {
        if (res.data == true) {
          $location.url("/login");
        } else {
          alert("registration failed");
        }
      })
      .error(() => {
        console.log("reg request failed");
      });
  };
});


