angular.module('smg.services')
    .factory('userManagerFactory', ['$http',
        function($http) {
            var data = {
                brand_id: -1
            }

            return {
                setData: function(newData) {
                    data = newData;
                },
                getData: function(id) {
                    if (data.brand_id == id)
                        return data;
                    else
                        return null;
                }
            }
        }
    ])