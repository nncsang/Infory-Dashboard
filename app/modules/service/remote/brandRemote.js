angular.module('smg.services')
    .factory('brandRemote', ['$http', '$upload', 'remoteFactory',
        function($http, $upload, remoteFactory) {
            var base_url = remoteFactory.getBaseUrl() + 'brand/';
            return {
                update: function(fields, success, error) {
                    $http.post(base_url + 'update' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                getList: function(fields, success, error) {
                    $http.post(base_url + 'list' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                get: function(fields, success, error) {
                    $http.post(base_url + 'get' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                getHome: function(fields, success, error) {
                    $http.post(base_url + 'get_home' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                getDevelopmentChart: function(fields, success, error) {
                    $http.post(base_url + 'get_development_chart' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                getCostChart: function(fields, success, error) {
                    $http.post(base_url + 'get_cost_chart' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                create: function(fields, success, error) {
                    $http.post(base_url + 'create' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                removeImage: function(fields, success, error) {
                    $http.post(base_url + 'remove_image' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                getListInternal: function(fields, success, error) {
                    $http.post(base_url + 'list_internal' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
                search: function(fields, success, error) {
                    $http.post(base_url + 'search' + remoteFactory.getTailUrl(), fields).success(success).error(error);
                },
            }
        }
    ])