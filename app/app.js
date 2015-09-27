'use strict';

var app = angular.module('Smg', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap',
    'home',
    'brand',
    'shop',
    'account',
    'user',
    'promotion',
    'header',
    'smg.services',
    'engagement',
    'smgDirectives',
    'lister',
    'ui.bootstrap.datetimepicker',
    'ui.date',
    'nvd3ChartDirectives',
    'placeholderShim',
    'angularFileUpload',
    'ui.slider',
    'checklist-model',
    'fundoo.services',
    'SPaging',
    'textarea-autoresize',
    'google-maps'
]);

angular.element(document).ready(function() {

    //first, we create the callback that will fire after the data is down
    function xhrCallback() {
        var myData = this.responseText; // the XHR output

        // here's where we attach a constant containing the API data to our app 
        // module. Don't forget to parse JSON, which `$http` normally does for you.
        app.constant('metaData', JSON.parse(myData));

        app.config(['$routeProvider', '$locationProvider', '$httpProvider',
            function($routeProvider, $locationProvider, $httpProvider) {

                var access = routingConfig.accessLevels;

                $routeProvider
                    .when('/', {
                        templateUrl: 'modules/home/template/home.html',
                        controller: 'HomeCtrl',
                        access: access.user
                    })
                    .when('/home/:brandId', {
                        templateUrl: 'modules/home/template/home.html',
                        controller: 'HomeCtrl',
                        access: access.user
                    })
                    .when('/login', {
                        templateUrl: 'modules/account/template/signin.html',
                        controller: 'SignInCtrl',
                        access: access.anon
                    })
                    .otherwise({
                        redirectTo: '/404'
                    });

                $httpProvider.defaults.useXDomain = true;
                delete $httpProvider.defaults.headers.common['X-Requested-With'];
                //delete $httpProvider.defaults.headers.post['Content-type']

                $httpProvider.interceptors.push(function($q, $location) {
                    return {
                        'responseError': function(response) {
                            if (response.status === 401 || response.status === 403) {
                                $location.path('/login');
                                return $q.reject(response);
                            } else {
                                return $q.reject(response);
                            }
                        }
                    }
                });

                $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

                // Override $http service's default transformRequest
                $httpProvider.defaults.transformRequest = [

                    function(data) {
                        /**
                         * The workhorse; converts an object to x-www-form-urlencoded serialization.
                         * @param {Object} obj
                         * @return {String}
                         */
                        var param = function(obj) {
                            var query = '';
                            var name, value, fullSubName, subName, subValue, innerObj, i;

                            for (name in obj) {
                                value = obj[name];

                                if (value instanceof Array) {
                                    for (i = 0; i < value.length; ++i) {
                                        subValue = value[i];
                                        fullSubName = name + '[' + i + ']';
                                        innerObj = {};
                                        innerObj[fullSubName] = subValue;
                                        query += param(innerObj) + '&';
                                    }
                                } else if (value instanceof Object) {
                                    for (subName in value) {
                                        subValue = value[subName];
                                        fullSubName = name + '[' + subName + ']';
                                        innerObj = {};
                                        innerObj[fullSubName] = subValue;
                                        query += param(innerObj) + '&';
                                    }
                                } else if (value !== undefined && value !== null) {
                                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                                }
                            }

                            return query.length ? query.substr(0, query.length - 1) : query;
                        };

                        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
                    }
                ];
            }
        ]);

        app.run(['$rootScope', '$location', '$http', 'Auth',
            function($rootScope, $location, $http, Auth) {
                $rootScope.$on("$routeChangeStart", function(event, next, current) {
                    $rootScope.error = null;                                        

                    if (!Auth.authorize(next.access)) {
                        // if (Auth.isLoggedIn())
                        //     $location.path('/');
                        // else
                        // {
                        $location.path('/login');
                        // }
                    }                    

                    var title = '';
                    //console.log(next.$$route.originalPath);
                    switch (next.$$route.originalPath)
                    {
                        case '/brand/infor/:brandId':
                            title = 'Brand';
                            break;                  
                        case '/brand/promotion/step4/:brandId':
                            title = 'Event';
                            break;
                        case '/brand/comment/:brandId':
                            title = 'Comment';
                            break;
                        case '/segmentation/:brandId':
                            title = 'Segmentation';
                            break;
                        case '/funnel/step2/:brandId':
                            title = 'Funnel';
                            break;
                        case '/user/manager/:brandId':
                            title = 'People';
                            break;
                        case '/user/notify-new/step4/:brandId':
                            title = 'Notification'
                            break;
                        case '/home/:brandId':
                            title = 'Home'
                            break;
                        default:
                            title = 'Innovation for you';
                    }

                    $rootScope.title = 'Infory - ' + title;
                });

            }
        ]);

        angular.bootstrap(document, ['Smg']);
    };

    //here, the basic mechanics of the XHR, which you can customize.
    var oReq = new XMLHttpRequest();
    oReq.onload = xhrCallback;
    oReq.open("get", "/json/metaData.json", true); // your specific API URL
    oReq.send();
});
// Define modules

angular.module('smg.services', []);

angular.module('smgDirectives', ['ui.date']);

angular.module('account', [
    'ngRoute'
]);

angular.module('brand', [
    'ngRoute', 'smg.services'
]);

angular.module('shop', [
    'ngRoute'
]);

angular.module('header', [
    'ngRoute'
]);

angular.module('sidebar', [
    'ngRoute'
]);

angular.module('home', [
    'ngRoute'
]);

angular.module('user', [
    'ngRoute'
]);

angular.module('promotion', [
    'ngRoute'
]);

angular.module('login', [
    'ngRoute'
]);


angular.module('engagement', [
    'ngRoute'
]);

angular.module('lister', [
    'ngRoute'
]);

angular.module('ui.bootstrap.datetimepicker', []);
angular.module('ui.date', []);
