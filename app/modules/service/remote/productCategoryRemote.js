angular.module('smg.services')
    .factory('productCategoryRemote', ['$http', 'remoteFactory',
        function($http, remoteFactory) {
            var base_url = remoteFactory.getBaseUrl() + 'product_category/';
            return {
                create: function(fields, success, error) {
                    $http.post(base_url + 'create' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
            }
        }
    ])