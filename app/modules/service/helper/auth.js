'use strict';

angular.module('Smg')
    .factory('Auth', ['$http', '$cookieStore', '$document', /*'accountRemote', */ 'cookie',
        function($http, $cookieStore, $document, /*accountRemote, */ cookie) {
            function changeUser(user) {
                _.extend(currentUser, user);
            };

            // Lấy danh sách accessLevels và userRoles ở file js/routingConfig.
            var accessLevels = routingConfig.accessLevels,
                userRoles = routingConfig.userRoles;

            var currentUser = {
                username: '',
                role: userRoles.public
            };

            if (cookie.getCookie('access_token')) {
                var role = userRoles.public;

                switch (cookie.getCookie('role')) {
                    case 'user':
                        role = userRoles.user;
                        break;
                    case 'admin':
                        role = userRoles.admin;
                        break;
                }

                currentUser = {
                    name: cookie.getCookie('name'),
                    username: cookie.getCookie('user'),
                    role: role,
                    access_token: cookie.getCookie('access_token')
                }
            }

            var loginRoute = "http://dev2.smartguide.vn/dashboard/auth";
            var logoutRoute = "http://dev2.smartguide.vn/dashboard/api/v1/logout";

            return {
                authorize: function(accessLevel, role) {
                    if (role === undefined)
                        role = currentUser.role;

                    return accessLevel.bitMask & role.bitMask;
                },
                isLoggedIn: function(user) {
                    if (user === undefined)
                        user = currentUser;
                    return user.role.title == userRoles.user.title || user.role.title == userRoles.admin.title;
                },
                login: function(user, success, error) {
                    var rememberme = user.rememberme;

                    $http.post(loginRoute, user)
                        .success(function(res) {
                            if (res.status) {
                                var user = {
                                    name: res.data.name,
                                    username: res.data.username,
                                    role: res.data.role,
                                    access_token: res.data.access_token
                                };

                                cookie.deleteCookie('name');
                                cookie.deleteCookie('user');
                                cookie.deleteCookie('access_token');
                                cookie.deleteCookie('role');

                                if (rememberme) {
                                    var expires = 7;
                                    cookie.setCookie('name', user.name, expires);
                                    cookie.setCookie('user', user.username, expires);
                                    cookie.setCookie('access_token', user.access_token, expires);
                                    cookie.setCookie('role', user.role.title, expires);
                                } else {
                                    cookie.setCookie('name', user.name, expires);
                                    cookie.setCookie('user', user.username, expires);
                                    $cookieStore.put('access_token', user.access_token);
                                    $cookieStore.put('role', user.role.title);
                                }

                                changeUser(user);
                                success(user);
                            } else {
                                error(res.message);
                            }
                        })
                        .error(error);
                },

                logout: function(success, error) {
                    var user = {
                        username: currentUser.username,
                        dashboard_token: currentUser.access_token
                    };

                    $http.post(logoutRoute + "?dashboard_token=" + user.dashboard_token, user)
                        .success(function(res) {
                            if (res.status) {
                                cookie.deleteCookie('user');
                                cookie.deleteCookie('role');
                                cookie.deleteCookie('access_token');
                            }

                            changeUser({
                                username: '',
                                role: userRoles.public
                            });

                            success();
                        })
                        .error(error);
                },

                accessLevels: accessLevels,
                userRoles: userRoles,
                user: currentUser
            };
        }
    ]);