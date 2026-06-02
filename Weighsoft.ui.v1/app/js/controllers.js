/* global MyLocalStorage, public_vars */

'use strict';
angular.module('xenon.controllers', []).
        controller('LogoutCtrl', function ($auth, $state, $rootScope) {
            $state.SystemLogout();
        }).
        controller('LockscreenCtrl', function ($scope, $rootScope) {
            $rootScope.isLoginPage = false;
            $rootScope.isLightLoginPage = false;
            $rootScope.authenticated = false;
            $rootScope.currentUser = null;
            localStorage.clear('user');
            $rootScope.isLockScreenPage = true;
            $rootScope.isMainPage = false;
        }).
//#region CompanyCtrl
        controller('CompanyCtrl', function ($scope, $rootScope, $state, Restangular) {
            $rootScope.company_id = 0;
            $rootScope.companies_infos = {};
            var company_infos = Restangular.all('company').getList();
            company_infos.then(function (data) {
                $rootScope.companies_infos = data;
            });
            $scope.CreateCompany = function () {
                $state.go('app.company_create');
            };
            $scope.ManageCompany = function (id) {
                $rootScope.company_id = id;
                $state.go('app.company_manage');
            };
        }).
        controller('CompanyCreateCtrl', function ($scope, $rootScope, $state, Restangular) {
            $scope.company_info = {};
            $scope.site_infos = {};
            $rootScope.userprofile_infos = $state.user_info;
            var user_getinfos = Restangular.all('userprofile').getList();
            user_getinfos.then(function (data) {
                $rootScope.userprofile_infos = data;
            });
            $scope.company_create = function () {
                var company_createinfo = Restangular.all('company').post($scope.company_info);
                company_createinfo.then(function (data) {
                    toastr.success('New Company Information Created', 'Success');
                    $state.go('app.companies');
                });
            };
            var site_getinfos = Restangular.all('site').getList();
            site_getinfos.then(function (data) {
                $scope.site_infos = data;
            });
            $scope.site_create = function () {
                $state.go('app.site_create');
            };
            $scope.CreateCompany_cancel = function () {
                $state.go('app.companies');
                toastr.error('User Information Not Created', 'Failed');
            };
            $scope.useredit = function (id) {
                $rootScope.user_id = id;
                $state.go('app.users_edit');
            };
        }).
        controller('CompanyManageCtrl', function ($scope, $rootScope, $state, Restangular) {
            $scope.company_info = {};
            $scope.site_infos = {};
            var user_getinfos = Restangular.all('company').get($rootScope.company_id);
            user_getinfos.then(function (data) {
                $scope.company_info = data;
            });
            $scope.company_update = function () {
                var user_updateinfos = Restangular.one('company').customPUT($scope.company_info, $scope.company_info.id);
                user_updateinfos.then(function (data)
                {
                    toastr.success('Company Information Updated', 'Success');
                    $state.go('app.companies');
                });
            };
            $scope.SiteUpdate = function (id) {
                $rootScope.site_id = id;
                $state.go('app.site_manage');
            };
            $scope.ManageCompany_cancel = function () {
                $state.go('app.companies');
                toastr.error('User Information Not Created', 'Failed');
            };
            $scope.useredit = function (id) {
                $rootScope.user_id = id;
                $state.go('app.users_edit');
            };
        }).
//#endregion
// #region SiteCtrl
        controller('SitesCtrl', function ($scope, $rootScope, $state, Restangular) {
            $scope.site_infos = {};
            var site_getinfos = Restangular.all('site').getList();
            site_getinfos.then(function (data) {
                $scope.site_infos = data;
            });
            $scope.site_create = function () {
                $state.go('app.site_create');
            };
            $scope.SiteUpdate = function (id) {
                $rootScope.site_id = id;
                $state.go('app.site_manage');
            };
        }).
        controller('SiteCreateCtrl', function ($scope, $rootScope, $state, Restangular) {
            $scope.site_infos = {};
            $scope.company_infos = {};
            var company_getinfos = Restangular.all('company').getList();
            company_getinfos.then(function (data) {
                $scope.company_infos = data;
            });
            $scope.site_infos.company_type = $state.user_info.company_type;
            $scope.SiteCreate = function () {
                var site_createinfos = Restangular.all('site').post($scope.site_infos);
                site_createinfos.then(function (data) {
                    toastr.success('Site Information Created', 'Success');
                    $state.go('app.sites');
                });
            };
            $scope.PointCreate = function () {
                $state.go('app.point_create');
            };
            $scope.SiteCreateCancel = function () {
                $state.go('app.sites');
                toastr.error('Site Information Not Created', 'Failed');
            };
        }).
        controller('SiteManageCtrl', function ($scope, $rootScope, $state, Restangular) {
            $scope.site_infos = {};
            $scope.company_infos = {};
            var site_getinfos = Restangular.all('site').get($rootScope.site_id);
            site_getinfos.then(function (data) {
                $scope.site_infos = data;
            });
            var company_getinfos = Restangular.all('company').getList();
            company_getinfos.then(function (data) {
                $scope.company_infos = data;
            });
            $scope.SiteUpdate = function () {
                var site_updateinfos = Restangular.one('site').customPUT($scope.site_infos, $scope.site_infos.id);
                site_updateinfos.then(function (data) {
                    toastr.success('Site Information Updated', 'Success');
                    //   $state.go('app.company_manage');
                });
            };
            $scope.PointUpdate = function (id) {
                $rootScope.point_id = id;
                $state.go('app.point_update');
            };
            $scope.SiteUpdateCancel = function () {
                $state.go('app.sites');
                toastr.error('Site Information Not Created', 'Failed');
            };
        }).
