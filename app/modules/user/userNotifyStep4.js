angular.module('user')
    .controller('UserNotifyStep4Ctrl', ['$scope', '$routeParams', '$location', 'remoteFactory', 'dataFactory', 'userNotifyFactory', 'filterHelper', 'userRemote', 'messageRemote', 'dialogHelper', 'serviceHelper', 'queryHelper',
        function($scope, $routeParams, $location, remoteFactory, dataFactory, userNotifyFactory, filterHelper, userRemote, messageRemote, dialogHelper, serviceHelper, queryHelper) {
            /** Global variables **/
            var brandId = $routeParams.brandId,
                step1Data = userNotifyFactory.getData(0, brandId),
                step2Data = userNotifyFactory.getData(1, brandId),
                step3Data = userNotifyFactory.getData(2, brandId),
                mode = userNotifyFactory.getMode();

            /** Scope variables **/
            $scope.messageList = [];
            $scope.hideLoading = false;

            $scope.totalItems = 0;
            $scope.dataInCurrentPage = [];
            $scope.filteredUsers = [];
            $scope.itemsPerPage = 10;
            $scope.boundaryLinks = false;
            $scope.maxSize = 10;
            $scope.currentPage = 1;
            $scope.searchText = '';

            /** Logic **/
            $scope.pageChanged = function(page) {
                $scope.currentPage = page;
                $scope.dataInCurrentPage = $scope.messageList.slice((page - 1) * $scope.itemsPerPage, (page - 1) * $scope.itemsPerPage + $scope.itemsPerPage);
            }

            function resetPagination(array, page) {
                $scope.currentPage = page;
                $scope.totalItems = array.length;
                $scope.dataInCurrentPage = array.slice((page - 1) * $scope.itemsPerPage, (page - 1) * $scope.itemsPerPage + $scope.itemsPerPage);
            }

            dataFactory.updateBrandSideBar(brandId);
            dataFactory.getBrand(brandId, function(data) {
                $scope.brand = data;
            }, function() {});

            $scope.goToStep1 = function() {
                userNotifyFactory.setData(0, null);
                userNotifyFactory.setData(1, null);
                userNotifyFactory.setData(2, null);
                userNotifyFactory.setMode('create');
                $location.path('/user/notify-new/step1/' + brandId);
            }

            $scope.editMessage = function(message_id) {
                messageRemote.get({
                    message_id: message_id
                }, function(data) {
                    if (data.error == undefined) {
                        pushInfoToStep1(data);
                        pushInfoToStep2(data);

                        userNotifyFactory.setMode('update');
                        userNotifyFactory.setMessageId(message_id);
                    } else
                        dialogHelper.showError(data.error.message);
                }, function() {});
            }

            function pushInfoToStep1(data) {
                var notifyType = {};
                var oldData = {
                    brand_id: brandId,
                    isCanGo: true,
                    validation: [
                        [false, false],
                        [false, false, false],
                        [false],
                        [false]
                    ],
                    notifyType: null,
                    isOk: [true, true, true, true],
                    name: data.name,
                    sms_sender: null,
                    sms_content: data.content,
                    email_title: null,
                    email_content: data.content,
                    in_app_content: data.content
                };

                switch (data.type) {
                    case 'email':
                        oldData.notifyType = {
                            id: 1,
                            name: 'email',
                            name_display: 'Email'
                        };
                        oldData.email_title = data.title;

                        break;
                    case 'in-app':
                        oldData.notifyType = {
                            id: 2,
                            name: 'in-app',
                            name_display: 'Notification via infory mobile'
                        };
                        break;
                    case 'sms':
                        oldData.notifyType = {
                            id: 0,
                            name: 'sms',
                            name_display: 'SMS'

                        };
                        oldData.email_sender = data.sender;
                        break;
                }

                userNotifyFactory.setData(0, oldData);
            }

            function pushInfoToStep2(data) {
                var oldsubfilters = [];
                var filters = {
                    event: 'profile',
                    filter: JSON.stringify(data.target_user_filter)
                }

                var fields = {
                    filter: null,
                    fields: '["id", "name", "dob", "gender", "city", "last_visit", "phone", "age"]',
                    brand_id: brandId,
                    page: 0,
                    page_size: 10000
                };

                if (data.target_user_filter != null) {
                    data.target_user_filter.event = remoteFactory.meta_profile;
                    oldsubfilters = queryHelper.decode(filters);
                    fields.filter = JSON.stringify(data.target_user_filter);
                }

                userRemote.filter(fields, function(datax) {
                    if (datax.error == undefined) {
                        var userList = datax.data;
                        var isChecked = [];

                        for (var i = 0; i < userList.length; i++) {
                            if (data.target_users.indexOf(userList[i].id) == -1)
                                isChecked.push(false);
                            else
                                isChecked.push(true);
                        }

                        for (var i = 0; i < userList.length; i++) {

                            var user = userList[i];
                            if (user.phone == '' || user.phone == null)
                                user.phone = '-';

                            if (user.email == null)
                                user.email = " - ";

                            if (user.gender == null || user.gender == '')
                                user.gender = " - ";
                            else if (user.gender == 'male')
                                user.gender = 'Male';
                            else
                                user.gender = 'Female';

                            if (user.city == null)
                                user.city = " - ";


                            user.dob = user.age;

                            user.stt = i;
                        }

                        var date_begin = new Date(data.time_begin.split("-").join("/"));

                        var oldData = {
                            userList: userList,
                            all: false,
                            isChecked: isChecked,
                            numOfSelectedUsers: data.target_users.length,
                            oldsubfilters: oldsubfilters,
                            isCanGo: true,
                            sendMethod: {
                                name: data.send_method
                            },
                            brand_id: brandId,
                            data: {
                                dateDropDownInput: date_begin,
                                dateDisplay: serviceHelper.normalizeTime(date_begin)
                            },
                            currentPage: 1
                        }

                        userNotifyFactory.setData(1, oldData);

                        pushInfoToStep3(data);
                        $location.path('/user/notify-new/step1/' + brandId);
                    } else {
                        dialogHelper.showError(data.error.message);
                    }

                }, function() {});
            }

            function pushInfoToStep3(data) {

            }

            $scope.goToStep3 = function() {
                $location.path('/user/notify-new/step3/' + brandId);
            }

            for (var i = 0; i < 3; i++)
                userNotifyFactory.setData(i, {
                    brand_id: -1
                });


            if (step1Data == null || (step3Data == null && step2Data == null) || (step3Data == null && step2Data != null && step2Data.sendMethod.name == 'auto')) {
                listNotification();
                return;
            }

            var fields = {
                brand_id: brandId,
                name: step1Data.name,
                type: step1Data.notifyType.name,
                send_method: step2Data.sendMethod.name,
                target_user_filter: step2Data.filter
            }

            if (step3Data != null)
                fields.time_begin = step3Data.data.dateDisplay;
            else
                fields.time_begin = serviceHelper.normalizeTime(new Date());

            switch (step1Data.notifyType.name) {
                case 'sms':
                    fields.content = step1Data.sms_content;
                    break;
                case 'email':
                    fields.content = step1Data.email_content;
                    fields.sender = step1Data.email_sender;
                    fields.title = step1Data.email_title;
                    break;
                case 'in-app':
                    fields.content = step1Data.in_app_content;
                    break;
            }

            if (fields.send_method == 'once') {
                var checkList = step2Data.isChecked;
                var userList = step2Data.userList;
                var target_users = [];

                for (var i = 0; i < checkList.length; i++)
                    if (checkList[i] == true)
                        target_users.push(userList[i].id);

                fields.target_users = JSON.stringify(target_users);
            }

            switch (mode) {
                case 'create':
                    fields.total_bugdet = step3Data.total_bugdet;
                    messageRemote.create(fields, function(data) {
                        if (data.error == undefined) {
                            listNotification();
                            dialogHelper.showError('Create successful');
                        } else
                            dialogHelper.showError('Have error: ' + data.error.message);
                    }, function() {})
                    break;
                case 'update':
                    fields.message_id = userNotifyFactory.getMessageId();
                    messageRemote.update(fields, function(data) {
                        if (data.error == undefined) {
                            listNotification();
                            dialogHelper.showError('Updated');
                        } else
                            dialogHelper.showError('Have error: ' + data.error.message);
                    }, function() {})
                    break;
            }

            function listNotification() {

                $scope.statusTypes = [{
                    name: '',
                    name_display: 'Status'
                }, {
                    name: 'running',
                    name_display: 'Running'
                }, {
                    name: 'stopped',
                    name_display: 'Stop'
                }, {
                    name: 'waiting',
                    name_display: 'Waiting'
                }];

                var properties = {
                    brand_id: brandId,
                    fields: '["id", "name", "type", "send_method", "time_begin", "status", "targets_count", "receivers_count"]'
                }

                $scope.sortNotificationListByStatus = function() {
                    var status = $scope.statusType.name;

                    if ($scope.statusType.name == '')
                        $scope.messageList = $scope.messageListFull;
                    else
                        $scope.messageList = [];

                    for (var i = 0; i < $scope.messageListFull.length; i++) {
                        if ($scope.messageListFull[i].status == status)
                            $scope.messageList.push($scope.messageListFull[i]);
                    }

                    resetPagination($scope.messageList, 1);
                }

                $scope.changeStatus = function(id) {
                    var status = $scope.messageListFull[id].status;
                    var nextStatus = '';
                    switch (status) {
                        case 'running':
                            $scope.messageListFull[id].statusClass = 'btn-flat inverse';
                            $scope.messageListFull[id].status = 'stopped';
                            $scope.messageListFull[id].statusName = 'Shopped';
                            nextStatus = 'stopped';
                            break;
                        case 'waiting':
                            return;
                        case 'stopped':
                            $scope.messageListFull[id].statusClass = 'btn-flat success';
                            $scope.messageListFull[id].status = 'running';
                            $scope.messageListFull[id].statusName = 'Running';
                            nextStatus = 'running';
                            break;
                    }

                    messageRemote.update({
                        message_id: $scope.messageListFull[id].id,
                        status: nextStatus
                    }, function(data) {
                        if (data.error == undefined) {

                        } else {
                            dialogHelper.showError(data.error.message);
                            $scope.messageListFull[id].status = status;
                            if ($scope.messageListFull[id].status == 'running') {
                                $scope.messageListFull[id].statusClass = 'btn-flat success';
                                $scope.messageListFull[id].statusName = 'Running';
                            } else {
                                $scope.messageListFull[id].statusClass = 'btn-flat inverse';
                                $scope.messageListFull[id].statusName = 'Stop';
                            }
                        }
                    }, function() {});
                }

                $scope.hideLoading = false;
                messageRemote.list(properties, function(data) {
                    if (data.error == undefined) {
                        $scope.hideLoading = true;
                        $scope.messageListFull = data;
                        for (var i = 0; i < $scope.messageListFull.length; i++) {
                            if ($scope.messageListFull[i].receivers_count != null && $scope.messageListFull[i].receivers_count != undefined) {
                                $scope.messageListFull[i].sentAmount = $scope.messageListFull[i].receivers_count + '/' + $scope.messageListFull[i].targets_count;
                            } else
                                $scope.messageListFull[i].sentAmount = '---';

                            if (i % 2 == 0)
                                $scope.messageListFull[i].sttClass = 'even';
                            else
                                $scope.messageListFull[i].sttClass = 'odd';

                            $scope.messageListFull[i].index = i;

                            switch ($scope.messageListFull[i].status) {
                                case 'running':
                                    $scope.messageListFull[i].statusClass = 'btn-flat success';
                                    $scope.messageListFull[i].statusName = 'Running';
                                    break;
                                case 'stopped':
                                    $scope.messageListFull[i].statusClass = 'btn-flat gray';
                                    $scope.messageListFull[i].statusName = 'Stop';
                                    break;
                                case 'finished':
                                    $scope.messageListFull[i].statusClass = 'btn-flat gray';
                                    $scope.messageListFull[i].statusName = 'Finished';
                                    break;
                            }

                            switch ($scope.messageListFull[i].send_method) {
                                case 'once':
                                    $scope.messageListFull[i].methodName = 'Once time';
                                    break;
                                case 'auto':
                                    $scope.messageListFull[i].methodName = 'Automatic';
                                    break;
                            }

                            switch ($scope.messageListFull[i].type) {
                                case 'sms':
                                    $scope.messageListFull[i].typeName = 'SMS';
                                    break;
                                case 'email':
                                    $scope.messageListFull[i].typeName = 'Email';
                                    break;
                                case 'in-app':
                                    $scope.messageListFull[i].typeName = 'Notification via infory mobile';
                                    break;
                            }

                            $scope.messageList = $scope.messageListFull;
                            resetPagination($scope.messageList, 1);
                        }
                    } else
                        dialogHelper.showError(data.error.message);
                }, function() {});
            }
        }
    ])