angular.module('promotion')

.controller('PromotionStep2Ctrl', ['$scope', '$routeParams', '$location', 'remoteFactory', 'dataFactory', 'userRemote', 'serviceHelper', 'promotionRemote', 'promotionFactory', 'serviceHelper',

    function($scope, $routeParams, $location, remoteFactory, dataFactory, userRemote, serviceHelper, promotionRemote, promotionFactory, serviceHelper) {
        /** Global variables **/
        var brandId = $routeParams.brandId,
            intervalDate = serviceHelper.getIntervalDate(),
            date_end = new Date(new Date().setTime(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)),
            step1Data = promotionFactory.getData(0, brandId),
            data = promotionFactory.getData(1, brandId);

        /** Scope variables **/
        $scope.selectedShops = [];
        $scope.name = "";
        $scope.data = [{
            dateDropDownInput: intervalDate.date_beg,
            dateDisplay: serviceHelper.normalizeTime(intervalDate.date_beg),
        }, {
            dateDropDownInput: date_end,
            dateDisplay: serviceHelper.normalizeTime(date_end)
        }];
        $scope.checkAllShops = false;
        $scope.numOfSelectedShops = 0;

        /** Logic **/
        dataFactory.getBrand(brandId, function(data) {
            $scope.brand = data;
            for (var i = 0; i < $scope.brand.shops.length; i++) {
                $scope.brand.shops[i].selectedId = i;
                $scope.selectedShops.push(i == 0);
            }

        }, function() {});

        updateTime();

        if (step1Data == null) {
            $location.path('/brand/promotion/step1/' + brandId);
            return;
        }

        $scope.promotionType = step1Data.promotionType;

        if (data != null) {
            $scope.name = data.name;
            $scope.data[0] = data.date_beg;
            $scope.data[1] = data.date_end;

            if (data.selectedShops != null)
                $scope.selectedShops = data.selectedShops;

            if (data.shops_apply != undefined) {
                dataFactory.getBrand(brandId, function(datax) {
                    $scope.brand = datax;
                    for (var i = 0; i < data.shops_apply.length; i++) {
                        for (var j = 0; j < $scope.brand.shops.length; j++) {
                            if ($scope.brand.shops[j].id == data.shops_apply[i].id) {
                                $scope.selectedShops[j] = true;
                            }
                        }
                    }
                }, function() {});
            }

            updateTime();
            initNumOfSelectedShop();
        }

        $scope.updateSelectedShops = function(isChecked) {
            if (isChecked == true)
                $scope.numOfSelectedShops++;
            else
                $scope.numOfSelectedShops--;
        }

        initNumOfSelectedShop();

        function initNumOfSelectedShop() {
            $scope.numOfSelectedShops = 0;
            for (var i = 0; i < $scope.selectedShops.length; i++) {
                if ($scope.selectedShops[i] == true)
                    $scope.numOfSelectedShops++;
            }
        }

        function updateTime() {
            $scope.time = $scope.data[0].dateDisplay + " to " + $scope.data[1].dateDisplay;
        }

        $scope.onTimeSetOne = function(newDate, oldDate) {
            $scope.data[0].dateDisplay = serviceHelper.normalizeTime(newDate);
            updateTime();
        }

        $scope.onTimeSetTwo = function(newDate, oldDate) {
            $scope.data[1].dateDisplay = serviceHelper.normalizeTime(newDate);
            updateTime();
        }

        $scope.checkAll = function() {
            for (var i = 0; i < $scope.brand.shops.length; i++)
                $scope.selectedShops[i] = $scope.checkAllShops;

            if ($scope.checkAllShops == true)
                $scope.numOfSelectedShops = $scope.selectedShops.length;
            else
                $scope.numOfSelectedShops = 0;
        }

        $scope.goToStep3 = function() {
            saveInfor();
            $location.path('/brand/promotion/step3/' + brandId);
        }

        $scope.goToStep1 = function() {
            saveInfor();
            $location.path('/brand/promotion/step1/' + brandId);
        }

        function saveInfor() {
            promotionFactory.setData(1, {
                promotionType: $scope.promotionType,
                selectedShops: $scope.selectedShops,
                shops: $scope.brand.shops,
                name: $scope.name,
                date_beg: $scope.data[0],
                date_end: $scope.data[1],
                brand_id: brandId
            });
        }
    }
])