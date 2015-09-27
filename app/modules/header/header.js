angular.module('header')

.controller('HeaderCtrl', ['$scope', '$location', '$routeParams', 'dataFactory', 'Auth', 'brandRemote', 'dialogHelper', 'cookie',

    function($scope, $location, $routeParams, dataFactory, Auth, brandRemote, dialogHelper, cookie) {

        $scope.brandId = $routeParams.brandId;
        $scope.isVisibleBrandMenu = true;
        $scope.menuDisplayStr = 'display: none !important;';

        if ($location.path().substring(0, 9) == '/personal') {
            $scope.isVisibleBrandMenu = false;
            $scope.menuDisplayStr = 'display: block;';
        }

        $scope._username = Auth.user.name;

        $scope.updateBrand = function(brand) {
            $scope.brand = brand;
            if (brand != null) {
                $scope.brandId = brand.id;

                if ($scope.brands != undefined) {
                    for (var i = 0; i < $scope.brands.length; i++) {
                        if ($scope.brands[i].id == brand.id) {
                            $scope.brands[i] = brand;
                            return;
                        }
                    }
                }
            }
        }

        $scope.updateBrands = function(brands) {
            $scope.brands = brands;
        }

        $scope.updateAccountName = function(name) {
            $scope._username = name;
            cookie.setCookie('name', name, 7);
        }

        $scope.setCurrentBrand = function(brand) {
            $scope.brand = brand;
            $('.z-btn .pop-dialog .close-icon').click();
            $location.path('/home/' + $scope.brand.id);
        }

        $scope.createBrand = function(name) {
            if (name.length == '')
                return;

            brandRemote.create({
                name: name
            }, function(data) {
                if (data.error == undefined) {
                    $scope.brands.push({
                        id: data.brand_id,
                        name: name
                    });
                    dataFactory.setCurrentBrand(null);
                    $('.z-btn .pop-dialog .close-icon').click();
                    $location.path('/brand/infor/' + data.brand_id);
                } else
                    dialogHelper.showError(data.error.message);
            }, function() {});
        }

        dataFactory.setUpdateBrandHeaderFunc($scope.updateBrand);
        dataFactory.setUpdateBrandsHeaderFunc($scope.updateBrands);
        dataFactory.setUpdateAccountNameHeaderFunc($scope.updateAccountName);
    }
])