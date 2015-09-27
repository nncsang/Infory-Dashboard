angular.module('user')
    .controller('UserNotifyStep3Ctrl', ['$scope', '$routeParams', '$location', 'remoteFactory', 'dataFactory', 'userNotifyFactory', 'filterHelper', 'userRemote', 'serviceHelper',
        function($scope, $routeParams, $location, remoteFactory, dataFactory, userNotifyFactory, filterHelper, userRemote, serviceHelper) {

            /** Global variables **/
            var brandId = $routeParams.brandId,
                intervalDate = serviceHelper.getIntervalDate();

            /** Scope variables **/
            dataFactory.updateBrandSideBar(brandId);
            dataFactory.getBrand(brandId, function(data) {
                $scope.brand = data;
            }, function() {});

            /** Logic **/
            $scope.data = {
                dateDropDownInput: intervalDate.date_beg,
                dateDisplay: serviceHelper.normalizeTime(intervalDate.date_beg),
            };

            $scope.colorpicker = {
                red: 50,
                options: {
                    orientation: 'horizontal',
                    min: 0,
                    max: 255,
                    range: 'min'
                }
            };

            $scope.goToStep4 = function() {
                saveInfor();
                if ($scope.sendMethod.name == 'once') {
                    if ($scope.numOfSelectedUsers * 10 > $scope.balance) {
                        dialogHelper.showError('Số dư tài khoản của bạn là ' + $scope.balance + ' T-Coin không đủ thực hiện thao tác này');
                        return;
                    } else
                        $location.path('/user/notify-new/step4/' + brandId);
                }
                $location.path('/user/notify-new/step4/' + brandId);
            }
            $scope.goToStep2 = function() {
                saveInfor();
                $location.path('/user/notify-new/step2/' + brandId);
            }

            var step2Data = userNotifyFactory.getData(1, brandId);
            if (step2Data == null) {
                $scope.goToStep2();
                return;
            } else {
                $scope.sendMethod = step2Data.sendMethod;
                $scope.balance = step2Data.balance;
                $scope.numOfSelectedUsers = step2Data.numOfSelectedUsers;

                if (step2Data.data != undefined && step2Data.data != null) {
                    $scope.data = step2Data.data;
                }
            }

            $scope.colorpicker.options.max = $scope.balance;

            switch ($scope.sendMethod.name) {
                case 'once':
                    $scope.colorpicker.red = $scope.numOfSelectedUsers * 10;
                    break;
                case 'auto':
                    $scope.colorpicker.red = 10;
                    break;
            }


            function saveInfor() {
                userNotifyFactory.setData(2, {
                    brand_id: brandId,
                    data: $scope.data,
                    sendMethod: $scope.sendMethod,
                    balance: $scope.balance,
                    numOfSelectedUsers: $scope.numOfSelectedUsers,
                    total_bugdet: $scope.colorpicker.red
                });
            }

            $scope.onTimeSet = function(newDate, oldDate) {
                $scope.data.dateDisplay = serviceHelper.normalizeTimeWithMinute(newDate);
            }


        }
    ])