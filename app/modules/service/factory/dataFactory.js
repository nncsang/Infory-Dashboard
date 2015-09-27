angular.module('smg.services')
    .factory('dataFactory', ['$http', 'remoteFactory', 'brandRemote', 'shopRemote', 'userRemote', 'accountRemote', 'dialogHelper', 'systemRemote',

        function($http, remoteFactory, brandRemote, shopRemote, userRemote, accountRemote, dialogHelper, systemRemote) {

            var updateHomeFunc = null;

            var updateBrandHeaderFunc = null;
            var updateBrandsHeaderFunc = null;
            var updateAccountNameHeaderFunc = null;
            var updateBrandSideBarFunc = null;
            var updateHomeBrandFunc = null;

            var brands = null;
            var tempShop = null;
            var user_pre = {
                username: null,
                avatar: null
            };

            var userProfile = null;
            var currentShop = null;
            var currentBrand = null;
            var currentResultUserFilter = null;
            var usersOfBrand = {
                id: null,
                users: null
            }

            var bookmarks = {
                brand_id: -1,
                bookmarks: {
                    event_bookmarks: null,
                    funnel_bookmarks: null,
                    profiles_bookmarks: null
                }
            }

            var URL = '';

            var metaData = {
                brand_id: -1,
                meta_lists: null
            }

            return {
                setEventBookmarks: function(brandId, event_bookmarks) {
                    bookmarks.brand_id = brandId;
                    bookmarks.bookmarks.event_bookmarks = event_bookmarks;
                },
                setProfileBookmarks: function(brandId, profile_bookmarks) {
                    bookmarks.brand_id = brandId;
                    bookmarks.bookmarks.profiles_bookmarks = profile_bookmarks;
                },
                setBookmarks: function(brandId, bookmarks) {
                    bookmarks.brand_id = brandId;
                    bookmarks.bookmarks.event_bookmarks = data.event_bookmarks;
                    bookmarks.bookmarks.funnel_bookmarks = data.funnel_bookmarks;
                    bookmarks.bookmarks.profiles_bookmarks = data.profiles_bookmarks;
                },
                getBookmarks: function(brandId, success, error) {
                    if (bookmarks.brand_id == brandId) {
                        success(bookmarks);
                    } else {
                        var fields = {
                            id: brandId,
                            fields: '["event_bookmarks", "profiles_bookmarks"]'
                        }

                        brandRemote.get(fields, function(data) {
                            if (data.error == undefined) {
                                bookmarks.brand_id = brandId;
                                bookmarks.bookmarks.event_bookmarks = data.event_bookmarks;
                                bookmarks.bookmarks.funnel_bookmarks = data.funnel_bookmarks;
                                success(bookmarks);
                            } else
                                dialogHelper.showError(data.error.message);
                        }, error)
                    }
                },
                updateShopInBrand: function(shopId, brandId, shop) {
                    if (currentBrand != null && currentBrand.id == brandId) {
                        for (var i = 0; i < currentBrand.shops.length; i++) {
                            if (currentBrand.shops[i].id == shopId) {
                                currentBrand.shops[i] = shop;
                                return;
                            }
                        }
                    }
                },
                setUpdateHomeBrandFunc: function(func) {
                    updateHomeBrandFunc = func;
                },
                updateHomeBrand: function(brand) {
                    if (updateHomeBrandFunc != null)
                        updateHomeBrandFunc(brand);
                },
                updateBrandSideBar: function(id) {
                    if (updateBrandSideBarFunc != null) {
                        updateBrandSideBarFunc(id);
                    }
                },
                setUpdateBrandSideBarFunc: function(func) {
                    updateBrandSideBarFunc = func;
                },
                updateAccountNameHeader: function(name) {
                    if (updateAccountNameHeaderFunc != null)
                        updateAccountNameHeaderFunc(name);
                },
                updateBrandsHeader: function(brands) {
                    if (updateBrandsHeaderFunc != null)
                        updateBrandsHeaderFunc(brands);
                },
                updateBrandHeader: function(brand) {
                    if (updateBrandHeaderFunc != null)
                        updateBrandHeaderFunc(brand);
                },
                setUpdateBrandHeaderFunc: function(func) {
                    updateBrandHeaderFunc = func;
                },
                setUpdateBrandsHeaderFunc: function(func) {
                    updateBrandsHeaderFunc = func;
                },
                setUpdateAccountNameHeaderFunc: function(func) {
                    updateAccountNameHeaderFunc = func;
                },
                setUpdateHomeFunc: function(func) {
                    updateHomeFunc = func;
                },
                updateHome: function(brandId) {
                    if (updateHomeFunc != null)
                        updateHomeFunc(brandId);
                },
                setCurrentResultUserFilter: function(result) {
                    currentResultUserFilter = result;
                },
                getCurrentResultUserFilter: function() {
                    return currentResultUserFilter;
                },
                setUsersOfBrand: function(brandId, users) {
                    usersOfBrand = {
                        id: brandId,
                        users: users
                    }
                },
                getUsersOfBrand: function(brandId, success, error) {
                    if (usersOfBrand != null && usersOfBrand.id == brandId) {
                        success(usersOfBrand);
                    } else {
                        var fields = {
                            id: brandId,
                            fields: '["users"]'
                        }

                        usersOfBrand.id = brandId;

                        brandRemote.get(fields, function(data) {
                            if (data.error == undefined) {
                                usersOfBrand.users = data.users;
                                success(data);
                            } else
                                dialogHelper.showError(data.error.message);
                        }, function() {
                            usersOfBrand.id = null;
                            error;
                        });
                    }
                },
                setTempShop: function(shop) {
                    tempShop = shop;
                },
                getTempShop: function() {
                    return tempShop;
                },
                getShop: function(id, fields, success, error) {
                    if (currentShop != null && currentShop.id == id)
                        success(currentShop);
                    else {
                        shopRemote.get({
                            fields: fields,
                            shop_id: id,
                        }, function(data) {
                            if (data.error == undefined) {
                                currentShop = data;
                                success(data);
                            } else
                                dialogHelper.showError(data.error.message);
                        }, error);
                    }

                },
                setCurrentShop: function(shop) {
                    currentShop = shop;
                },
                setUsernameAvatar: function(username, avatar) {
                    user_pre.username = username;
                    user_pre.avatar = avatar;
                },
                getUsernameAvatar: function() {
                    return user_pre;
                },
                setCurrentBrand: function(newBrand) {
                    currentBrand = newBrand;
                },
                getCurrentBrand: function() {
                    return currentBrand;
                },
                getBrands: function(success, error) {
                    if (brands != null)
                        success(brands);
                    else {
                        var fields = '["name", "id", "cover", "type_business", "website", "fanpage", "description", "id", "owner_phone", "owner_address", "logo"]';
                        brandRemote.getList({
                            fields: fields
                        }, function(data) {
                            if (data.error == undefined) {
                                brands = data;
                                success(brands);
                            } else
                                dialogHelper.showError(data.error.message);
                        }, error);
                    }
                },
                setCurrentBrands: function(newBrands) {
                    brands = newBrands;
                },
                getBrand: function(id, success, error) {
                    if (currentBrand != null && currentBrand.id == id) {
                        success(currentBrand);
                    } else {
                        var fields = '["name", "id", "cover", "type_business", "website", "fanpage", "description", "shops", "id", "owner_phone", "owner_address", "logo"]';
                        brandRemote.get({
                            fields: fields,
                            id: id,
                        }, function(data) {
                            if (data.error == undefined) {
                                currentBrand = data;
                                success(currentBrand);
                            } else
                                dialogHelper.showError(data.error.message);
                        }, error);
                    }
                },
                getUserProfile: function(brandId, userId, success, error) {
                    if (userProfile != null && userProfile.userId == userId && userProfile.brand_id == brandId) {
                        success(userProfile);
                    } else {
                        var fields = '["dob", "name", "id", "avatar", "phone", "address", "email", "last_visit", "timeline", "city", "gender", "facebook", "age"]';
                        userRemote.get({
                            fields: fields,
                            brand_id: brandId,
                            user_id: userId
                        }, function(data) {
                            if (data.error == undefined) {
                                userProfile = data;
                                userProfile.brand_id = brandId;
                                userProfile.userId = userId;
                                success(userProfile);
                            } else
                                dialogHelper.showError(data.error.message);
                        }, error);
                    }
                },
                setUrl: function(url) {
                    URL = url;
                },
                getUrl: function() {
                    return URL;
                },
                getMetaData: function(brandId, success, error) {
                    if (metaData.brand_id == brandId) {
                        success(metaData);
                        return;
                    }

                    var fields = {
                        brand_id: brandId,
                        fields: '["meta_lists", "meta_events", "meta_property_types", "meta_profile", "cities"]'
                    };

                    systemRemote.get(fields, function(data) {
                        if (data.error == undefined) {
                            metaData.brand_id = brandId;
                            metaData.meta_lists = data.meta_lists;
                            metaData.meta_profile = data.meta_profile;
                            metaData.meta_events = data.meta_events;
                            metaData.meta_property_types = data.meta_property_types;
                            metaData.cities = data.cities;
                            success(metaData);
                        } else
                            dialogHelper.showError(data.error.message);
                    }, error);
                }
            }
        }
    ])
