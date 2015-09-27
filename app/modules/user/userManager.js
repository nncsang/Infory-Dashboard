angular.module('user')
    .controller('UserManagerCtrl', ['$scope', '$location', '$routeParams', '$window', '$filter', 'dataFactory', 'remoteFactory', 'filterHelper', 'userRemote', 'bookmarkRemote', 'userManagerFactory', 'dialogHelper',
        function($scope, $location, $routeParams, $window, $filter, dataFactory, remoteFactory, filterHelper, userRemote, bookmarkRemote, userManagerFactory, dialogHelper) {
            /** Global variables **/
            var brandId = $routeParams.brandId,
                oldData = userManagerFactory.getData(brandId);

            /** Scope variables **/
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
                $scope.checkList = [];
                $scope.checkAll = false;
                $scope.userList = [];
                $scope.hideLoading = false;
                $scope.subfilters = [];

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
                    $scope.saveInfor();
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

                if (oldData != null) {
                    $scope.hideLoading = true;
                    $scope.userList = oldData.userList;
                    $scope.checkList = oldData.checkList;
                    $scope.checkAll = oldData.checkAll;
                    $scope.oldsubfilters = oldData.oldsubfilters;

                    $scope.searchText = oldData.searchText;

                    if ($scope.searchText == '' || $scope.searchText == undefined || $scope.searchText == null)
                        resetPagination($scope.userList, oldData.currentPage);
                    else {
                        $scope.filteredUsers = oldData.filteredUsers;
                        resetPagination($scope.filteredUsers, oldData.currentPage);
                    }

                } else {
                    $scope.oldsubfilters = [];
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
                                $scope.saveInfor();
                            }
                        } else
                            dialogHelper.showError(data.error.message);
                    }, function() {});
                }

                $scope.checkAllUser = function() {
                    var isChecked = $scope.checkAll;
                    for (var i = 0; i < $scope.checkList.length; i++)
                        $scope.checkList[i] = isChecked;
                }

                $scope.saveInfor = function() {
                    var saveSubfilters = [];
                    var size = $scope.subfilters.length;

                    for (var i = 0; i < size; i++) {
                        saveSubfilters.push($scope.subfilters[i].getValue());
                    }

                    userManagerFactory.setData({
                        brand_id: brandId,
                        checkList: $scope.checkList,
                        userList: $scope.userList,
                        checkAll: $scope.checkAll,
                        oldsubfilters: saveSubfilters,
                        searchText: $scope.searchText,
                        currentPage: $scope.currentPage,
                        filteredUsers: $scope.filteredUsers
                    })
                }

                $scope.bookmark = function() {
                    var query = buildQuery();
                    var fields = {
                        bookmark_name: 'user profile',
                        brand_id: brandId,
                        filter: query.filter
                    }

                    bookmarkRemote.profileCreate(fields, function(data) {
                        if (data.error == undefined)
                            dialogHelper.showError('Saving successfully');
                        else
                            dialogHelper.showError(data.error.message);
                    }, function() {});
                }

                function buildQuery() {
                    var query = filterHelper.buildQuery($scope.subfilters);

                    var fields = {
                        filter: JSON.stringify(query),
                        fields: '["id", "name", "dob", "gender", "city", "last_visit", "phone", "age"]',
                        brand_id: brandId,
                        page: 0,
                        page_size: 10000
                    };
                    return fields;
                }

                $scope.showUserProfile = function(userId, name) {
                    $scope.saveInfor();
                    dataFactory.setUsernameAvatar(name, null);
                    dataFactory.setUrl($location.path());
                    $location.path('/user/' + brandId + '/' + userId);
                }

                function normalizeUser() {
                    for (var i = 0; i < $scope.userList.length; i++) {

                        var user = $scope.userList[i];
                        if (user.phone == '' || user.phone == null)
                            user.phone = '-';

                        if (user.email == null)
                            user.email = " - ";

                        if (user.gender == "")
                            user.gender = " - ";
                        else if (user.gender == 'male' || user.gender == 'Male')
                            user.gender = 'Male';
                        else
                            user.gender = 'Female';

                        if (user.city == null)
                            user.city = " - ";

                        if (user.dob != null && user.dob != '')
                            user.dob = new Date().getFullYear() - new Date(user.dob.split("-").join("/")).getFullYear();
                        else
                            user.dob = " - ";

                        user.dob = user.age;
                        user.stt = i;
                        $scope.checkList.push(false);
                    }

                    resetPagination($scope.userList, 1);
                }

                $scope.getResult = function() {
                    $scope.hideLoading = false;
                    $scope.searchText = '';

                    userRemote.filter(buildQuery(), function(data) {
                        $scope.checkList = [];
                        $scope.hideLoading = true;
                        if (data.error == undefined) {
                            $scope.userList = data.data;
                            normalizeUser();
                            $scope.saveInfor();
                        } else
                            dialogHelper.showError(data.error.message);

                    }, function() {});
                }
            }

        }
    ])
