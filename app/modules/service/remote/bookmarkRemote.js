angular.module('smg.services')
    .factory('bookmarkRemote', ['$http', 'remoteFactory',
        function($http, remoteFactory) {
            var base_url = remoteFactory.getBaseUrl() + 'bookmark/';
            return {
                funnelCreate: function(fields, success, error) {
                    $http.post(base_url + 'funnel/create' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                eventCreate: function(fields, success, error) {
                    $http.post(base_url + 'event/create' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                eventUpdate: function(fields, success, error) {
                    $http.post(base_url + 'event/update' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                profileCreate: function(fields, success, error) {
                    $http.post(base_url + 'profiles/create' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },

            }
        }
    ])