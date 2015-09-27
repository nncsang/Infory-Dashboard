angular.module('brand')

.controller('BrandCtrl', ['$scope', '$http', '$location', '$routeParams', '$upload', 'brandRemote', 'commentRemote', 'dataFactory', 'productRemote', 'shopRemote', 'commentFactory', 'brandFactory', 'productCategoryRemote', 'remoteFactory', 'dialogHelper', 'promotionFactory', 'userNotifyFactory',
    function($scope, $http, $location, $routeParams, $upload, brandRemote, commentRemote, dataFactory, productRemote, shopRemote, commentFactory, brandFactory, productCategoryRemote, remoteFactory, dialogHelper, promotionFactory, userNotifyFactory) {
        /** Global variables **/
        var base_url = remoteFactory.getBaseUrl(),
            brandId = $routeParams.brandId;

        /** Scope variables **/
        $scope.hideLoadingProduct = false;
        $scope.hideLoadingImage = false;
        $scope.hideLoadingInfor = false;
        $scope.gallery = [];
        $scope.usersGallery = null;
        $scope.products = null;

        $scope.brand = null;
        $scope.brands = null;
        $scope.commentInput = '';
        $scope.groupShops = remoteFactory.groupShop;

        $scope.bundle = {
            brandName: '',
            brandDescription: '',
            brandShortDescription: '',
            brandWebsite: '',
            brandFanpage: '',
            brandContact: '',
            brandPhone: '',
            groupShop: '',
            editName: false,
            editDescription: false,
            editWebsite: false,
            editFanpage: false,
            editGroupShop: false,
            editPhone: false
        };

        $scope.productTemp = {
            name: '',
            description: ''
        };

        $scope.oderComments = [{
            field: '-like_count',
            display: 'Lượt thích'
        }, {
            field: '-updated_time',
            display: 'Thời gian'
        }];

        /** Logic **/
        if (brandId != null) {
            $scope.brandId = brandId;
        }

        dataFactory.setUpdateBrandSideBarFunc(function(id) {
            $scope.brandId = id;
        });

        $scope.resetEditPromotionNotification = function() {

            promotionFactory.setData(0, null);
            promotionFactory.setData(1, null);
            promotionFactory.setData(2, null);
            promotionFactory.setMode('create');

            userNotifyFactory.setData(0, null);
            userNotifyFactory.setData(1, null);
            userNotifyFactory.setData(2, null);
            userNotifyFactory.setMode('create');
        }

        function saveBundle(data) {
            $scope.bundle.brandLogo = data.logo;
            $scope.bundle.brandName = data.name;
            $scope.bundle.brandCover = data.cover;
            $scope.bundle.brandDescription = data.description;
            $scope.bundle.brandShortDescription = data.description.substring(0, 100) + "...";
            $scope.bundle.brandWebsite = data.website;
            $scope.bundle.brandFanpage = data.fanpage;
            $scope.bundle.brandContact = data.owner_phone;
            $scope.bundle.groupShop = data.type_business;
        }

        dataFactory.getBrands(function(brands) {
            $scope.brands = brands;
            if (brands.length != 0) {
                if (brandId == null) {
                    dataFactory.getBrand(brands[0].id, function(data) {
                        resetData(data);
                    }, function() {})
                } else {
                    //for (var i = 0; i < brands.length; i++) {
                    //    if (brands[i].id == brandId) {
                    dataFactory.getBrand(brandId, function(data) {
                        resetData(data);
                    }, function() {})
                    //        break;
                    //    }
                    //}
                }
            }
        }, function() {});

        function resetData(data) {
            $scope.hideLoadingInfor = true;

            var path = $location.path().substring(0, 14);

            $scope.brand = data;
            switch (path) {
                case '/brand/comment':
                    var oldData = commentFactory.getData(brandId);
                    if (oldData != null) {
                        for (var i = 0; i < $scope.brand.shops.length; i++)
                            if (oldData.shop.id == $scope.brand.shops[i].id) {
                                $scope.shop = $scope.brand.shops[i];
                                for (var j = 0; j < $scope.oderComments.length; j++)
                                    if (oldData.sorter.field == $scope.oderComments[j].field) {
                                        $scope.sorter = $scope.oderComments[j];
                                        break;
                                    }
                            }
                    } else {
                        $scope.sorter = $scope.oderComments[0];
                        $scope.shop = $scope.brand.shops[0];
                    }
                    break;
                default:
                    $scope.shop = $scope.brand.shops[0];
            }

            saveBundle($scope.brand);
            refactorDateTimeMessage($scope.brand);
            dataFactory.updateHome($scope.brand.id);
        }

        function refactorDateTimeMessage(brand) {
            for (var i = 0; i < brand.shops.length; i++) {
                for (var j = 0; j < brand.shops[i].comments.length; j++) {
                    var newDate = new Date(brand.shops[i].comments[j].updated_time.split("-").join("/"));
                    var d = newDate.getDate();
                    var m = newDate.getMonth() + 1;
                    var y = newDate.getFullYear();
                    var h = newDate.getHours();
                    var min = newDate.getMinutes();

                    brand.shops[i].comments[j].dateDisplay = '' + (d <= 9 ? '0' + d : d) + '-' + (m <= 9 ? '0' + m : m) + '-' + y;
                    brand.shops[i].comments[j].timeDisplay = (h <= 9 ? '0' + h : h) + ' : ' + (min <= 9 ? '0' + min : min);
                }
            }
        }

        function saveInforShopComment() {
            commentFactory.setData({
                brand_id: brandId,
                shop: $scope.shop,
                sorter: $scope.sorter
            });
        }

        $scope.updateShopComment = function() {
            saveInforShopComment();
        }

        $scope.setCurrentBrand = function(brand) {
            $scope.brand = brand;
            dataFactory.setCurrentBrand(brand);
        }

        $scope.showUserProfile = function(brandId, userId, username, avatar) {
            dataFactory.setUrl($location.path());
            dataFactory.setUsernameAvatar(username, avatar);
            $location.path('/user/' + brandId + '/' + userId);
        }

        $scope.goToShopInfo = function(shop) {
            dataFactory.setTempShop(shop);
            $location.path('/shop/' + $scope.brand.id + '/' + shop.id);
        }

        $scope.changeName = function() {
            $scope.bundle.editName = !$scope.bundle.editName;
            if ($scope.bundle.brandName.length <= 0) {
                $scope.bundle.brandName = $scope.brand.name;
            } else {
                brandRemote.update({
                    name: $scope.bundle.brandName,
                    brand_id: brandId,
                }, function(data) {
                    if (data.error == undefined) {
                        $scope.brand.name = $scope.bundle.brandName;
                        dataFactory.setCurrentBrand($scope.brand);
                        dataFactory.updateBrandHeader($scope.brand);
                    } else {
                        dialogHelper.showError(data.error.message);
                        $scope.bundle.brandName = $scope.brand.name;
                    }
                }, function() {

                });
            }
        }

        $scope.changeDescription = function() {
            $scope.bundle.editDescription = !$scope.bundle.editDescription;
            if ($scope.bundle.brandDescription.length <= 0) {
                $scope.bundle.brandDescription = $scope.brand.description;
            } else {
                brandRemote.update({
                    description: $scope.bundle.brandDescription,
                    brand_id: brandId,
                }, function(data) {
                    if (data.error == undefined) {
                        $scope.brand.description = $scope.bundle.brandDescription;
                        dataFactory.setCurrentBrand($scope.brand);
                    } else {
                        dialogHelper.showError(data.error.message);
                        $scope.bundle.brandDescription = $scope.brand.description;
                    }
                }, function() {

                });
            }
        }

        $scope.changeWebsite = function() {
            $scope.bundle.editWebsite = !$scope.bundle.editWebsite;
            if ($scope.bundle.brandWebsite.length <= 0) {
                $scope.bundle.brandWebsite = $scope.brand.website;
            } else {
                brandRemote.update({
                    website: $scope.bundle.brandWebsite,
                    brand_id: brandId,
                }, function(data) {
                    if (data.error == undefined) {
                        $scope.brand.website = $scope.bundle.brandWebsite;
                        dataFactory.setCurrentBrand($scope.brand);
                    } else {
                        dialogHelper.showError(data.error.message);
                        $scope.bundle.brandWebsite = $scope.brand.website;
                    }
                }, function() {

                });
            }
        }

        $scope.changeFanpage = function() {
            $scope.bundle.editFanpage = !$scope.bundle.editFanpage;
            if ($scope.bundle.brandFanpage.length <= 0) {
                $scope.bundle.brandFanpage = $scope.brand.fanpage;
            } else {
                brandRemote.update({
                    fanpage: $scope.bundle.brandFanpage,
                    brand_id: brandId,
                }, function(data) {
                    if (data.error == undefined) {
                        $scope.brand.fanpage = $scope.bundle.brandFanpage;
                        dataFactory.setCurrentBrand($scope.brand);
                    } else {
                        dialogHelper.showError(data.error.message);
                        $scope.bundle.brandFanpage = $scope.brand.fanpage;
                    }
                }, function() {

                });
            }
        }

        $scope.changeGroupShop = function(name) {
            $('.z-dropdown').removeClass('open');
            $scope.bundle.groupShop = name;
            $scope.bundle.editGroupShop = !$scope.bundle.editGroupShop;
            if ($scope.bundle.groupShop.length <= 0) {
                $scope.bundle.groupShop = $scope.brand.type_business;
            } else {
                brandRemote.update({
                    type_business: $scope.bundle.groupShop,
                    brand_id: brandId,
                }, function(data) {
                    if (data.error == undefined) {
                        $scope.brand.type_business = $scope.bundle.groupShop;
                        dataFactory.setCurrentBrand($scope.brand);
                    } else {
                        dialogHelper.showError(data.error.message);
                        $scope.bundle.groupShop = $scope.brand.type_business;
                    }
                }, function() {

                });
            }
        }

        $scope.delComment = function(id) {
            dialogHelper.loadDialog('Warning', 'OK', 'Cancel', 'Your action is not restorable. Do you want to continue?', function() {
                commentRemote.delete({
                    comment_id: id
                }, function(data) {
                    if (data.error == undefined) {
                        for (var i = $scope.shop.comments.length - 1; i >= 0; i--) {
                            if ($scope.shop.comments[i].id == id) {
                                $scope.shop.comments.splice(i, 1);
                                return;
                            }
                        }
                    } else
                        dialogHelper.showError(data.error.message);

                }, function() {})
            });
        };

        $scope.addComment = function() {
            commentRemote.create({
                shop_id: $scope.shop.id,
                content: $scope.commentInput
            }, function(data) {
                if (data.error == undefined) {
                    commentRemote.get({
                        comment_id: data.comment_id
                    }, function(data) {
                        if (data.error == undefined) {
                            var newDate = new Date(data.updated_time);
                            var d = newDate.getDate();
                            var m = newDate.getMonth() + 1;
                            var y = newDate.getFullYear();
                            var h = newDate.getHours();
                            var min = newDate.getMinutes();

                            data.dateDisplay = '' + (d <= 9 ? '0' + d : d) + '-' + (m <= 9 ? '0' + m : m) + '-' + y;
                            data.timeDisplay = (h <= 9 ? '0' + h : h) + ' : ' + (min <= 9 ? '0' + min : min);
                            $scope.shop.comments.unshift(data);
                            $scope.commentInput = '';
                        } else
                            dialogHelper.showError(data.error.message);
                    });
                } else
                    dialogHelper.showError(data.error.message);
            });
        };

        $scope.changeLogo = function($files) {
            var fd = new FormData();
            fd.append('logo', $files[0]);
            fd.append('brand_id', brandId);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', base_url + 'brand/update' + remoteFactory.getTailUrl(), true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var respone = JSON.parse(xhr.responseText);
                    if (respone.logo != undefined) {
                        $scope.$apply(function() {
                            $scope.brand.logo = respone.logo;
                        });

                        dataFactory.setCurrentBrand($scope.brand);
                        dialogHelper.showError('Uploaded, system will be updated in a moment');
                    } else
                        dialogHelper.showError(respone.error.message);
                }
            }
            xhr.send(fd);
        };

        $scope.changeCover = function($files) {
            var fd = new FormData();
            fd.append('cover', $files[0]);
            fd.append('brand_id', brandId);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', base_url + 'brand/update' + remoteFactory.getTailUrl(), true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var respone = JSON.parse(xhr.responseText);
                    if (respone.cover != undefined) {
                        $scope.$apply(function() {
                            $scope.brand.cover = respone.cover;
                        });

                        dataFactory.setCurrentBrand($scope.brand);
                        dialogHelper.showError('Uploaded, system will be updated in a moment');
                    } else
                        dialogHelper.showError(respone.error.message);
                }
            }
            xhr.send(fd);
        };

        $scope.showGallery = function() {
            var oldData = brandFactory.getData(brandId);

            if (oldData == null || (oldData != null && oldData.gallery == null)) {
                $scope.hideLoadingImage = false;
                var fields = {
                    id: brandId,
                    fields: '["gallery"]'
                };

                brandRemote.get(fields, function(data) {
                    $scope.hideLoadingImage = true;
                    if (data.error == undefined) {
                        if (data.gallery == null)
                            $scope.gallery = [];
                        else {
                            data.gallery = data.gallery.reverse();
                            $scope.gallery = data.gallery;
                        }
                    } else
                        dialogHelper.showError(data.error.message);

                    saveToFactory();
                }, function() {});
            } else {
                $scope.gallery = oldData.gallery;
                $scope.hideLoadingImage = true;
            }
        }

        function saveToFactory() {
            brandFactory.setData({
                brand_id: brandId,
                gallery: $scope.gallery,
                categories: $scope.brand.categories,
                currentCategory: $scope.category
            })
        }

        $scope.showProducts = function() {
            var oldData = brandFactory.getData(brandId);
            if (oldData == null || (oldData != null && oldData.categories == null)) {
                $scope.hideLoadingProduct = false;
                var fields = {
                    id: brandId,
                    fields: '["menu"]'
                };

                brandRemote.get(fields, function(data) {
                    $scope.hideLoadingProduct = true;
                    if (data.error == undefined) {
                        $scope.brand.categories = data.menu;
                        if ($scope.brand.categories.length > 0) {

                            $scope.category = $scope.brand.categories[0];
                            saveToFactory();
                        }
                    } else
                        dialogHelper.showError(data.error.message);
                }, function() {});
            } else {
                $scope.hideLoadingProduct = true;
                $scope.categories = oldData.categories;
                $scope.category = oldData.currentCategory;
            }
        }

        $scope.createCategory = function(name) {
            if (name == '')
                return;

            productCategoryRemote.create({
                brand_id: brandId,
                name: name
            }, function(data) {
                if (data.error == undefined) {
                    $scope.brand.categories.unshift({
                        id: data.category_id,
                        name: name,
                        products: []
                    })

                    $scope.category = $scope.brand.categories[0];
                    saveToFactory();
                } else
                    dialogHelper.showError(data.error.message);
            }, function() {});
        }

        $scope.changeCategory = function(id) {
            $('.z-dropdown').removeClass('open');
            for (var i = 0; i < $scope.brand.categories.length; i++) {
                if ($scope.brand.categories[i].id == id) {
                    $scope.category = $scope.brand.categories[i];
                    saveToFactory();
                    return;
                }
            }
        }


        $scope.changeProductName = function(categoryId, productId, name) {
            var fields = {
                product_id: productId,
                category_id: categoryId,
                name: name
            };

            productRemote.update(fields, function(data) {
                if (data.error == undefined) {
                    for (var i = 0; i < $scope.brand.categories.length; i++) {
                        if ($scope.brand.categories[i].id == categoryId) {
                            for (var j = 0; j < $scope.brand.categories[i].products.length; j++) {
                                if ($scope.brand.categories[i].products[j].id == productId) {
                                    $scope.brand.categories[i].products[j].name = name;
                                    return;
                                }
                            }
                        }
                    }
                } else
                    dialogHelper.showError(data.error.message);
            }, function() {});
        }

        $scope.changeProductLogo = function(categoryId, productId, $files) {
            var fd = new FormData();
            fd.append('product_id', productId);
            fd.append('category_id', categoryId);
            fd.append('images', $files[0]);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', base_url + 'product/update' + remoteFactory.getTailUrl(), true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var respone = JSON.parse(xhr.responseText);
                    if (respone.error == undefined) {
                        $scope.$apply(function() {
                            for (var i = 0; i < $scope.brand.categories.length; i++) {
                                if ($scope.brand.categories[i].id == categoryId) {
                                    for (var j = 0; j < $scope.brand.categories[i].products.length; j++) {
                                        if ($scope.brand.categories[i].products[j].id == productId) {
                                            $scope.brand.categories[i].products[j].images = respone.images;
                                            dialogHelper.showError('Uploaded, system will be updated in a moment');
                                            return;
                                        }
                                    }
                                }
                            }
                        });
                    } else
                        dialogHelper.showError(respone.error.message);
                }
            }
            xhr.send(fd);
        }

        $scope.uploadImage = function($files) {
            var fd = new FormData();
            fd.append('brand_id', brandId);
            fd.append('image', $files);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', base_url + 'brand/add_image' + remoteFactory.getTailUrl(), true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var respone = JSON.parse(xhr.responseText);
                    if (respone.error == undefined) {
                        for (var i = 0; i < respone.length; i++) {
                            if (respone[i].thumbnail_url != undefined) {
                                $scope.gallery.unshift({
                                    thumbnail: respone[i].thumbnail_url
                                });
                            }

                            $scope.$apply(function() {
                                $scope.gallery = $scope.gallery;
                            });
                        }
                        saveToFactory();
                        dialogHelper.showError('Uploaded, system will be updated in a moment');
                    } else
                        dialogHelper.showError(respone.error.message);
                }
            }
            xhr.send(fd);
        }

        $scope.removeImage = function(thumbnail_url) {
            dialogHelper.loadDialog('Warning', 'OK', 'Cancel', 'Your action is not restorable. Do you want to continue? ', function() {
                for (var i = 0; i < $scope.gallery.length; i++) {
                    if ($scope.gallery[i].thumbnail == thumbnail_url) {
                        brandRemote.removeImage({
                            brand_id: brandId,
                            image_id: $scope.gallery.length - 1 - i
                        }, function(data) {
                            if (data.error == undefined) {
                                $scope.gallery.splice(i, 1);
                                saveToFactory();
                            } else
                                dialogHelper.showError(data.error.message);
                        }, function() {});
                        return;
                    }
                }
            });
        }

        $scope.changeProductDescription = function(categoryId, productId, description) {
            var fields = {
                product_id: productId,
                category_id: categoryId,
                description: description
            };

            productRemote.update(fields, function(data) {
                if (data.error == undefined) {
                    for (var i = 0; i < $scope.brand.categories.length; i++) {
                        if ($scope.brand.categories[i].id == categoryId) {
                            for (var j = 0; j < $scope.brand.categories[i].products.length; j++) {
                                if ($scope.brand.categories[i].products[j].id == productId) {
                                    $scope.brand.categories[i].products[j].full_description = description;
                                    return;
                                }
                            }
                        }
                    }
                } else
                    dialogHelper.showError(data.error.message);
            }, function() {});
        }

        $scope.addProduct = function(categoryId) {

            if ($scope.productTemp.name == '' || $scope.productTemp.description == '')
                return;

            var fields = {
                category_id: categoryId,
                name: $scope.productTemp.name,
                full_description: $scope.productTemp.description,
                price: 0

            };

            productRemote.create(fields, function(data) {
                if (data.error == undefined) {
                    for (var i = 0; i < $scope.brand.categories.length; i++) {
                        if ($scope.brand.categories[i].id == categoryId) {
                            $scope.brand.categories[i].products.unshift({
                                name: $scope.productTemp.name,
                                id: data.product_id,
                                category_id: $scope.category.id,
                                full_description: $scope.productTemp.description,
                                images: ['']
                            });
                            return;
                        }
                    }
                    dataFactory.setCurrentBrand($scope.brand);
                } else
                    dialogHelper.showError(data.error.message);

                $scope.productTemp = {
                    name: '',
                    description: ''
                };
            }, function() {});
        };

        $scope.addShop = function(name) {
            shopRemote.create({
                shop_name: name,
                brand_id: brandId
            }, function(data) {
                if (data.error == undefined) {
                    var shop = {
                        id: data.shop_id,
                        name: name,
                        comments: []
                    };

                    $scope.brand.shops.unshift(shop);
                    dataFactory.setCurrentBrand($scope.brand);
                    $scope.goToShopInfo(shop);
                } else
                    dialogHelper.showError(data.error.message);

            }, function() {})
        }

        $scope.delShop = function(id) {

            dialogHelper.loadDialog('Warning', 'OK', 'Cancel', 'Your action is not restorable. Do you want to continue?', function() {
                shopRemote.delete({
                    shop_id: id
                }, function(data) {
                    if (data.error == undefined) {
                        for (var i = $scope.brand.shops.length - 1; i >= 0; i--) {
                            if ($scope.brand.shops[i].id == id) {
                                $scope.brand.shops.splice(i, 1);
                                break;
                            }
                        }

                        dataFactory.setCurrentBrand($scope.brand);
                    } else
                        dialogHelper.showError(data.error.message);

                }, function() {});
            });
        }

        $scope.$watch('brand', function() {
            if ($scope.brand != null) {
                dataFactory.updateBrandHeader($scope.brand);
                dataFactory.updateBrandSideBar($scope.brand.id);
                dataFactory.updateHomeBrand($scope.brand.id);
            }
        });

        $scope.$watch('brands', function() {
            if ($scope.brands != null)
                dataFactory.updateBrandsHeader($scope.brands);
        });
    }
])

