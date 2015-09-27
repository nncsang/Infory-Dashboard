angular.module('smg.services')
    .factory('commentFactory',
        function() {

            var data = {
                brand_id: -1,
            };

            return {
                getData: function(brand_id) {
                    if (data.brand_id == brand_id)
                        return data;
                    else
                        return null;
                },
                setData: function(newData) {
                    data = newData;
                }
            }

        })