angular.module('promotion')

.controller('PromotionStep1Ctrl', ['$scope', '$routeParams', '$location', 'remoteFactory', 'dataFactory', 'userRemote', 'serviceHelper', 'promotionRemote', 'promotionFactory', 'serviceHelper',

    function($scope, $routeParams, $location, remoteFactory, dataFactory, userRemote, serviceHelper, promotionRemote, promotionFactory, serviceHelper) {

        /** Global variables **/
        var brandId = $routeParams.brandId;

        /** Scope variables **/
        $scope.promotionTypes = [{
            name: 'news',
            name_display: 'News'
        }, {
            name: 'voucher',
            name_display: 'Voucher'
        }];

        dataFactory.getBrand(brandId, function(data) {}, function() {});

        /** Logic **/
        var oldData = promotionFactory.getData(0, brandId);
        if (oldData != null) {
            for (var i = 0; i < $scope.promotionTypes.length; i++)
                if (oldData.promotionType.name == $scope.promotionTypes[i].name)
                    $scope.promotionType = $scope.promotionTypes[i];
        } else {
            $scope.promotionType = $scope.promotionTypes[0];
        }

        $scope.goToStep2 = function() {
            promotionFactory.setData(0, {
                promotionType: $scope.promotionType,
                brand_id: brandId
            });
            $location.path('/brand/promotion/step2/' + brandId);
        }
    }
])