angular.module('smg.services')
    .factory('commentRemote', ['$http', 'remoteFactory',
        function($http, remoteFactory) {
            var base_url = remoteFactory.getBaseUrl() + 'comment/';
            return {
                delete: function(fields, success, error) {
                    $http.post(base_url + 'delete' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                create: function(fields, success, error) {
                    $http.post(base_url + 'create' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                get: function(fields, success, error) {
                    $http.post(base_url + 'get' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                }
            }
        }
    ])