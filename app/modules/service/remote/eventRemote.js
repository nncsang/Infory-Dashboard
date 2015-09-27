angular.module('smg.services')
    .factory('eventRemote', ['$http', 'remoteFactory',
        function($http, remoteFactory) {
            var base_url = remoteFactory.getBaseUrl() + 'event/';
            return {
                count: function(fields, success, error) {
                    $http.post(base_url + 'count' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                getDistributionMap: function(fields, success, error) {
                    $http.post(base_url + 'get_distribution_map' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                }
            }
        }
    ])