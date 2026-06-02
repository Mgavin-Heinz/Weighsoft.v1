'use strict';
angular
    .module('xenon.controllers')
    .controller('RFIDVehiclesCtrl', function ($scope, $navigation, $rootScope, $q, $Functions, Restangular) {
        $rootScope.Start();
        var vm = this;
        var routeName = 'rfidvehicle';
        var ObjectProperties = {
            company_id: {
                type: "number", title: "Company", description: ""
            },
            site_id: {
                type: "number", title: "Site", description: ""
            },
            registration_number: {type: "string", title: "Registration Number", description: ""},
            rfid: {type: "string", title: "RF ID Number", description: ""},
            haulier_id: {type: "number", title: "Haulier", description: ""}
        };
        var EmptyObject = {company_id: "", site_id: "", registration_number: "", rfid: "", haulier_id: "", actiontype: "New"};
        vm.load = function () {
            vm.hasData = false;
            vm.FormDisplay = false;
            vm.Single = {};
            vm.HeaderSingle = {company_id: null, site_id: null};
            vm.schema = {
                type: "object",
                properties: ObjectProperties
            };
            
            vm.getData = function(type){
                switch(type){
                    case "company":
                        $Functions.Company().then(function(companyList){
                            vm.Companies = companyList;
                            if(vm.Companies.length == 1){
                                vm.HeaderSingle.company_id = vm.Companies[0].value;
                                vm.getData('site');
                            }
                            $rootScope.Loaded("Single Company on RFIDVehiclesCtrl");
                        }, function(response){
                            $rootScope.Error(response);
                        });
                        break;
                    case "site":
                        $navigation.Company(vm.HeaderSingle.company_id);
                        $Functions.Site().then(function(siteList){
                            vm.Sites = siteList;
                            if(vm.Sites.length == 1){
                                vm.HeaderSingle.site_id = vm.Sites[0].value;
                                vm.getData('RFIDVehicles');
                            }
                            $rootScope.Loaded("Single Site on RFIDVehiclesCtrl");
                        }, function(response){
                            $rootScope.Error(response);
                        });
                        break;
                    case 'hauliers':
                        $navigation.Site(vm.HeaderSingle.site_id);
                        return $Functions.Haulier().then(function(Hauliers){
                            vm.Hauliers = Hauliers;
                            $rootScope.Loaded("Hauliers loaded");
                            return Hauliers;
                        }, function(response){
                            $rootScope.Error(response);
                            throw response;
                        });
                    case 'RFIDVehicles':
                        $navigation.Site(vm.HeaderSingle.site_id);
                        $Functions.RFIDVehicle().then(function(RFIDVehicles){
                            vm.formData = RFIDVehicles;
                            vm.hasData = (RFIDVehicles.length > 0);
                            $rootScope.Loaded("Single Site on RFIDVehicles");
                        }, function(response){
                            $rootScope.Error(response);
                        });
                        break;
                }
            }
            vm.baseData = Restangular.all(routeName);
            vm.LoadData = function () {
                $navigation.clear();
                $Functions.Users().then(function(user){
                    vm.User = user;
                    vm.getData('company');
                    if(vm.HeaderSingle.company_id !== null){
                        vm.getData('site');
                    }
                    if(vm.HeaderSingle.site_id !== null){
                        vm.getData('hauliers');
                        vm.getData('RFIDVehicles');
                    }
                    $navigation.clear();
                    vm.Single = null;
                    vm.FormDisplay = false;
                    $rootScope.Loaded();
                });
            };
            vm.LoadData();
            vm.Single = null;
            
            vm.buildForm = function(){
                console.log('[RFIDVehicles] buildForm called');
                console.log('[RFIDVehicles] Building form with', vm.Hauliers ? vm.Hauliers.length : 0, 'Hauliers');
                
                // Build Haulier titleMap
                var haulierTitleMap = [];
                if (vm.Hauliers && vm.Hauliers.length > 0) {
                    vm.Hauliers.forEach(function(haulier) {
                        haulierTitleMap.push({
                            value: haulier.value, 
                            name: haulier.name
                        });
                    });
                }
                
                vm.form = [
                    "registration_number",
                    "rfid",
                    {
                        key: "haulier_id",
                        type: "select",
                        titleMap: haulierTitleMap
                    },
                    {
                        "type": "section",
                        "htmlClass": "row",
                        "items": [
                            {type: 'submit', icon: 'glyphicon glyphicon-save', "htmlClass": "col-xs-6", style: 'btn-black', title: 'Save'},
                            {type: 'button', icon: 'glyphicon glyphicon-icon-exclamation-sign', "htmlClass": "col-xs-6", style: 'btn-danger pull-right', title: 'Cancel', onClick: function () {
                                vm.cancel();
                            }}
                        ]
                    }
                ];
            };
            
            vm.addForm = function () {
                console.log('[RFIDVehicles] addForm called');
                console.log('[RFIDVehicles] Hauliers count:', vm.Hauliers ? vm.Hauliers.length : 0);
                
                // Ensure Hauliers are loaded before building form
                if (!vm.Hauliers || vm.Hauliers.length === 0) {
                    console.log('[RFIDVehicles] Hauliers not loaded, loading now...');
                    $rootScope.Start();
                    vm.getData('hauliers').then(function() {
                        console.log('[RFIDVehicles] Hauliers loaded:', vm.Hauliers.length);
                        vm.buildForm();
                        vm.FormDisplay = true;
                        vm.Single = JSON.parse(JSON.stringify(EmptyObject));
                        $rootScope.Loaded();
                    });
                } else {
                    vm.buildForm();
                    vm.FormDisplay = true;
                    vm.Single = JSON.parse(JSON.stringify(EmptyObject));
                }
            };
            vm.save = function (data) {
                $rootScope.Start();
                if (!data.$valid) {
                    return;
                }
                if (vm.Single.actiontype !== null && vm.Single.actiontype === "New") {
                    vm.Single.company_id = vm.HeaderSingle.company_id;
                    vm.Single.site_id = vm.HeaderSingle.site_id;
                    
                    vm.baseData.post(vm.Single).then(function () {
                        vm.LoadData();
                    }, function (response) {
                        $rootScope.Error(response);
                    });
                } else {
                    vm.Single.save().then(function () {
                        vm.LoadData();
                    }, function (response) {
                        $rootScope.Error(response);
                    });
                }
            };
            vm.cancel = function () {
                vm.FormDisplay = false;
            };
            vm.editForm = function (data) {
                console.log('[RFIDVehicles] editForm called for:', data.registration_number);
                console.log('[RFIDVehicles] Hauliers count:', vm.Hauliers ? vm.Hauliers.length : 0);
                
                $rootScope.Start();
                
                // Ensure Hauliers are loaded before building form
                var loadHauliersPromise;
                if (!vm.Hauliers || vm.Hauliers.length === 0) {
                    console.log('[RFIDVehicles] Hauliers not loaded, loading now...');
                    loadHauliersPromise = vm.getData('hauliers');
                } else {
                    // Already loaded, create a resolved promise
                    loadHauliersPromise = $q.when(vm.Hauliers);
                }
                
                // Wait for both Hauliers and RFID Vehicle data
                loadHauliersPromise.then(function() {
                    console.log('[RFIDVehicles] Hauliers ready:', vm.Hauliers.length);
                    return Restangular.one(routeName, data.id).get();
                }).then(function (dat) {
                    vm.Single = dat;
                    vm.buildForm();  // Rebuild form with loaded Hauliers
                    vm.FormDisplay = true;
                    $rootScope.Loaded();
                }, function (response) {
                    $rootScope.Error(response);
                });
            };
            vm.delete = function (data) {
                if (window.confirm("Are you sure?")) {
                    $rootScope.Start();
                    Restangular.one(routeName, data.id).get().then(function (dat) {
                        dat.remove().then(function () {
                            vm.LoadData();
                        }, function (response) {
                            $rootScope.Error(response);
                        });
                    });
                }
                vm.FormDisplay = false;
            };
            vm.changeCompanyID = function(){
                $navigation.Company(vm.HeaderSingle.company_id);
                vm.LoadData();
            };
            vm.changeSiteID = function(){
                $navigation.Site(vm.HeaderSingle.site_id);
                vm.LoadData();
            };
        };
    });
