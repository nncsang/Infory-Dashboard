angular.module('smg.services')
    .factory('funnelRemote', ['$http', '$upload', 'remoteFactory',
        function($http, $upload, remoteFactory) {
            var base_url = remoteFactory.getBaseUrl() + 'funnel/';
            return {
                get: function(fields, success, error) {
                    $http.post(base_url + 'get' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
            }
        }
    ])