// #endregion
//#region WorkStationsCtrl
        controller('PointCreateCtrl', function ($scope, $rootScope, $state, Restangular) {
            $scope.site_infos = {};
            $scope.point_info = {};
            var site_getinfos = Restangular.all('site').getList();
            site_getinfos.then(function (data) {
                $scope.site_infos = data;
            });
            $scope.PointCreate = function () {
                var point_createinfos = Restangular.all('point').post($scope.point_info);
                point_createinfos.then(function (data) {
                    toastr.success('Work Station Information Created', 'Success');
                    $state.go('app.site_create');
                });
            }

            $scope.WeighbridgeCreate = function () {
                $state.go('app.weighbridge_create');
            }

            $scope.PointCreateCancel = function () {
                $state.go('app.site_create');
                toastr.error('Work Station Information Not Created', 'Failed');
            }
        }).
        controller('PointUpdateCtrl', function ($scope, $rootScope, $state, Restangular) {
            $scope.site_infos = {};
            $scope.point_info = {};
            var point_getinfos = Restangular.all('workstation').get($rootScope.point_id);
            point_getinfos.then(function (data) {
                $scope.point_info = data;
            });
            var site_getinfos = Restangular.all('site').getList();
            site_getinfos.then(function (data) {
                $scope.site_infos = data;
            });
            $scope.PointUpdate = function () {
                var point_updateinfos = Restangular.one('point').customPUT($scope.point_info, $scope.point_info.id);
                point_updateinfos.then(function (data) {
                    toastr.success('Work Station Information Updated', 'Success');
                    $state.go('app.site_manage');
                });
            };
            $scope.ManageWeighbridge = function (id) {
                $rootScope.weighbridge_id = id;
                $state.go('app.weighbridge_manage');
            };
            $scope.PointUpdateCancel = function () {
                $state.go('app.site_manage');
                toastr.error('Work Station Information Not Updated', 'Failed');
            };
        }).
//#endregion
//#region CameraCreateCtrl
        controller('CameraCreateCtrl', function ($scope, $rootScope, $state, Restangular) {
            $scope.weighbridge_infos = {};
            $scope.camera_infos = {};
            $scope.camera_infos.ip_address = '';
            var weighbridge_getinfos = Restangular.all('weighbridge').getList();
            weighbridge_getinfos.then(function (data) {
                $scope.weighbridge_infos = data;
            });
            $scope.CameraCreate = function () {
                var weighbridge_infos = Restangular.all('camera').post($scope.camera_infos);
                weighbridge_infos.then(function (data) {
                    toastr.success('Weighbridge Information Created', 'Success');
                    $state.go('app.weighbridge_create');
                });
            };
            $scope.CameraCreateCancel = function () {
                $state.go('app.weighbridge_create');
                toastr.error('Camera Information Not Created', 'Failed');
            };
        }).
        controller('CameraUpdateCtrl', function ($scope, $rootScope, $state, Restangular) {
            $scope.camera_info = {};
            $scope.weighbridge_infos = {};
            var camera_getinfo = Restangular.all('camera').get($rootScope.camera_id);
            camera_getinfo.then(function (data) {
                $scope.camera_info = data;
            });
            var weighbridge_getinfos = Restangular.all('weighbridge').getList();
            weighbridge_getinfos.then(function (data) {
                $scope.weighbridge_infos = data;
            });
            $scope.CameraUpdate = function () {
                var camera_updateinfos = Restangular.one('camera').customPUT($scope.camera_info, $scope.camera_info.id);
                camera_updateinfos.then(function (data) {
                    toastr.success('Camera Information Updated', 'Success');
                    $state.go('app.weighbridge_manage');
                });
            };
            $scope.CameraUpdateCancel = function () {
                $state.go('app.weighbridge_manage');
                toastr.error('Camera Information Not Updated', 'Failed');
            };
        }).
//#endregion
//#region MainSiteAddons
        controller('SidebarMenuCtrl', function ($scope, $rootScope, $menuItems, $timeout, $location, $state, $layout) {
            // Menu Items
            var $sidebarMenuItems = $menuItems.instantiate();
            $scope.menuItems = ($state.user_info !== null ? $sidebarMenuItems.prepareSidebarMenu($state.user_info.permission).getAll() : []);
            // Set Active Menu Item
            $sidebarMenuItems.setActive($location.path());
            $rootScope.$on('$stateChangeSuccess', function () {
                $sidebarMenuItems.setActive($state.current.name);
            });
            // Trigger menu setup
            public_vars.$sidebarMenu = public_vars.$body.find('.sidebar-menu');
            $timeout(setup_sidebar_menu, 1);
            ps_init(); // perfect scrollbar for sidebar
        }).
        controller('HorizontalMenuCtrl', function ($scope, $rootScope, $menuItems, $timeout, $location, $state) {
            var $horizontalMenuItems = $menuItems.instantiate();
            $scope.menuItems = $horizontalMenuItems.prepareHorizontalMenu().getAll();
            // Set Active Menu Item
            $horizontalMenuItems.setActive($location.path());
            $rootScope.$on('$stateChangeSuccess', function () {
                $horizontalMenuItems.setActive($state.current.name);
                $(".navbar.horizontal-menu .navbar-nav .hover").removeClass('hover'); // Close Submenus when item is selected
            });
            // Trigger menu setup
            $timeout(setup_horizontal_menu, 1);
        });
//#endregion
