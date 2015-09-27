angular.module('smg.services')
    .factory('funnelFactory', ['$http',
        function($http) {
            var data = [null, null];

            return {
                setData: function(id, newData) {
                    data[id] = newData;
                },
                getData: function(id, brand_id) {
                    if (data[id] != null && data[id].brand_id == brand_id)
                        return data[id];
                    else
                        return null;
                },
            }
        }
    ])