.controller('createPromotionCtrl', ['$scope', '$routeParams', 'remoteFactory',
    function($scope, $routeParams, remoteFactory) {
        var brandId = $routeParams.brandId;


        $scope.data = {
            dateDropDownInput: moment("2013-01-22T00:00:00.000").toDate(),
            dateDisplay: "22-01-2013"
        };

        $scope.onTimeSet = function(newDate, oldDate) {
            var d = newDate.getDate();
            var m = newDate.getMonth() + 1;
            var y = newDate.getFullYear();

            $scope.data.dateDisplay = '' + (d <= 9 ? '0' + d : d) + '-' + (m <= 9 ? '0' + m : m) + '-' + y;
        }
    }
])
    .config(function($routeProvider) {
        var access = routingConfig.accessLevels;

        $routeProvider
            .when('/brand/infor/:brandId', {
                templateUrl: 'modules/brand/template/brand/brand.html',
                controller: 'BrandCtrl',
                access: access.user
            })
            .when('/brand/new', {
                templateUrl: 'modules/brand/template/brand_new.html',
                controller: 'brandCreateCtrl',
                access: access.user
            })
            .when('/brand/comment/:brandId', {
                templateUrl: 'modules/brand/template/comment/comment.html',
                controller: 'BrandCtrl',
                access: access.user

            })
            .when('/brand/new', {
                templateUrl: 'modules/brand/template/brand_new.html',
                controller: 'BrandCtrl',
                access: access.user
            })
    });