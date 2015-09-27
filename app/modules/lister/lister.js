angular.module('lister')

.controller('ListerCtrl', ['$scope', '$http', '$location', '$routeParams', '$filter', 'remoteFactory', 'dataFactory', 'Auth', 'brandRemote', 'chartHelper', 'serviceHelper', 'eventRemote', 'compareHelper', 'homeFactory', 'dialogHelper', 'listerFactory',
    function($scope, $http, $location, $routeParams, $filter, remoteFactory, dataFactory, Auth, brandRemote, chartHelper, serviceHelper, eventRemote, compareHelper, homeFactory, dialogHelper, listerFactory) {
        $scope.hideLoading = false;
        $scope.brands = [];
        $scope.itemsPerPage = 10;
        $scope.maxSize = 10;
        $scope.entireData = [];
        $scope.entireDataSearch = [];

        var isSearching = false;

        var totalItemsNormal = 0;
        var totalItemsSearch = 0;

        var currentPage = 0;
        var currentPageSearch = 0;

        var fieldsForSearch = {
            fields: '["name", "id", "type_business", "owner_phone", "owner_address", "logo"]',
            page: 0
        }

        var oldData = listerFactory.getData();
        if (oldData == null) {
            brandRemote.getListInternal({
                fields: '["name", "id", "cover", "type_business", "website", "fanpage", "description", "id", "owner_phone", "owner_address", "logo"]',
                page: 0
            }, function(data) {
                if (data.error == undefined) {
                    $scope.brands = data.result;
                    $scope.totalItems = data.num_of_page * $scope.itemsPerPage;
                    totalItemsNormal = $scope.totalItems;

                    for (var i = 0; i < data.num_of_page; i++) {
                        $scope.entireData.push([]);
                    }

                    $scope.entireData[0] = data.result;

                    resetPagination(1);
                    $scope.hideLoading = true;
                } else {
                    dialogHelper.showError(data.error.message);
                }
            }, function() {});
        } else {
            $scope.entireData = oldData.entireData;
            $scope.brands = oldData.brands;
            $scope.currentPage = oldData.currentPage;
            $scope.hideLoading = true;

            isSearching = oldData.isSearching;
            entireDataSearch = oldData.entireDataSearch;
            currentPage = oldData.currentPage;
            currentPageSearch = oldData.currentPageSearch;

            totalItemsNormal = oldData.totalItemsNormal;
            totalItemsSearch = oldData.totalItemsSearch;

            $scope.entireDataSearch = oldData.entireDataSearch;
            $scope.currentPageSearch = oldData.currentPageSearch;
            $scope.searchText = oldData.searchStr;

            if (isSearching == false){
                $scope.totalItems = oldData.totalItemsNormal;
                $scope.currentPage = currentPage;
            }
            else{
                $scope.totalItems = oldData.totalItemsSearch;
                $scope.currentPage = currentPageSearch;
            }

            resetPagination($scope.currentPage);
        }

        function saveInfor() {
            listerFactory.setData({
                entireData: $scope.entireData,
                brands: $scope.brands,
                totalItems: $scope.totalItems,
                hideLoading: $scope.hideLoading,
                currentPage: $scope.currentPage,
                dataInCurrentPage: $scope.dataInCurrentPage,
                isSearching: isSearching,
                currentPageSearch: $scope.currentPageSearch,
                entireDataSearch: $scope.entireDataSearch,
                totalItemsSearch: totalItemsSearch,
                totalItemsNormal: totalItemsNormal,
                currentPage: currentPage,
                currentPageSearch: currentPageSearch,
                searchStr: $scope.searchText
            });
        }

        $scope.pageChanged = function(page) {
            if (isSearching == false){
                if ($scope.entireData[page - 1].length == 0) {
                    $scope.currentPage = page;
                    currentPage = page;

                    brandRemote.getListInternal({
                        fields: '["name", "id", "cover", "type_business", "website", "fanpage", "description", "id", "owner_phone", "owner_address", "logo"]',
                        page: page - 1
                    }, function(data) {
                        if (data.error == undefined) {
                            $scope.brands = data.result;
                            $scope.entireData[page - 1] = data.result;
                            resetPagination(page);
                        } else {
                            dialogHelper.showError(data.error.message);
                        }
                    }, function() {});
                } else {
                    $scope.brands = $scope.entireData[page - 1];
                    resetPagination(page);
                }
            }else{
                if ($scope.entireDataSearch[page - 1].length == 0) {
                    $scope.currentPage = page;
                    currentPageSearch = page;

                    fieldsForSearch.page = page - 1;
                    brandRemote.search(fieldsForSearch, function(data) {
                        if (data.error == undefined) {
                            $scope.brands = data.result;
                            $scope.entireDataSearch[page - 1] = data.result;
                            resetPagination(page);
                        } else {
                            dialogHelper.showError(data.error.message);
                        }
                    }, function() {});
                } else {
                    $scope.brands = $scope.entireDataSearch[page - 1];
                    resetPagination(page);
                }
            }
        };

        function resetPagination(page) {
            saveInfor();
            if (isSearching == false){
                $scope.currentPage = page;
                currentPage = page;
                $scope.dataInCurrentPage = $scope.entireData[page - 1];
            }else{
                $scope.currentPage = page;
                currentPageSearch = page;
                $scope.dataInCurrentPage = $scope.entireDataSearch[page - 1];
            }
        }

        $scope.moveToBrand = function(id) {
            $location.path('/brand/infor/' + id);
        }

        $scope.searchStrChange = function(searchStr) {
            if (searchStr == null || searchStr.length == 0){
                isSearching = false;
                $scope.totalItems = totalItemsNormal;
                $scope.currentPage = currentPage;
                resetPagination($scope.currentPage);
                return;
            }
        }
        $scope.search = function(searchStr) {
            if (searchStr == null || searchStr.length == 0){
                return;
            }

            var page = 1;
            isSearching = true;
            $scope.hideLoading = false;

            fieldsForSearch.keyword = searchStr;
            fieldsForSearch.page = 0;

            brandRemote.search(fieldsForSearch, function(data) {
                if (data.error == undefined) {
                    $scope.entireDataSearch = [];
                    $scope.currentPage = 1;
                    currentPageSearch = 1;
                    $scope.totalItems = data.num_of_page * $scope.itemsPerPage;
                    totalItemsSearch = $scope.totalItems;
                    $scope.hideLoading = true;
                    $scope.brands = data.result;
                    for (var i = 0; i < data.num_of_page; i++) {
                        $scope.entireDataSearch.push([]);
                    }
                    $scope.entireDataSearch[page - 1] = data.result;
                    resetPagination(page);
                } else {
                    dialogHelper.showError(data.error.message);
                }
            }, function() {});
        }
    }
])

.config(function($routeProvider) {
    var access = routingConfig.accessLevels;

    $routeProvider
        .when('/list', {
            templateUrl: 'modules/lister/template/lister.html',
            controller: 'ListerCtrl',
            access: access.admin
        })
});