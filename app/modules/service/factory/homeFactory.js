angular.module('smg.services')
    .factory('homeFactory', ['$http',
        function($http) {
            var homeData = {
                id: -1,
                fields: null,
                event_bookmarks: null,
                event_bookmark: null,
                data_chart: null,
                data: null,
                time_unit_1: null,
                time_unit_2: null,
                time_unit_3: null,
                time_unit_4: null,
                compare_unit: null
            };

            var bundle = {
                id: -1
            }

            return {
                setHomeData: function(newData) {
                    bundle = newData;
                },
                getHomeData: function(id) {
                    if (bundle.id == id)
                        return bundle;
                    else
                        null;
                },
                addEventBookmark: function(id, bookmark) {
                    if (homeData.id == id) {
                        homeData.event_bookmarks.push(bookmark);
                    }
                }
            }
        }
    ])