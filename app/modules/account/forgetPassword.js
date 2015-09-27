angular.module('account')
    .controller('forgetPasswordCtrl', ['$scope', '$http', '$location', 'remoteFactory', 'dialogHelper',
        function($scope, $http, $location, remoteFactory, dialogHelper) {
            $scope.forgetPassword = function() {
                dialogHelper.loadDialog('Warning', 'OK', 'Cancle', 'Your new password is sent to the address: ' + $scope.email + '. Click OK to return Sign In page!', function() {
                    $location.path('/login');
                });

                $scope.email = '';
            }
        }
    ])

.config(function($routeProvider) {
    $routeProvider
        .when('/forget_password', {
            templateUrl: 'modules/account/template/forget_password.html',
            controller: 'forgetPasswordCtrl'
        })
});