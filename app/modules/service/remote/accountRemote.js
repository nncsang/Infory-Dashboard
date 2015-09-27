angular.module('smg.services')
    .factory('accountRemote', ['$http', 'remoteFactory',
        function($http, remoteFactory) {
            var base_url = remoteFactory.getBaseUrl();
            return {
                // login: function(fields, success, error) {
                //     $http.post('http://smartguide.dev/dashboard/auth', fields).success(success).error(error);
                // },
                // logout: function(fields, success, error) {
                //     $http.post(base_url + 'logout', fields).success(success).error(error);
                // },
                get: function(fields, success, error) {
                    $http.post(base_url + 'account/get' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                update: function(fields, success, error) {
                    $http.post(base_url + 'account/update' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
            }
        }
    ])