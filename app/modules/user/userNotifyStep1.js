angular.module('user')
    .controller('UserNotifyStep1Ctrl', ['$scope', '$routeParams', '$location', 'remoteFactory', 'dataFactory', 'userNotifyFactory', 'filterHelper', 'userRemote',
        function($scope, $routeParams, $location, remoteFactory, dataFactory, userNotifyFactory, filterHelper, userRemote) {

            /** Global variables **/
            var brandId = $routeParams.brandId,
                oldData = userNotifyFactory.getData(0, brandId);

            /** Scope variables **/
            $scope.notifyTypes = [{
                id: 0,
                name: 'sms',
                name_display: 'SMS'

            }, {
                id: 1,
                name: 'email',
                name_display: 'Email'
            }, {
                id: 2,
                name: 'in-app',
                name_display: 'Notification via infory mobile'
            }];

            $scope.isCanGo = false;
            $scope.validation = [
                [false, true],
                [true, true, true],
                [true],
                [true]
            ];

            $scope.isOk = [false, false, false, false];
            $scope.name = '';

            /** Logic **/
            dataFactory.updateBrandSideBar(brandId);
            dataFactory.getBrand(brandId, function(data) {
                $scope.brand = data;
            }, function() {});

            if (oldData != null) {
                $scope.isCanGo = oldData.isCanGo;
                $scope.validation = oldData.validation;

                for (var i = 0; i < $scope.notifyTypes.length; i++)
                    if ($scope.notifyTypes[i].id == oldData.notifyType.id) {
                        $scope.notifyType = $scope.notifyTypes[i];
                        break;
                    }

                $scope.isOk = oldData.isOk;
                $scope.sms_sender = oldData.sms_sender;
                $scope.sms_content = oldData.sms_content;
                $scope.email_title = oldData.email_title;
                $scope.email_content = oldData.email_content;
                $scope.email_sender = oldData.email_sender;
                $scope.in_app_content = oldData.in_app_content;
                $scope.name = oldData.name;
            } else
                $scope.notifyType = $scope.notifyTypes[0];

            $scope.updateValidation = function(id, idChange) {
                switch (id) {
                    case 0:
                        switch (idChange) {
                            case 0:
                                $scope.validation[id][idChange] = checkString($scope.sms_sender);
                                break;
                            case 1:
                                $scope.validation[id][idChange] = checkString($scope.sms_content);
                                break;
                        }
                        break;
                    case 1:
                        switch (idChange) {
                            case 0:
                                $scope.validation[id][idChange] = checkString($scope.email_title);
                                break;
                            case 1:
                                $scope.validation[id][idChange] = checkString($scope.email_sender);
                                break;
                            case 2:
                                $scope.validation[id][idChange] = checkString($scope.email_content);
                                break;
                        }
                        break;
                    case 2:
                        $scope.validation[id][idChange] = checkString($scope.in_app_content);
                        break;
                    case 3:
                        $scope.validation[id][idChange] = checkString($scope.name);
                }

                $scope.isOk[id] = isOk(id);
                $scope.updateGoNext();

            }

            $scope.$watch('notifyType', function() {
                if ($scope.notifyType != null)
                    $scope.updateGoNext();
            });

            $scope.updateGoNext = function() {
                for (var i = 0; i < $scope.isOk.length; i++)
                    if ($scope.isOk[i] == true && $scope.notifyType.id == i && $scope.isOk[3] == true) {
                        $scope.isCanGo = true;
                        return;
                    }

                $scope.isCanGo = false;
            }

            function checkString(string) {
                if (string == undefined || string == '')
                    return true;
                else
                    return false;
            }

            function isOk(id) {
                for (var i = 0; i < $scope.validation[id].length; i++) {
                    if ($scope.validation[id][i] == true)
                        return false;
                }
                return true;
            }

            $scope.goToStep2 = function() {
                userNotifyFactory.setData(0, {
                    brand_id: brandId,
                    isCanGo: $scope.isCanGo,
                    isOk: $scope.isOk,
                    validation: $scope.validation,
                    notifyType: $scope.notifyType,
                    sms_sender: $scope.sms_sender,
                    sms_content: $scope.sms_content,
                    email_title: $scope.email_title,
                    email_content: $scope.email_content,
                    email_sender: $scope.email_sender,
                    in_app_content: $scope.in_app_content,
                    name: $scope.name
                });
                $location.path('/user/notify-new/step2/' + brandId);

            }
        }
    ])