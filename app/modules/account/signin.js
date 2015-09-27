angular.module('account')
    .controller('SignInCtrl', ['$scope', '$location', '$window', 'Auth', 'dataFactory',
        function($scope, $location, $window, Auth, dataFactory) {
            // $scope.user = Auth.user;
            // $scope.userRoles = Auth.userRoles;
            // $scope.accessLevels = Auth.accessLevels;
            // $scope.hideMessage = true;
            $scope.hideLoading = true;
            $scope.logout = function() {
                Auth.logout(function() {
                    $location.path('/login');
                }, function() {

                });
            };

            $scope.login = function() {
                $scope.hideLoading = false;
                $scope.hideMessage = true;
                Auth.login({
                        username: $scope.username,
                        password: $scope.password,
                        rememberme: $scope.rememberme
                    },
                    function(res) {
                        dataFactory.setCurrentBrands(null);
                        dataFactory.setCurrentBrand(null);
                        dataFactory.updateBrandsHeader(null);
                        dataFactory.updateBrandHeader(null);
                        $scope.hideLoading = true;
                        $scope.hideMessage = false;
                        $location.path('/');
                    },
                    function(err) {
                        $scope.message = err;
                        $scope.hideLoading = true;
                        $scope.hideMessage = false;
                    });
            };

            $scope.loginOauth = function(provider) {
                $window.location.href = '/auth/' + provider;
            };
        }
    ])
    .config(function($routeProvider) {
        var access = routingConfig.accessLevels;
        $routeProvider
            .when('/login', {
                templateUrl: 'modules/account/template/signin.html',
                controller: 'SignInCtrl',
                access: access.anon
            });
    });