angular.module('smg.services')
    .factory('remoteFactory', ['$http', 'Auth', 'metaData',
        function($http, Auth, metaData) {
            var mode = 'dev';
            var domain = (mode == 'dev') ? 'http://dev2.smartguide.vn/' : 'https://api.infory.vn/'
            var base_url = domain + "dashboard/api/v1/";

            return {
                getTailUrl: function() {
                    return '?dashboard_token=' + Auth.user.access_token;
                },
                getBaseUrl: function() {
                    return base_url;
                },

                domain: domain,

                meta_property_types: metaData.meta_property_types,

                meta_lists: metaData.meta_lists,

                meta_profile: metaData.meta_profile,

                meta_events: metaData.meta_events,

                cities: metaData.cities,

                groupShop: metaData.group_shop
            };
        }
    ]);