angular.module('starter.controllers', [])

.controller('LotsCtrl', function($scope, $state, $stateParams, $http, $rootScope) {
  console.log('dash opened');
  $rootScope.capacity = {"Beach House Lot": 250, "Structure 1": 350, "Structure 2": 700, "Structure 3": 500, "Structure 4": 700, "Structure 5": 650, "Structure 6": 700, "Structure 9": 300, "Lot 8 North": 200, "Lot 3 North": 450, "Lot 1 North": 1100, "Pier Deck": 250, "Lot 4 South": 700, "Lot 5 South": 800, "Civic Center": 700, "Library": 500, "Structure 7": 800, "Structure 8": 1000}
  $http({
    method: 'GET',
    url: 'https://parking.api.smgov.net/lots',
    headers: {"Accept" : "application/json"}
  }).success(function(res){
    console.log('res', res);
    $scope.lots = res;
    $scope.capacity = $rootScope.capacity
    console.log('lots are', $scope.lots);
    console.log("capacities are", $rootScope.capacity);
    $rootScope.lots = res;
  }).error(function(err){
    console.log(err);
    })
})

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $ionicPlatform, $ionicLoading, $rootScope) {
  lots = $rootScope.lots
  ionic.Platform.ready(function(){
    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/> Getting loctaion!'
    });
    var posOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
      var lat = 34.019079;
      var long = -118.498345;

      var myLatlng = new google.maps.LatLng(lat, long);

      var mapOptions = {
        center: myLatlng,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(document.getElementById("map"), mapOptions);
      var marker = [];
      var infoWindow = [];
      var content = [];
      for (var i=0; i < lots.length; i++){
        console.log('lot', lots[i]);
        marker[i] = new google.maps.Marker({
          map: map,
          animation: google.maps.Animation.DROP,
          position: new google.maps.LatLng(lots[i].latitude, lots[i].longitude),
          id: i
        });
        marker[i].index = i;
        content[i] = '<div class="popup_container" style="font-weight: bold;">' + lots[i].name + '</div></br><div class="popup_container">Spaces available: ' + lots[i].available_spaces + '</div>';

        infoWindow[i] = new google.maps.InfoWindow({
          content: content[i]
        });
        google.maps.event.addListener(marker[i], 'click', function(){
          console.log('marker clicked');
          infoWindow[this.index].open(map, marker[this.index]);
        });
        console.log('markers', marker);
      }
      $scope.map = map;
      $ionicLoading.hide();
  })



  $scope.nav = function(lotId){
    console.log('nav called');
    $state.go("tab.data", {id:lotId})
  }
})
.controller('LotCtrl', function($scope, $stateParams, $rootScope, $cordovaGeolocation, $cordovaLaunchNavigator) {
  console.log('LotCtrl accessed');
  console.log($rootScope.lots);
  $scope.lot = $rootScope.lots[$stateParams.lotId];
  var myLatLng = new google.maps.LatLng($scope.lot.latitude, $scope.lot.longitude);
  var mapOptions = {
    center: myLatLng,
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById("smallmap"), mapOptions);
  console.log('created map', map);

  $scope.map = map;

  google.maps.event.addListenerOnce($scope.map, "idle", function(){
    var marker = new google.maps.Marker({
      map: $scope.map,
      animation: google.maps.Animation.DROP,
      position: myLatLng
    });
    var infoWindow = new google.maps.InfoWindow({
      content: $scope.lot.name
    });
    google.maps.event.addListener(marker, 'click', function(){
      infoWindow.open($scope.map, marker);
    });
  })
$scope.startNavigation = function(){
  var options = {enableHighAccuracy: true};
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    console.log(position);
    var destination = [$scope.lot.latitude, $scope.lot.longitude];
    var start = [position.latitude, position.longitude];
    $cordovaLaunchNavigator.navigate(destination, start).then(function(){
      console.log('navigator launched');
    }, function(err){
      console.log(err);
    });
  });


// launchnavigator.navigate([$scope.lot.latitude, $scope.lot.longitude], {
//   start: currentLocation.latitude, currentLocation.longitude
// });
}

});
