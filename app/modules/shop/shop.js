angular.module('shop', ['google-maps'])

.controller('ShopCtrl', ['$scope', '$routeParams', 'remoteFactory', 'dataFactory', 'shopRemote', 'shopFactory', 'dialogHelper',

    function($scope, $routeParams, remoteFactory, dataFactory, shopRemote, shopFactory, dialogHelper) {

        /** Global variables **/
        var base_url = remoteFactory.getBaseUrl(),
            shopId = $routeParams.shopId,
            brandId = $routeParams.brandId,
            tempShop = dataFactory.getTempShop(),
            brand = dataFactory.getCurrentBrand(),
            fields = null;

        function updateShopAddress(){
            if ($scope.cities != null && $scope.cities != undefined && $scope.shop != undefined && $scope.shop != null){
                for (var i = 0; i < $scope.cities.length; i++)
                {
                    if ($scope.cities[i].name === $scope.shop.city_address)
                    {
                        $scope.cityAddress = i;
                    }
                }
            }
        }

        dataFactory.getMetaData(brandId, function(data) {
            $scope.cities = data.cities;
            updateShopAddress();
        }, function() {});


        //TODO: init 
        /** Scope variables **/
        $scope.hideLoadingInfor = false;
        $scope.hideLoadingImage = false;
        $scope.qrCode = '';
        $scope.usersGallery = [];

        $scope.brandId = $routeParams.brandId;
        $scope.shop = null;
        $scope.cityAddress = '';
        $scope.bundle = {
            shopName: '',
            shopCover: '',
            shopStreetAddress: '',
            shopDistrictAddress: '',
            shopCityAddress: '',
            shopPhone: '',
            editName: false,
            editStreetAddress: false,
            editDistrictAddress: false,
            editCityAddress: false,
            editPhone: false
        };

        angular.extend($scope, {
            map: {
                center: {
                    latitude: 10.758721, // default value, just for initial purpose
                    longitude: 106.691930
                },
                draggable: true,
                zoom: 16
            },
            marker: {
                coords: {
                    latitude: 10.758721, // default value, just for initial purpose
                    longitude: 106.691930
                },
                options: {
                    draggable: true
                },
                events: {
                    position_changed: function(marker, eventName, args) {
                        updateLatLng(marker.getPosition().lat(), marker.getPosition().lng())
                    }
                }
            }
        });

        /** Logic **/
        dataFactory.updateBrandSideBar($scope.brandId);

        shopRemote.getQRCode({
            shop_id: shopId
        }, function(data) {
            if (data.error == undefined) {
                $scope.$watch(function() {
                    $scope.qrCode = data.url;
                });
            } else
                dialogHelper.showError(data.error.message);
        }, function() {});


        if (tempShop != null)
            $scope.shop = tempShop;

        if (brand != null) {
            fields = '["name", "id", "phone", "cover", "street_address", "district_address", "city_address", "user_gallery", "lat", "lng"]';

            $scope.shop.brand_logo = brand.logo;
            $scope.shop.brand_website = brand.website;
            $scope.shop.brand_fanpage = brand.fanpage;
            $scope.shop.brand_description = brand.description;
            $scope.shop.brand_type_business = brand.type_business;
            $scope.shop.phone = brand.owner_phone;

            $scope.shop.brand_id = brand.id;
        } else {
            fields = '["name", "id", "cover", phone", "full_address", "cover", "brand_logo", "brand_website", "brand_fanpage", "brand_type_business", "brand_description", "street_address", "district_address", "city_address", "user_gallery", "lat", "lng"]';
        }

        dataFactory.getShop(shopId, fields, function(data) {
            $scope.hideLoadingInfor = false;
            if (data.error == undefined) {
                $scope.hideLoadingInfor = true;
                if (data.full_address != null)
                    $scope.shop = data;
                else {
                    $scope.shop.phone = data.phone;
                }

                if ($scope.shop.lat == -1 || $scope.shop.lng == -1 || $scope.shop.lat == undefined) {
                    $scope.shop.lat = 10.758721;
                    $scope.shop.lng = 106.691930;
                }

                $scope.bundle.shopName = data.name;
                $scope.bundle.shopPhone = data.phone;
                $scope.bundle.shopCover = data.cover;
                $scope.bundle.shopStreetAddress = data.street_address;
                $scope.bundle.shopDistrictAddress = data.district_address;
                $scope.bundle.shopCityAddress = data.city_address;
                $scope.marker.coords.latitude = $scope.shop.lat;
                $scope.marker.coords.longitude = $scope.shop.lng;
                $scope.map.center.latitude = $scope.shop.lat;
                $scope.map.center.longitude = $scope.shop.lng;
                updateShopAddress();
            } else
                dialogHelper.showError(data.error.message);

        }, function() {});

        $scope.changeName = function() {
            $scope.bundle.editName = !$scope.bundle.editName;
            if ($scope.bundle.shopName.length <= 0) {
                $scope.bundle.shopName = $scope.shop.name;
            } else {
                shopRemote.update({
                    name: $scope.bundle.shopName,
                    shop_id: shopId,
                }, function(data) {
                    if (data.error == undefined) {
                        $scope.shop.name = $scope.bundle.shopName;
                        dataFactory.setCurrentShop($scope.shop);
                        dataFactory.updateShopInBrand(shopId, $scope.brandId, $scope.shop);
                    } else {
                        dialogHelper.showError(data.error.message);
                        $scope.bundle.shopName = $scope.shop.name;
                    }
                }, function() {

                });
            }
        }


        $scope.changeStreetAddress = function() {
            $scope.bundle.editStreetAddress = !$scope.bundle.editStreetAddress;
            if ($scope.bundle.shopStreetAddress.length <= 0) {
                $scope.bundle.shopStreetAddress = $scope.shop.street_address;
            } else {
                shopRemote.update({
                    street_address: $scope.bundle.shopStreetAddress,
                    shop_id: shopId,
                }, function(data) {
                    if (data.error == undefined) {
                        $scope.shop.street_address = $scope.bundle.shopStreetAddress;
                        dataFactory.setCurrentShop($scope.shop);
                        makeFullAddress();
                        dataFactory.updateShopInBrand(shopId, $scope.brandId, $scope.shop);
                    } else {
                        dialogHelper.showError(data.error.message);
                        $scope.bundle.shopStreetAddress = $scope.shop.street_address;
                    }
                }, function() {

                });
            }
        }

        $scope.changeDistrictAddress = function(district) {
            $scope.bundle.shopDistrictAddress = district;
            $scope.bundle.editDistrictAddress = !$scope.bundle.editDistrictAddress;
            if ($scope.bundle.shopDistrictAddress.length <= 0) {
                $scope.bundle.shopDistrictAddress = $scope.shop.district_address;
            } else {
                shopRemote.update({
                    district_address: $scope.bundle.shopDistrictAddress,
                    shop_id: shopId,
                }, function(data) {
                    if (data.error == undefined) {
                        $scope.shop.district_address = $scope.bundle.shopDistrictAddress;
                        dataFactory.setCurrentShop($scope.shop);
                        makeFullAddress();
                        dataFactory.updateShopInBrand(shopId, $scope.brandId, $scope.shop);
                    } else {
                        dialogHelper.showError(data.error.message);
                        $scope.bundle.shopDistrictAddress = $scope.shop.district_address;
                    }
                }, function() {

                });
            }
        }

        $scope.changeCityAddress = function(name, id) {
            //console.log($scope.cities[id].districts);
            $('.z-dropdown').removeClass('open');           
            $scope.cityAddress = id;
            $scope.bundle.shopCityAddress = name;
            $scope.bundle.editCityAddress = !$scope.bundle.editCityAddress;
            if ($scope.bundle.shopCityAddress.length <= 0) {
                $scope.bundle.shopCityAddress = $scope.shop.city_address;
            } else {
                shopRemote.update({
                    city_address: $scope.bundle.shopCityAddress,
                    shop_id: shopId,
                }, function(data) {
                    if (data.error == undefined) {
                        $scope.shop.city_address = $scope.bundle.shopCityAddress;
                        dataFactory.setCurrentShop($scope.shop);
                        makeFullAddress();
                        dataFactory.updateShopInBrand(shopId, $scope.brandId, $scope.shop);
                    } else {
                        dialogHelper.showError(data.error.message);
                        $scope.bundle.shopCityAddress = $scope.shop.city_address;
                    }
                }, function() {

                });
            }
        }

        $scope.deleteUserImage = function(id) {
            dialogHelper.loadDialog('Warning', 'OK', 'Cancle', 'Your action is not restorable. Do you want to continue?', function() {
                shopRemote.removeUserImage({
                    shop_id: shopId,
                    image_id: id
                }, function(data) {
                    if (data.error == undefined) {
                        for (var i = $scope.usersGallery.length - 1; i >= 0; i--) {
                            if ($scope.usersGallery[i].id == id) {
                                $scope.usersGallery.splice(i, 1);
                                saveImageToFactory();
                                return;
                            }
                        }
                    } else
                        dialogHelper.showError(data.error.message);
                }, function() {});
            });
        }

        $scope.showUsersGallery = function() {
            var oldData = shopFactory.getData(shopId, brandId);
            if (oldData == null) {
                var fields = {
                    shop_id: shopId,
                    fields: '["user_gallery"]'
                };

                $scope.hideLoadingImage = false;

                shopRemote.get(fields, function(data) {
                    $scope.hideLoadingImage = true;
                    if (data.error == undefined) {
                        if (data.user_gallery == null)
                            $scope.usersGallery = [];
                        else {
                            data.user_gallery = data.user_gallery.reverse;
                            $scope.usersGallery = data.user_gallery;
                        }

                        saveImageToFactory();
                    } else
                        dialogHelper.showError(data.error.message);
                }, function() {});
            } else {
                $scope.usersGallery = oldData.usersGallery;
                $scope.hideLoadingImage = true;
            }

        }

        function saveImageToFactory() {
            shopFactory.setData({
                brand_id: brandId,
                shop_id: shopId,
                usersGallery: $scope.usersGallery
            })
        }

        $scope.changeCover = function($files) {
            var fd = new FormData();
            fd.append('cover', $files[0]);
            fd.append('shop_id', shopId);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', base_url + 'shop/update' + remoteFactory.getTailUrl(), true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var respone = JSON.parse(xhr.responseText);
                    if (respone.cover != undefined) {
                        $scope.$apply(function() {
                            $scope.shop.cover = respone.cover;
                        });

                        dataFactory.setCurrentShop($scope.shop);
                        dataFactory.updateShopInBrand(shopId, $scope.brandId, $scope.shop);
                        dialogHelper.showError('Đăng tải thành công. Hệ thống sẽ cập nhật trong giây lát');
                    } else
                        dialogHelper.showError(respone.error.message);
                }
            }
            xhr.send(fd);
        };

        $scope.uploadImage = function($files) {
            var fd = new FormData();
            fd.append('shop_id', shopId);
            fd.append('image', $files[0]);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', base_url + 'shop/add_image' + remoteFactory.getTailUrl(), true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var respone = JSON.parse(xhr.responseText);
                    if (respone.thumbnail_url != undefined) {
                        $scope.$apply(function() {
                            $scope.usersGallery.unshift({
                                url: respone.thumbnail_url,
                                id: respone.id
                            });

                            saveImageToFactory();
                            dialogHelper.showError('Đăng tải thành công. Hệ thống sẽ cập nhật trong giây lát');
                        });
                    } else
                        dialogHelper.showError(respone.error.message);
                }
            }
            xhr.send(fd);
        }

        $scope.changePhone = function() {
            $scope.bundle.editPhone = !$scope.bundle.editPhone;
            if ($scope.bundle.shopPhone.length <= 0) {
                $scope.bundle.shopPhone = $scope.shop.phone;
            } else {
                shopRemote.update({
                    tel: $scope.bundle.shopPhone,
                    shop_id: shopId,
                }, function(data) {
                    if (data.error == undefined) {
                        $scope.shop.phone = $scope.bundle.shopPhone;
                        dataFactory.setCurrentShop($scope.shop);
                        dataFactory.updateShopInBrand(shopId, $scope.brandId, $scope.shop);
                    } else {
                        dialogHelper.showError(data.error.message);
                        $scope.bundle.shopPhone = $scope.shop.phone;
                    }
                }, function() {

                });
            }
        }

        function makeFullAddress() {
            if ($scope.shop.street_address != '' && $scope.shop.street_address != null) {
                $scope.shop.full_address = $scope.shop.street_address;
                $scope.shop.full_address += ($scope.shop.district_address != null && $scope.shop.district_address != '') ? (', ' + $scope.shop.district_address) : '';
                $scope.shop.full_address += ($scope.shop.city_address != null && $scope.shop.city_address != '') ? (', ' + $scope.shop.city_address) : '';
            } else if ($scope.shop.district_address != '' && $scope.shop.district_address != null) {
                $scope.shop.full_address = $scope.shop.district_address;
                $scope.shop.full_address += ($scope.shop.city_address != null && $scope.shop.city_address != '') ? (', ' + $scope.shop.city_address) : '';
            } else if ($scope.shop.city_address != '' && $scope.shop.city_address != null) {
                $scope.shop.full_address = $scope.shop.city_address;
            }
        }

        $scope.locationChanged = function(lat, lng) {
            // update map
            $scope.marker.coords.latitude = lat;
            $scope.marker.coords.longitude = lng;
            $scope.map.center.longitude = lng;
            $scope.map.center.latitude = lat;
        }

        $scope.districtInputChanged = function()
        {
            $("#districtDropdown").addClass("open")
        }

        $scope.cityInputChanged = function()
        {
            $("#cityDropdown").addClass("open")
        }
 
        $scope.editCityAddressChanged = function()
        {
           $scope.bundle.editCityAddress = true;
           $scope.bundle.editDistrictAddress = false;
           if ($scope.bundle.shopDistrictAddress.length <= 0) 
                $scope.bundle.shopDistrictAddress = $scope.shop.district_address;
         
        }

        $scope.editDistrictAddressChanged = function()
        {

            $scope.bundle.editCityAddress = false;
            $scope.bundle.editDistrictAddress = true;
            if ($scope.bundle.shopCityAddress.length <= 0) 
                $scope.bundle.shopCityAddress = $scope.shop.city_address;
        }
        function updateLatLng(lat, lng) {
            shopRemote.update({
                lat: lat,
                lng: lng,
                shop_id: shopId
            }, function(data) {
                if (data.error == undefined) {
                    $scope.shop.lat = $scope.marker.coords.lat;
                    $scope.shop.lng = $scope.marker.coords.lng;

                    dataFactory.setCurrentShop($scope.shop);
                    dataFactory.updateShopInBrand(shopId, $scope.brandId, $scope.shop);
                } else {
                    dialogHelper.showError(data.error.message);
                    $scope.marker.coords.lat = $scope.shop.lat;
                    $scope.marker.coords.lng = $scope.shop.lng;
                    $scope.map.center.lat = $scope.shop.lat;
                    $scope.map.center.lng = $scope.shop.lng;
                }
            }, function() {

            });
        }
    }
])
    .config(function($routeProvider) {
        var access = routingConfig.accessLevels;
        $routeProvider
            .when('/shop/:brandId/:shopId', {
                templateUrl: 'modules/shop/template/shop.html',
                controller: 'ShopCtrl',
                access: access.user
            })
            .when('/create-shop', {
                templateUrl: 'modules/shop/template/shop_create.html',
                controller: 'CreateShopCtrl',
                access: access.user
            })
    });
