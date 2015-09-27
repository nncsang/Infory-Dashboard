angular.module('account')
    .controller('AccountCtrl', ['$scope', '$http', '$location', '$routeParams', 'dataFactory', 'Auth', 'accountRemote', '$modal', 'remoteFactory', 'fileHelper', 'dialogHelper', 'cookie',
        function($scope, $http, $location, $routeParams, dataFactory, Auth, accountRemote, $modal, remoteFactory, fileHelper, dialogHelper, cookie) {
            /*modal*/

            /** Global variables **/
            var base_url = remoteFactory.getBaseUrl(),
                fileAvatar = null,
                orignalAccount = null;;

            /** Scope variables **/
            $scope.isChangePass = false;
            $scope._username = Auth.user.name;
            $scope.activeTab = "inbox";
            $scope.activeTab = "personal";
            $scope.showSuccessNotify = false;
            $scope.hideLoading = false;
            $scope.IsRightPass = true;
            /** Logic **/
            $scope.markPassChange = function() {
                $scope.isChangePass = true;
                if ($scope.account.password != $scope.account.confirmPassword)
                    $scope.IsRightPass = false;
                else
                    $scope.IsRightPass = true;
            }

            $scope.showBill = function() {
                var modalInstance = $modal.open({
                    templateUrl: 'modules/account/template/bill.html',
                    controller: $scope.ModalInstanceCtrl
                });
            };

            $scope.ModalInstanceCtrl = function($scope, $modalInstance) {
                $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                };
            };

            $scope.$watch('_username', function() {
                dataFactory.updateAccountNameHeader($scope._username);
            });

            $scope.cancel = function() {
                window.history.back();
            };

            $scope.changeAvatar = function($files) {
                fileHelper.readAsDataUrl($files[0], $scope)
                    .then(function(result) {
                        $scope.account.avatar = result;
                        $scope.account.currentPass = '';
                        fileAvatar = $files[0];
                        //$scope.account.avatar = 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-prn1/t1.0-9/s600x600/1904163_10202726642879107_1479781473_n.jpg';
                    });
            }

            $scope.update = function() {
                var fields = {
                    name: $scope.account.name,
                    email: $scope.account.email,
                    company: $scope.account.company,
                    current_password: $scope.account.currentPass
                };

                if ($scope.isChangePass) {
                    fields.password = $scope.account.password;
                }

                if (fileAvatar != null) {
                    var fd = new FormData();
                    fd.append('name', $scope.account.name);
                    fd.append('avatar', fileAvatar);
                    fd.append('company', $scope.account.company);
                    fd.append('current_password', $scope.account.currentPass);

                    if ($scope.isChangePass)
                        fd.append('password', $scope.account.password);
                    fd.append('email', $scope.account.email);

                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', base_url + 'account/update' + remoteFactory.getTailUrl(), true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState == 4) {
                            var respone = JSON.parse(xhr.responseText);
                            if (respone.error == undefined) {
                                dialogHelper.showError('Đã cập nhật thay đổi');
                                $scope.$apply(function() {
                                    $scope.account.avatar = respone.avatar;
                                });
                                fileAvatar = null;
                                dataFactory.updateAccountNameHeader($scope.account.name);
                                cookie.setCookie('user', $scope.account.email, 7);
                                $scope.account.currentPass = '';
                            } else
                                dialogHelper.showError(respone.error.message);
                        }
                    }
                    xhr.send(fd);
                } else {
                    accountRemote.update(fields, function(data) {
                        if (data.error == undefined) {
                            dialogHelper.showError('Đã cập nhật thay đổi');
                            orignalAccount = $scope.account;
                            dataFactory.updateAccountNameHeader($scope.account.name);
                            cookie.setCookie('user', $scope.account.email, 7);
                            $scope.account.currentPass = '';
                        } else {
                            $scope.account = orignalAccount;
                            dialogHelper.showError(data.error.message);
                        }
                    }, function() {
                        $scope.account = orignalAccount;
                    })
                }
            }

            if ($location.path().substring(0, 9) == '/personal') {
                var fields = '["name"], ["avatar"], ["balance"], ["company"], ["email"]';
                $scope.hideLoading = false;
                accountRemote.get(fields, function(data) {
                    $scope.hideLoading = true;
                    $scope.account = data;
                    $scope.account.password = "123456";
                    $scope.account.confirmPassword = "123456";
                    $scope._username = data.name;
                    if ($scope.account.balance == null)
                        $scope.account.balance = 0;
                    orignalAccount = data;
                }, function() {});
            }
        }
    ])

.config(function($routeProvider) {
    var access = routingConfig.accessLevels;

    $routeProvider
        .when('/inbox', {
            templateUrl: 'modules/account/template/inbox.html',
            controller: 'AccountCtrl',
            access: access.user
        })
        .when('/money', {
            templateUrl: 'modules/account/template/money.html',
            controller: 'AccountCtrl',
            access: access.user
        })
        .when('/personal/:brandId', {
            templateUrl: 'modules/account/template/personal.html',
            controller: 'AccountCtrl',
            access: access.user
        })
});