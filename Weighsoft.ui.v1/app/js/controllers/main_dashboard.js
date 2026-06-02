'use strict';
angular
    .module('xenon.controllers')
    .controller('MainDashboard', function ($rootScope, $state, $interval, $weighservice, $scope, $q, Restangular) {
        $rootScope.isLoginPage = false;
        $rootScope.isLightLoginPage = false;
        $rootScope.isLockScreenPage = false;
        $rootScope.isMainPage = true;
        $rootScope.user_id = 0;
        var vm = this;
        vm.HeaderSingle = {
            company_id: null,
            site_id: null,
            workstation_id: null
        }

        if ($state.Settings === null || $state.Settings === undefined) {
            $state.Settings = {
                Company: {},
                Site: {},
                Workstation: {},
                Weighbridge: {}
            };
        }

        var MainObjectProperties = {};
        var MainControls = [];
        if ($rootScope.company_id === null || $rootScope.company_id === undefined) {
            MainControls.push({
                key: "company_id",
                type: "select",
                titleMap: [
                    {value: 1, name: "No"},
                    {value: 2, name: "Yes"}
                ],
                onChange: "SelectOnChange('site')"
            });
            MainObjectProperties.company_id = {
                type: "number", title: "Company", description: ""
            }
        } else {
            $state.Settings.Site = {company: $rootScope.company_id};
            vm.HeaderSingle.company_id = $state.Settings.Site.company;
        }
        if ($rootScope.site_id === null || $rootScope.site_id === undefined) {
            MainControls.push({
                key: "site_id",
                type: "select",
                titleMap: [
                    {value: 1, name: "No"},
                    {value: 2, name: "Yes"}
                ],
                onChange: "SelectOnChange('workstation')"
            });
            MainObjectProperties.company_id = {
                type: "number", title: "Site", description: ""
            }
        } else {
            $state.Settings.Workstation = {company: vm.HeaderSingle.company_id, site: $rootScope.site_id};
            vm.HeaderSingle.site_id = $state.Settings.Workstation.site;
        }
        var SubControls = [];
        if ($rootScope.workstation_id === null || $rootScope.workstation_id === undefined) {
            SubControls.push({
                key: "workstation_id",
                type: "select",
                titleMap: [
                    {value: 1, name: "No"},
                    {value: 2, name: "Yes"}
                ],
                onChange: "SelectOnChange('weighbridge')"
            });
            MainObjectProperties.workstation_id = {
                type: "number", title: "Work Station", description: ""
            }
        } else {
            $state.Settings.Weighbridge = {company: vm.HeaderSingle.company_id, site: vm.HeaderSingle.site_id, workstation: $rootScope.workstation_id};
            vm.HeaderSingle.workstation_id = $state.Settings.Weighbridge.workstation;
        }

        vm.load = function () {
            vm.hasData = true;
            vm.FormDisplay = false;
            vm.Single = {};
            vm.headerSchema = {
                type: "object",
                properties: MainObjectProperties
            };
            vm.weighbridges = [];
            $scope.Functions = {
                Company: function () {
                    var deferred = $q.defer();
                    if ($rootScope.company_id === null || $rootScope.company_id === undefined) {
                        Restangular.all("company").getList($state.Settings.Company).then(function (data) {
                            var titleMap = [];
                            data.forEach(function (mapData) {
                                titleMap.push({
                                    value: mapData.id,
                                    name: mapData.registered_name + ' (' + mapData.code + ')'
                                });
                            });
                            vm.HeaderSingle.company_id = $state.Settings.Site.company;
                            deferred.resolve({data: {message: "Company Success!"}});
                        }, function (response) {
                            deferred.reject({data: {message: response}});
                        });
                    } else {
                        setTimeout(function () {
                            deferred.resolve({data: {message: "Company Success!"}});
                        }, 100);
                    }
                    return deferred.promise;
                },
                Site: function () {
                    var deferred = $q.defer();
                    if ($rootScope.site_id === null || $rootScope.site_id === undefined) {
                        Restangular.all("site").getList($state.Settings.Site).then(function (data) {
                            var titleMap = [];
                            data.forEach(function (mapData) {
                                titleMap.push({value: mapData.id, name: mapData.site_name + ' (' + mapData.site_type + ')'});
                            });
                            vm.HeaderSingle.site_id = $state.Settings.Workstation.site;
                            deferred.resolve({message: "Site Success!"});
                        }, function (response) {
                            deferred.reject({data: {message: response}});
                        });
                    } else {
                        setTimeout(function () {
                            deferred.resolve({data: {message: "Site Success!"}});
                        }, 100);
                    }
                    return deferred.promise;
                },
                Workstation: function () {
                    var deferred = $q.defer();
                    if ($rootScope.workstation_id === null || $rootScope.workstation_id === undefined) {
                        Restangular.all("workstation").getList($state.Settings.Workstation).then(function (data) {
                            var titleMap = [];
                            data.forEach(function (mapData) {
                                titleMap.push({value: mapData.id, name: mapData.workstation_name + ' (' + mapData.workstation_type + ')'});
                            });
                            vm.headerForm[1].items[0].titleMap = titleMap;
                            vm.HeaderSingle.workstation_id = $state.Settings.Weighbridge.workstation;
                            deferred.resolve({data: {message: "Workstation Success!"}});
                        }, function (response) {
                            deferred.reject({data: {message: response}});
                        });
                    } else {
                        setTimeout(function () {
                            deferred.resolve({data: {message: "Workstation Success!"}});
                        }, 100);
                    }
                    return deferred.promise;
                },
                Weighbridge: function () {
                    var deferred = $q.defer();
                    Restangular.all("weighbridge").getList($state.Settings.Weighbridge).then(function (data) {
                        vm.weighbridges = [];
                        data.forEach(function (d) {
                            vm.weighbridges.push(d);
                            $weighservice.Run(d.weighbridges_name, d, vm.weighbridges[vm.weighbridges.indexOf(d)]);
                        });
                        deferred.resolve({data: {message: "Weighbridge Success!"}});
                    }, function (response) {
                        deferred.reject({data: {message: response}});
                    });
                    return deferred.promise;
                },
                HeadAll: function () {
                    $rootScope.Start("All on HeadCtrl");
                    $rootScope.Loaded("All fix on HeadCtrl");
                    $scope.Functions.Company().then(function (value) {
                        $scope.Functions.Site().then(function (value) {
                            $scope.Functions.Workstation().then(function (value) {
                                $scope.Functions.Weighbridge().then(function (value) {
                                    $rootScope.Loaded("All on HeadCtrl");
                                }, function (response) {
                                    $rootScope.Error(response);
                                });
                            }, function (response) {
                                $rootScope.Error(response);
                            });
                        }, function (response) {
                            $rootScope.Error(response);
                        });
                    }, function (response) {
                        $rootScope.Error(response);
                    });
                },
                Single: function (type) {
                    $rootScope.Start("Single on MainDashboardCtrl");
                    switch (type) {
                        case 'company':
                            $scope.Functions.Company().then(function (value) {
                                $rootScope.Loaded("Single company on MainDashboardCtrl");
                            }, function (response) {
                                $rootScope.Error(response);
                            });
                            break;
                        case 'site':
                            $scope.Functions.Site().then(function (value) {
                                $rootScope.Loaded("Single Site on MainDashboardCtrl");
                            }, function (response) {
                                $rootScope.Error(response);
                            });
                            break;
                        case 'workstation':
                            $scope.Functions.Workstation().then(function (value) {
                                $rootScope.Loaded("Single Workstation on MainDashboardCtrl");
                            }, function (response) {
                                $rootScope.Error(response);
                            });
                            break;
                        case 'weighbridge':
                            $scope.Functions.Weighbridge().then(function (value) {
                                $rootScope.Loaded("Single weighbridge on MainDashboardCtrl");
                            }, function (response) {
                                $rootScope.Error(response);
                            });
                            break;
                    }
                }
            };
            $scope.Functions.HeadAll();
            $scope.SelectOnChange = function (type, e) {
                switch (type) {
                    case 'site':
                        $state.Settings.Site = {company: vm.HeaderSingle.company_id};
                        vm.HeaderSingle.company_id = $state.Settings.Site.company;
                        break;
                    case 'workstation':
                        $state.Settings.Workstation = {company: vm.HeaderSingle.company_id, site: vm.HeaderSingle.site_id};
                        vm.HeaderSingle.site_id = $state.Settings.Workstation.site;
                        break;
                    case 'weighbridge':
                        $state.Settings.Weighbridge = {company: vm.HeaderSingle.company_id, site: vm.HeaderSingle.site_id, workstation: vm.HeaderSingle.workstation_id};
                        vm.HeaderSingle.workstation_id = $state.Settings.Weighbridge.workstation;
                        break;
                }
                $scope.Functions.Single(type);
            };
            vm.Disconnect = function () {
                var Bridge = "UPPER EAST";
                var ComPort = "COM4";
                var Url = "192.168.0.15:11000";
                var RegExString = "([0-9]{6})";
                if ($weighservice.status[Bridge] === null || $weighservice.status[Bridge] === undefined) {
                    $weighservice.Run(Bridge, ComPort, Url, RegExString, vm.weighbridges[0]);
                } else {
                    $weighservice.dispose(ComPort);
                }
            };

            vm.country = {};
            vm.headerForm = [
                {
                    "type": "section",
                    "htmlClass": "col-md-4",
                    "items": MainControls
                },
                {
                    "type": "section",
                    "htmlClass": "col-md-4",
                    "items": SubControls
                }
            ];
            vm.formData = [
                {reg_number: "FBG551FS", weighbridge: "Upper East", status: "Open", updated_at: "2016-01-21 08:12:22"},
                {reg_number: "DGD782FS", weighbridge: "Upper West", status: "Open", updated_at: "2016-01-21 10:32:52"},
                {reg_number: "HJD787FS", weighbridge: "Lower East", status: "Open", updated_at: "2016-01-21 11:12:52"},
                {reg_number: "HJD289FS", weighbridge: "Upper East", status: "Open", updated_at: "2016-01-21 12:42:22"}
            ];
        }
    });
