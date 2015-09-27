angular.module('promotion')

.controller('PromotionStep3Ctrl', ['$scope', '$routeParams', '$location', 'remoteFactory', 'dataFactory', 'userRemote', 'serviceHelper', 'promotionRemote', 'promotionFactory', 'serviceHelper', 'fileHelper',

    function($scope, $routeParams, $location, remoteFactory, dataFactory, userRemote, serviceHelper, promotionRemote, promotionFactory, serviceHelper, fileHelper) {

        /** Global variables **/
        var brandId = $routeParams.brandId;
        var step2Data = promotionFactory.getData(1, brandId),
            step3Data = promotionFactory.getData(2, brandId),
            autoNum = 0;

        /** Scope variables **/
        $scope.selectedShops = [];
        $scope.isCanGoNext = false;
        $scope.mode = promotionFactory.getMode() == 'create' ? 'Create' : 'Update';

        /** Logic **/
        dataFactory.getBrand(brandId, function(data) {
            $scope.brand = data;
        }, function() {});

        if (step2Data == null) {
            $location.path('/brand/promotion/step2/' + brandId);
            return;
        } else {
            $scope.promotionType = step2Data.promotionType;
            $scope.name = step2Data.name;
            $scope.time = step2Data.date_beg.dateDisplay + " to " + step2Data.date_end.dateDisplay;
        }

        switch ($scope.promotionType.name) {
            case 'voucher':
                $scope.presentDescriptions = [];
                $scope.indexInArray = [];
                for (var i = 0; i < 1000; i++) {
                    $scope.indexInArray.push(-1);
                }

                if (step3Data != null && step3Data.presentDescriptions != undefined) {
                    $scope.isCanGoNext = step3Data.isCanGoNext;
                    $scope.promotionType = step3Data.promotionType;
                    $scope.presentDescriptions = step3Data.presentDescriptions;
                    $scope.indexInArray = step3Data.indexInArray;
                    autoNum = step3Data.autoNum;

                    updateSTT();
                }

                $scope.removePresent = function(id) {
                    for (var i = $scope.presentDescriptions.length - 1; i >= 0; i--) {
                        if ($scope.presentDescriptions[i].id == id) {
                            $scope.presentDescriptions.splice(i, 1);
                            break;
                        }
                    }
                    updateSTT();
                    isCanGo();
                }

                function updateSTT() {
                    for (var i = 0; i < $scope.presentDescriptions.length; i++) {
                        $scope.presentDescriptions[i].stt = i;
                        $scope.indexInArray[$scope.presentDescriptions[i].id] = i;
                    }
                }

                $scope.addPresent = function() {
                    $scope.presentDescriptions.push({
                        id: autoNum,
                        stt: autoNum,
                        description: '',
                        amount: 1,
                        noLimitedChecked: false,
                        target: '',
                        monChecked: true,
                        tueChecked: false,
                        wedChecked: false,
                        thuChecked: false,
                        friChecked: false,
                        satChecked: false,
                        sunChecked: false,
                        allChecked: false,
                        validation: [true, false, false, true, false],
                        isOK: false,
                    });

                    autoNum++;
                    updateSTT();
                    isCanGo();
                }

                if (step3Data == null || (step3Data != null && step3Data.presentDescriptions == undefined))
                    $scope.addPresent();

                $scope.allCheck = function(id) {
                    var isChecked = $scope.presentDescriptions[$scope.indexInArray[id]].allChecked;

                    $scope.presentDescriptions[$scope.indexInArray[id]].monChecked = isChecked;
                    $scope.presentDescriptions[$scope.indexInArray[id]].tueChecked = isChecked;
                    $scope.presentDescriptions[$scope.indexInArray[id]].wedChecked = isChecked;
                    $scope.presentDescriptions[$scope.indexInArray[id]].thuChecked = isChecked;
                    $scope.presentDescriptions[$scope.indexInArray[id]].friChecked = isChecked;
                    $scope.presentDescriptions[$scope.indexInArray[id]].satChecked = isChecked;
                    $scope.presentDescriptions[$scope.indexInArray[id]].sunChecked = isChecked;

                    $scope.updateValidation(id, 4);
                }

                $scope.updateValidation = function(id, idChange) {
                    var index = $scope.indexInArray[id];
                    var formData = $scope.presentDescriptions[index];

                    switch (idChange) {
                        case 0:
                            if (formData.description == undefined || formData.description == '')
                                $scope.presentDescriptions[index].validation[0] = true;
                            else
                                $scope.presentDescriptions[index].validation[0] = false;
                            break;
                        case 2:
                            if (isNaN(formData.amount))
                                $scope.presentDescriptions[index].validation[2] = true;
                            else
                                $scope.presentDescriptions[index].validation[2] = false;

                            if (isNaN(formData.amount) == false && formData.amount == 0)
                                $scope.presentDescriptions[index].validation[2] = true;
                            break;
                        case 3:
                            if (formData.target == undefined || formData.target == '')
                                $scope.presentDescriptions[index].validation[3] = true;
                            else
                                $scope.presentDescriptions[index].validation[3] = false;
                            break;
                        case 4:
                            if (isOnDayIsChecked($scope.presentDescriptions[index]))
                                $scope.presentDescriptions[index].validation[4] = false;
                            else
                                $scope.presentDescriptions[index].validation[4] = true;
                            break;
                    }

                    if (isAGoodForm($scope.presentDescriptions[index].validation))
                        $scope.presentDescriptions[index].isOK = true;
                    else
                        $scope.presentDescriptions[index].isOK = false;
                    isCanGo();
                }

                function isCanGo() {
                    for (var i = 0; i < $scope.presentDescriptions.length; i++) {
                        if ($scope.presentDescriptions[i].isOK == false) {
                            $scope.isCanGoNext = false;
                            return;
                        }
                    }

                    $scope.isCanGoNext = true;
                }

                function isAGoodForm(validationArray) {
                    for (var i = 0; i < validationArray.length; i++) {
                        if (validationArray[i] == true)
                            return false;
                    }

                    return true;
                }

                function isOnDayIsChecked(checkedArray) {
                    if (checkedArray.monChecked == true)
                        return true;
                    if (checkedArray.tueChecked == true)
                        return true;
                    if (checkedArray.wedChecked == true)
                        return true;
                    if (checkedArray.thuChecked == true)
                        return true;
                    if (checkedArray.friChecked == true)
                        return true;
                    if (checkedArray.satChecked == true)
                        return true;
                    if (checkedArray.sunChecked == true)
                        return true;
                    return false;
                }

                $scope.goToStep2 = function() {
                    saveInforTypeOne();
                    $location.path('/brand/promotion/step2/' + brandId);
                }

                $scope.goToStep4 = function() {
                    saveInforTypeOne();
                    $location.path('/brand/promotion/step4/' + brandId);
                }

                function saveInforTypeOne() {
                    promotionFactory.setData(2, {
                        presentDescriptions: $scope.presentDescriptions,
                        isCanGoNext: $scope.isCanGoNext,
                        promotionType: $scope.promotionType,
                        indexInArray: $scope.indexInArray,
                        autoNum: $scope.autoNum,
                        brand_id: brandId
                    });
                }
                break;

            case 'news':
                $scope.validation = [true, true, true];
                $scope.isCanGoNext = false;
                var fileAvatar = null;

                if (step3Data != null && step3Data.validation != undefined) {
                    $scope.validation = step3Data.validation;
                    $scope.isCanGoNext = step3Data.isCanGoNext;
                    $scope.promotionType = step3Data.promotionType;
                    $scope.content = step3Data.content;
                    $scope.title = step3Data.title;
                    $scope.cover = step3Data.cover;
                    fileAvatar = step3Data.fileAvatar;

                    if ($scope.cover == null || $scope.cover == undefined || $scope.cover == '' || fileAvatar == null || fileAvatar == undefined || fileAvatar == '') {
                        $scope.validation[1] = true;
                    } else
                        $scope.validation[1] = false;

                }

                $scope.changeCover = function($files) {
                    $scope.hideCover = false;

                    fileHelper.readAsDataUrl($files[0], $scope)
                        .then(function(result) {
                            $scope.cover = result;
                            fileAvatar = $files[0];
                            $scope.updateValidationNews(1);
                        });
                }

                $scope.updateValidationNews = function(id) {
                    switch (id) {
                        case 0:
                            if ($scope.title == undefined || $scope.title == '')
                                $scope.validation[0] = true;
                            else
                                $scope.validation[0] = false;
                            break;
                        case 1:
                            if ($scope.cover == null || $scope.cover == undefined || fileAvatar == null || fileAvatar == undefined)
                                $scope.validation[1] = true;
                            else
                                $scope.validation[1] = false;
                            break;
                        case 2:
                            if ($scope.content == undefined || $scope.content == '')
                                $scope.validation[2] = true;
                            else
                                $scope.validation[2] = false;
                            break;
                    }

                    if (!$scope.validation[2] && !$scope.validation[0] && !$scope.validation[1])
                        $scope.isCanGoNext = true;
                    else
                        $scope.isCanGoNext = false;
                }

                function saveInforTypeTwo() {
                    promotionFactory.setData(2, {
                        validation: $scope.validation,
                        isCanGoNext: $scope.isCanGoNext,
                        promotionType: $scope.promotionType,
                        content: $scope.content,
                        title: $scope.title,
                        brand_id: brandId,
                        cover: $scope.cover,
                        fileAvatar: fileAvatar
                    });
                }

                $scope.goToStep4 = function() {
                    saveInforTypeTwo();
                    $location.path('/brand/promotion/step4/' + brandId);
                }

                $scope.goToStep2 = function() {
                    saveInforTypeTwo();
                    $location.path('/brand/promotion/step2/' + brandId);
                }
                break;
        }

    }
])