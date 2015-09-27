angular.module('smg.services')
    .factory('messageRemote', ['$http', 'remoteFactory',
        function($http, remoteFactory) {
            var base_url = remoteFactory.getBaseUrl() + 'message/';
            return {
                create: function(fields, success, error) {
                    $http.post(base_url + 'create' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                list: function(fields, success, error) {
                    $http.post(base_url + 'list' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                update: function(fields, success, error) {
                    $http.post(base_url + 'update' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                get: function(fields, success, error) {
                    $http.post(base_url + 'get' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                }
            }
        }
    ])