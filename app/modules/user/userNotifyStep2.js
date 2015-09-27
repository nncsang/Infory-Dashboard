angular.module('user')
    .controller('UserNotifyStep2Ctrl', ['$scope', '$routeParams', '$location', '$filter', 'remoteFactory', 'dataFactory', 'userNotifyFactory', 'filterHelper', 'userRemote', 'serviceHelper', 'bookmarkRemote', 'queryHelper', 'dialogHelper', 'accountRemote', 'userRemote',
        function($scope, $routeParams, $location, $filter, remoteFactory, dataFactory, userNotifyFactory, filterHelper, userRemote, serviceHelper, bookmarkRemote, queryHelper, dialogHelper, accountRemote, userRemote) {

            /** Global variables **/
            var brandId = $routeParams.brandId,
                fields = '["balance"]',
                step1Data = userNotifyFactory.getData(0, brandId),
                oldData = userNotifyFactory.getData(1, brandId);

            /** Scope variables **/
            $scope.hideLoading = true;
            $scope.isVisibleFilter = false;
            dataFactory.getMetaData(brandId, function(data) {
                $scope.metas = data.meta_property_types;
                $scope.event = data.meta_profile;
                $scope.events = data.meta_events;
                $scope.metadata = data.meta_lists;
                $scope.isVisibleFilter = true;
                run();
            }, function() {});

            function run() {

                $scope.subfilters = [];
                $scope.all = false;
                $scope.numOfSelectedUsers = 0;
                $scope.isChecked = [];
                $scope.oldsubfilters = [];
                $scope.isCanGo = true;
                $scope.balance = null;
                $scope.userList = [];
                $scope.isChecked = [];
                $scope.sendMethods = [{
                    name: 'once',
                    name_display: 'Once'
                }, {
                    name: 'auto',
                    name_display: 'Automatic'
                }];
                $scope.sendMethod = $scope.sendMethods[0];

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
                    if ($scope.searchText == '' || $scope.searchText == undefined || $scope.searchText == null)
                        $scope.dataInCurrentPage = $scope.userList.slice((page - 1) * $scope.itemsPerPage, (page - 1) * $scope.itemsPerPage + $scope.itemsPerPage);
                    else
                        $scope.dataInCurrentPage = $scope.filteredUsers.slice((page - 1) * $scope.itemsPerPage, (page - 1) * $scope.itemsPerPage + $scope.itemsPerPage);
                    saveInfor();
                };

                function resetPagination(array, page) {
                    $scope.currentPage = page;
                    $scope.totalItems = array.length;
                    $scope.dataInCurrentPage = array.slice((page - 1) * $scope.itemsPerPage, (page - 1) * $scope.itemsPerPage + $scope.itemsPerPage);
                }

                $scope.filterUser = function() {
                    if ($scope.searchText != '') {
                        $scope.filteredUsers = $filter('filter')($scope.userList, $scope.searchText);
                        resetPagination($scope.filteredUsers, 1);
                    } else {
                        resetPagination($scope.userList, 1);
                    }
                }

                dataFactory.updateBrandSideBar(brandId);

                dataFactory.getBrand(brandId, function(data) {
                    $scope.brand = data;
                }, function() {});

                accountRemote.get(fields, function(data) {
                    if (data.balance == null)
                        $scope.balance = 0;
                    else
                        $scope.balance = data.balance;

                    orignalAccount = data;
                }, function() {});

                $scope.goToStep3 = function() {
                    saveInfor();
                    // if ($scope.sendMethod.name == 'once') {
                    //     if ($scope.numOfSelectedUsers * 10 > $scope.balance) {
                    //         dialogHelper.showError('Số dư tài khoản của bạn là ' + $scope.balance + ' T-Coin không đủ thực hiện thao tác này');
                    //         return;
                    //     } else
                    //         $location.path('/user/notify-new/step4/' + brandId);

                    // } else
                    $location.path('/user/notify-new/step3/' + brandId);
                }

                $scope.goToStep1 = function() {
                    saveInfor();
                    $location.path('/user/notify-new/step1/' + brandId);
                }

                $scope.showUserProfile = function(userId, name) {
                    dataFactory.setUrl($location.path());
                    dataFactory.setUsernameAvatar(name, null);
                    $location.path('/user/' + brandId + '/' + userId);
                }

                if (step1Data == null) {
                    $scope.goToStep1();
                    return;
                }

                if (oldData != null) {
                    $scope.userList = oldData.userList;
                    $scope.all = oldData.all;
                    $scope.isChecked = oldData.isChecked;
                    $scope.numOfSelectedUsers = oldData.numOfSelectedUsers;
                    $scope.oldsubfilters = oldData.oldsubfilters;
                    $scope.isCanGo = oldData.isCanGo;

                    for (var i = 0; i < $scope.sendMethods.length; i++)
                        if ($scope.sendMethods[i].name == oldData.sendMethod.name) {
                            $scope.sendMethod = $scope.sendMethods[i];
                            break;
                        }

                    $scope.searchText = oldData.searchText;
                    if ($scope.searchText == undefined || $scope.searchText == null)
                        $scope.searchText = '';

                    if ($scope.searchText == '' || $scope.searchText == undefined || $scope.searchText == null)
                        resetPagination($scope.userList, oldData.currentPage);
                    else {
                        $scope.filteredUsers = oldData.filteredUsers;
                        resetPagination($scope.filteredUsers, oldData.currentPage);
                    }

                } else {

                    // dataFactory.getBookmarks(brandId, function(data) {
                    //         data.bookmarks.profiles_bookmarks.unshift({
                    //             bookmark_name: 'Chọn bộ lọc đã lưu',
                    //             id: -1
                    //         });

                    //         $scope.profileBookmarks = data.bookmarks.profiles_bookmarks;
                    //         $scope.profileBookmark = data.bookmarks.profiles_bookmarks[0];

                    //         saveInfor();

                    //     },
                    //     function() {});

                    if ($scope.userList.length == 0) {
                        $scope.hideLoading = false;
                        $scope.userList = [];
                        $scope.isChecked = [];

                        userRemote.filter({
                            brand_id: brandId,
                            filter: '',
                            fields: '["id", "name", "dob", "gender", "city", "last_visit", "phone", "age"]',
                            brand_id: brandId,
                            page: 0,
                            page_size: 10000
                        }, function(data) {
                            if (data.error == undefined) {
                                $scope.hideLoading = true;
                                if ($scope.userList.length == 0) {
                                    $scope.userList = data.data;
                                    normalizeUser();
                                    saveInfor();
                                }
                            } else
                                dialogHelper.showError(data.error.message);
                        }, function() {});
                    }
                }


                function normalizeUser() {

                    for (var i = 0; i < $scope.userList.length; i++) {

                        var user = $scope.userList[i];
                        if (user.phone == '' || user.phone == null)
                            user.phone = '-';

                        if (user.email == null)
                            user.email = " - ";

                        if (user.gender == null)
                            user.gender = " - ";
                        else if (user.gender == 'male' || user.gender == 'Male')
                            user.gender = 'Male';
                        else
                            user.gender = 'Female';

                        if (user.city == null)
                            user.city = " - ";


                        user.dob = user.age;

                        user.stt = i;
                        $scope.isChecked.push(false);
                    }

                    resetPagination($scope.userList, 1);
                }

                $scope.updateIsCanGo = function() {
                    if ($scope.sendMethod.name == "once" && $scope.numOfSelectedUsers == 0)
                        $scope.isCanGo = false;
                    else
                        $scope.isCanGo = true;
                }

                $scope.updateIsCanGo();

                function saveInfor() {
                    var query = filterHelper.buildQuery($scope.subfilters);
                    var saveSubfilters = [];
                    var size = $scope.subfilters.length;

                    for (var i = 0; i < size; i++) {
                        saveSubfilters.push($scope.subfilters[i].getValue());
                    }

                    userNotifyFactory.setData(1, {
                        brand_id: brandId,
                        userList: $scope.userList,
                        oldsubfilters: saveSubfilters,
                        all: $scope.all,
                        numOfSelectedUsers: $scope.numOfSelectedUsers,
                        isChecked: $scope.isChecked,
                        profileBookmark: $scope.profileBookmark,
                        profileBookmarks: $scope.profileBookmarks,
                        sendMethod: $scope.sendMethod,
                        filter: JSON.stringify(query),
                        isCanGo: $scope.isCanGo,
                        searchText: $scope.searchText,
                        currentPage: $scope.currentPage,
                        filteredUsers: $scope.filteredUsers,
                        balance: $scope.balance
                    });
                }

                $scope.createProfile = function(name) {
                    if (name == '')
                        return;

                    var query = filterHelper.buildQuery($scope.subfilters);
                    var fields = {
                        filter: JSON.stringify(query),
                        brand_id: brandId,
                        bookmark_name: name
                    };

                    bookmarkRemote.profileCreate(fields, function(data) {
                        if (data.error == undefined) {
                            // var bookmark = {
                            //     bookmark_name: name,
                            //     id: data.bookmark_id,
                            //     brand_id: brandId,
                            //     event: fields.event,
                            //     filter: fields.filter,
                            //     compare_by: fields.compare_by,
                            //     time_unit: fields.time_unit
                            // }

                            // $scope.eventBookmarks.push(bookmark);
                            // $scope.changeEventBookmark(bookmark.id);

                            // dataFactory.setEventBookmarks(brandId, $scope.eventBookmarks);
                            // homeFactory.addEventBookmark(brandId, fields);
                            // saveInfor();
                        }

                    }, function() {});
                }

                $scope.changeProfileBookmark = function(id) {
                    for (var i = 0; i < $scope.profileBookmarks.length; i++) {
                        if ($scope.profileBookmarks[i].id == id) {

                            $scope.profileBookmark = $scope.profileBookmarks[i];
                            $scope.profileBookmark.event = $scope.event;
                            $scope.oldsubfilters = queryHelper.decode($scope.profileBookmark);

                            saveInfor();
                            return;
                        }
                    }
                }

                $scope.getResult = function() {
                    $scope.hideLoading = false;
                    $scope.all = false;
                    $scope.checkAll();
                    $scope.userList = [];
                    $scope.isChecked = [];
                    $scope.searchText = '';

                    var query = filterHelper.buildQuery($scope.subfilters);
                    var fields = {
                        filter: JSON.stringify(query),
                        fields: '["id", "name", "dob", "gender", "city", "last_visit", "phone", "age"]',
                        brand_id: brandId,
                        page: 0,
                        page_size: 10000
                    };

                    userRemote.filter(fields, function(data) {
                        $scope.hideLoading = true;
                        if (data.error == undefined) {
                            $scope.userList = data.data;
                            $scope.isChecked = [];

                            normalizeUser();

                            saveInfor();
                        } else
                            dialogHelper.showError(data.error.message);

                    }, function() {});
                }

                $scope.updateSelectedUsers = function(isChecked) {
                    if (isChecked)
                        $scope.numOfSelectedUsers++;
                    else
                        $scope.numOfSelectedUsers--;

                    saveInfor();
                }

                $scope.checkAll = function() {
                    var isChecked = $scope.all;

                    for (var i = 0; i < $scope.isChecked.length; i++)
                        $scope.isChecked[i] = isChecked;

                    if (isChecked)
                        $scope.numOfSelectedUsers = $scope.isChecked.length;
                    else
                        $scope.numOfSelectedUsers = 0;

                    saveInfor();
                }
            }
        }

    ])