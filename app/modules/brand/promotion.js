angular.module('promotion')

.controller('PromotionCtrl', ['$scope', '$routeParams', '$location', 'remoteFactory', 'dataFactory', 'userRemote', 'serviceHelper', 'promotionRemote', 'promotionFactory', 'serviceHelper',

    function($scope, $routeParams, $location, remoteFactory, dataFactory, userRemote, serviceHelper, promotionRemote, promotionFactory, serviceHelper) {

    }
])
    .config(function($routeProvider) {
        var access = routingConfig.accessLevels;

        $routeProvider
            .when('/brand/promotion/step1/:brandId', {
                templateUrl: 'modules/brand/template/promotion/promotion_new_step_1.html',
                controller: 'PromotionStep1Ctrl',
                access: access.user
            })
            .when('/brand/promotion/step2/:brandId', {
                templateUrl: 'modules/brand/template/promotion/promotion_new_step_2.html',
                controller: 'PromotionStep2Ctrl',
                access: access.user
            })
            .when('/brand/promotion/step3/:brandId', {
                templateUrl: 'modules/brand/template/promotion/promotion_new_step_3.html',
                controller: 'PromotionStep3Ctrl',
                access: access.user
            })
            .when('/brand/promotion/step4/:brandId', {
                templateUrl: 'modules/brand/template/promotion/promotion_new_step_4.html',
                controller: 'PromotionStep4Ctrl',
                access: access.user
            })
    });