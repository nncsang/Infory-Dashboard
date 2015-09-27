'use strict';

angular.module('Smg')
    .factory('cookie', ['$cookieStore', '$document',
        function($cookieStore, $document) {

            function normalize(str) {
                if (str[0] == '%')
                    return str.substr(3, str.length - 6);
                else
                    return str;
            }

            return {
                deleteCookie: function(name) {
                    $document.context.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                },

                setCookie: function(cname, cvalue, exdays) {
                    var d = new Date();
                    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                    var expires = "expires=" + d.toGMTString();
                    if (exdays != 0)
                        $document.context.cookie = cname + "=" + cvalue + "; " + expires;
                    else
                        $document.context.cookie = cname + "=" + cvalue + ";";
                },

                getCookie: function(cname) {
                    var name = cname + "=";
                    var ca = $document.context.cookie.split(';');
                    for (var i = 0; i < ca.length; i++) {
                        var c = ca[i].trim();
                        if (c.indexOf(name) == 0) return normalize(c.substring(name.length, c.length));
                    }

                    return "";
                }
            }
        }
    ]);