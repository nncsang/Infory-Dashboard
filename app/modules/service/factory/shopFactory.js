angular.module('smg.services')
    .factory('shopFactory', ['$http',
        function($http) {
            var data = {
                shop_id: -1,
                brand_id: -1
            }

            return {
                setData: function(newData) {
                    data = newData;
                },
                getData: function(shopId, brandId) {
                    if (data.shop_id == shopId && data.brand_id == brandId)
                        return data;
                    else
                        return null;
                }
            }
        }
    ])