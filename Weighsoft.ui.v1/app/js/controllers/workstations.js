'use strict';
angular
        .module('xenon.controllers')
        .controller('WorkStationsCtrl', function($scope, $rootScope, $navigation, $Functions, Restangular, $q, $esp32Control){
            $rootScope.Start();
            var vm = this;
            var routeName = 'workstation';
            vm.schema = {
                type: "object",
                properties: {
                    company_id: {
                        type: "string", title: "Company",
                    },
                    site_id: {
                        type: "string", title: "Site",
                    },
                    workstation_type: {
                        type: "string", title: "Workstation Code",
                    },
                    workstation_name: {
                        type: "string", title: "Workstation Name",
                    },
                    workstation_active: {
                        type: "string", title: "Active", enum: ["true", "false"],
                    },
                    scale_endpoint: {
                        type: "string", title: "Scale Endpoint (host:port)",
                    },
                    incoming_boom_ip: {
                        type: "string", title: "Incoming Boom IP",
                    },
                    incoming_boom_relay: {
                        type: "number", title: "Incoming Boom Relay (1-8)", enum: [1, 2, 3, 4, 5, 6, 7, 8]
                    },
                    exiting_boom_ip: {
                        type: "string", title: "Exiting Boom IP",
                    },
                    exiting_boom_relay: {
                        type: "number", title: "Exiting Boom Relay (1-8)", enum: [1, 2, 3, 4, 5, 6, 7, 8]
                    },
                    incoming_red_light_ip: {
                        type: "string", title: "Incoming Red Light IP",
                    },
                    incoming_red_light_relay: {
                        type: "number", title: "Incoming Red Light Relay (1-8)", enum: [1, 2, 3, 4, 5, 6, 7, 8]
                    },
                    incoming_green_light_ip: {
                        type: "string", title: "Incoming Green Light IP",
                    },
                    incoming_green_light_relay: {
                        type: "number", title: "Incoming Green Light Relay (1-8)", enum: [1, 2, 3, 4, 5, 6, 7, 8]
                    },
                    exiting_red_light_ip: {
                        type: "string", title: "Exiting Red Light IP",
                    },
                    exiting_red_light_relay: {
                        type: "number", title: "Exiting Red Light Relay (1-8)", enum: [1, 2, 3, 4, 5, 6, 7, 8]
                    },
                    exiting_green_light_ip: {
                        type: "string", title: "Exiting Green Light IP",
                    },
                    exiting_green_light_relay: {
                        type: "number", title: "Exiting Green Light Relay (1-8)", enum: [1, 2, 3, 4, 5, 6, 7, 8]
                    },
                },
            };
            vm.form = [
                "workstation_type",
                "workstation_name",
                {
                    key: "workstation_active",
                    type: "radiobuttons",
                    style: {
                        selected: "btn-black",
                        unselected: "btn-danger"
                    },
                    titleMap: [
                        {value: "false", name: "No"},
                        {value: "true", name: "Yes"}
                    ]
                },
                {
                    key: "scale_endpoint",
                    placeholder: "e.g., 192.168.1.48:3000"
                },
                {
                    type: "fieldset",
                    title: "ESP32 Boom & Light Control Settings",
                    items: [
                        {
                            type: "section",
                            htmlClass: "row",
                            items: [
                                {key: "incoming_boom_ip", htmlClass: "col-xs-6", placeholder: "e.g., 10.159.66.202"},
                                {key: "incoming_boom_relay", htmlClass: "col-xs-6", placeholder: "1-8"}
                            ]
                        },
                        {
                            type: "section",
                            htmlClass: "row",
                            items: [
                                {key: "exiting_boom_ip", htmlClass: "col-xs-6", placeholder: "e.g., 10.159.66.202"},
                                {key: "exiting_boom_relay", htmlClass: "col-xs-6", placeholder: "1-8"}
                            ]
                        },
                        {
                            type: "section",
                            htmlClass: "row",
                            items: [
                                {key: "incoming_red_light_ip", htmlClass: "col-xs-6", placeholder: "e.g., 10.159.66.202"},
                                {key: "incoming_red_light_relay", htmlClass: "col-xs-6", placeholder: "1-8"}
                            ]
                        },
                        {
                            type: "section",
                            htmlClass: "row",
                            items: [
                                {key: "incoming_green_light_ip", htmlClass: "col-xs-6", placeholder: "e.g., 10.159.66.202"},
                                {key: "incoming_green_light_relay", htmlClass: "col-xs-6", placeholder: "1-8"}
                            ]
                        },
                        {
                            type: "section",
                            htmlClass: "row",
                            items: [
                                {key: "exiting_red_light_ip", htmlClass: "col-xs-6", placeholder: "e.g., 10.159.66.202"},
                                {key: "exiting_red_light_relay", htmlClass: "col-xs-6", placeholder: "1-8"}
                            ]
                        },
                        {
                            type: "section",
                            htmlClass: "row",
                            items: [
                                {key: "exiting_green_light_ip", htmlClass: "col-xs-6", placeholder: "e.g., 10.159.66.202"},
                                {key: "exiting_green_light_relay", htmlClass: "col-xs-6", placeholder: "1-8"}
                            ]
                        }
                    ]
                },
                {
                    type: "section",
                    htmlClass: "row",
                    items: [
                        {type: 'submit', icon: 'glyphicon glyphicon-save', htmlClass: "col-xs-6", style: 'btn-black', title: 'Save'},
                        {type: 'button', icon: 'glyphicon glyphicon-icon-exclamation-sign', htmlClass: "col-xs-6", style: 'btn-danger pull-right',
                            title: 'Cancel', onClick: function(){
                                vm.isEditing = false;
                            }}
                    ]
                }
            ];
            vm.baseData = Restangular.all(routeName);
            vm.isEditing = false;
            vm.companyList = [];
            vm.siteList = [];
            vm.HeaderSingle = {
                company_id: null,
                site_id: null,
            };
            function loadData(){
                $Functions.Users().then(function(user){
                    vm.isEditing = false;
                    $Functions.Company().then(function(companyList){
                        vm.companyList = companyList;
                        $rootScope.Loaded();
                    }, function(response){
                        $rootScope.Error(response);
                    });
                    if(vm.HeaderSingle.company_id !== null){
                        loadList('company');
                    }
                    if(vm.HeaderSingle.site_id !== null){
                        loadList('site');
                    }
                });
            }
            ;
            function loadList(type){
                $rootScope.Start();
                switch(type){
                    case 'company':
                        $Functions.Site().then(function(value){
                            vm.siteList = value;
                            $rootScope.Loaded();
                        }, function(response){
                            $rootScope.Error(response);
                        });
                        break;
                    case 'site':
                        $Functions.WorkstationList().then(function(value){
                            vm.workstationList = value;
                            $rootScope.Loaded();
                        }, function(response){
                            $rootScope.Error(response);
                        });
                        break;
                }
            }

            vm.changeCompany = function(){
                vm.HeaderSingle.site_id = null;
                $navigation.Company(vm.HeaderSingle.company_id);
                $Functions.Site(vm.HeaderSingle.company_id).then(function(siteList){
                    vm.siteList = siteList;
                });
            };
            vm.showAddForm = function(){
                if(!vm.HeaderSingle.company_id || !vm.HeaderSingle.site_id){
                    return;
                }

                vm.isEditing = true;
                vm.workstationInfo = {
                    company_id: parseInt(vm.HeaderSingle.company_id),
                    site_id: parseInt(vm.HeaderSingle.site_id),
                };
                
                // Clear workstation_id from $rootScope.Params when adding new
                if ($rootScope.Params) {
                    $rootScope.Params.workstation_id = null;
                }
            };
            vm.showEditForm = function(workstation){
                $rootScope.Start();
                Restangular.one(routeName, workstation.value).get().then(function(workstationInfo){
                    vm.workstationInfo = workstationInfo;
                    vm.isEditing = true;
                    
                    // Set workstation_id in $rootScope.Params to trigger ESP32 control sidebar
                    if (!$rootScope.Params) {
                        $rootScope.Params = {};
                    }
                    $rootScope.Params.workstation_id = workstationInfo.id;
                    
                    $rootScope.Loaded();
                }, function(response){
                    $rootScope.Error(response);
                });
            };
            vm.saveForm = function(formData){
                if(!formData.$valid){
                    return;
                }

                $rootScope.Start();
                var promise;
                if(typeof vm.workstationInfo.id === 'undefined'){
                    promise = vm.baseData.post(vm.workstationInfo);
                }else{
                    var fillableKeys = [
                        'workstation_type', 'workstation_name', 'workstation_active', 'scale_endpoint', 'site_id', 'company_id',
                        'incoming_boom_ip', 'incoming_boom_relay', 'exiting_boom_ip', 'exiting_boom_relay',
                        'incoming_red_light_ip', 'incoming_red_light_relay', 'incoming_green_light_ip', 'incoming_green_light_relay',
                        'exiting_red_light_ip', 'exiting_red_light_relay', 'exiting_green_light_ip', 'exiting_green_light_relay'
                    ];
                    var patchPayload = {};
                    fillableKeys.forEach(function(k) {
                        patchPayload[k] = vm.workstationInfo[k];
                    });
                    promise = Restangular.one(routeName, vm.workstationInfo.id).customPUT(patchPayload);
                }

                promise.then(function(){
                    vm.isEditing = false;
                    loadData();
                }, function(response){
                    $rootScope.Error(response);
                });
            };
            vm.deleteWorkstation = function(workstation){
                vm.isEditing = false;
                if(!confirm('Are you sure you want to delete the workstation?')){
                    return;
                }
                $rootScope.Start();
                Restangular.one(routeName, workstation.value).get().then(function(workstationInfo){
                    workstationInfo.remove().then(function(){
                        $Functions.Users().then(function(user){
                            loadData();
                        });
                    }, function(response){
                        $rootScope.Error(response);
                    });
                });
            };
            vm.changeSiteID = function(){
                $navigation.Site(vm.HeaderSingle.site_id);
                loadData();
            };
            vm.changeCompanyID = function(){
                $navigation.Company(vm.HeaderSingle.company_id);
                loadData();
            };
            vm.cancel = function () {
                if (vm.Cameras.length > 0)
                {
    
                    vm.Cameras.forEach(function (mapData) {
                        angular.isDefined(mapData.CameraTick);
                        {
                            clearInterval(mapData.CameraTick);
                        }
                    });
                };
                $state.go("app.workstations");
            };
            // #region ESP32 Test Functions
            vm.testRelay = function(entityName, ip, relayNumber) {
                console.log('[Test Relay] Function called', {entityName, ip, relayNumber, type: typeof relayNumber});
                console.log('[Test Relay] workstationInfo object:', vm.workstationInfo);
                
                if (!ip || !relayNumber) {
                    toastr.error('Please enter both IP address and relay number for ' + entityName);
                    return;
                }
                
                console.log('[Test Relay] Starting test for', entityName);
                $rootScope.Start();
                
                // Turn relay ON
                $esp32Control.controlRelay(ip, relayNumber, true)
                    .then(function() {
                        console.log('[Test Relay] ON command sent successfully');
                        toastr.success(entityName + ' relay turned ON');
                        
                        // Wait 1 second, then turn OFF
                        setTimeout(function() {
                            $esp32Control.controlRelay(ip, relayNumber, false)
                                .then(function() {
                                    console.log('[Test Relay] OFF command sent successfully');
                                    toastr.success(entityName + ' relay turned OFF');
                                    $rootScope.Loaded();
                                })
                                .catch(function(error) {
                                    console.error('[Test Relay] Failed to turn OFF', error);
                                    $rootScope.Error(error);
                                });
                        }, 1000);
                    })
                    .catch(function(error) {
                        console.error('[Test Relay] Failed to turn ON', error);
                        $rootScope.Error(error);
                    });
            };

            vm.testIncomingBoom = function() {
                console.log('[Test] testIncomingBoom clicked');
                console.log('[Test] Full workstationInfo object:', JSON.stringify(vm.workstationInfo, null, 2));
                var ip = vm.workstationInfo.incoming_boom_ip;
                var relay = vm.workstationInfo.incoming_boom_relay;
                console.log('[Test] Incoming Boom - IP:', ip, 'Relay:', relay);
                vm.testRelay('Incoming Boom', ip, relay);
            };

            vm.testExitingBoom = function() {
                console.log('[Test] testExitingBoom clicked');
                var ip = vm.workstationInfo.exiting_boom_ip;
                var relay = vm.workstationInfo.exiting_boom_relay;
                console.log('[Test] Exiting Boom - IP:', ip, 'Relay:', relay);
                vm.testRelay('Exiting Boom', ip, relay);
            };

            vm.testIncomingRedLight = function() {
                var ip = vm.workstationInfo.incoming_red_light_ip;
                var relay = vm.workstationInfo.incoming_red_light_relay;
                vm.testRelay('Incoming Red Light', ip, relay);
            };

            vm.testIncomingGreenLight = function() {
                var ip = vm.workstationInfo.incoming_green_light_ip;
                var relay = vm.workstationInfo.incoming_green_light_relay;
                vm.testRelay('Incoming Green Light', ip, relay);
            };

            vm.testExitingRedLight = function() {
                var ip = vm.workstationInfo.exiting_red_light_ip;
                var relay = vm.workstationInfo.exiting_red_light_relay;
                vm.testRelay('Exiting Red Light', ip, relay);
            };

            vm.testExitingGreenLight = function() {
                var ip = vm.workstationInfo.exiting_green_light_ip;
                var relay = vm.workstationInfo.exiting_green_light_relay;
                vm.testRelay('Exiting Green Light', ip, relay);
            };
            // #endregion

            vm.hasAnyEsp32Controls = function() {
                return vm.workstationInfo && (
                    vm.workstationInfo.incoming_boom_ip || vm.workstationInfo.exiting_boom_ip ||
                    vm.workstationInfo.incoming_red_light_ip || vm.workstationInfo.incoming_green_light_ip ||
                    vm.workstationInfo.exiting_red_light_ip || vm.workstationInfo.exiting_green_light_ip
                );
            };

            vm.initialize = function(){
                $rootScope.Start();
                $navigation.clear();
                loadData();

            };
        });
