angular.module('smg.services')
    .factory('brandFactory', ['$http',
        function($http) {
            var data = {
                brand_id: -1
            }

            return {
                setData: function(newData) {
                    data = newData;
                },
                getData: function(brandId) {
                    if (data.brand_id == brandId)
                        return data;
                    else
                        return null;
                }
            }
        }
    ])