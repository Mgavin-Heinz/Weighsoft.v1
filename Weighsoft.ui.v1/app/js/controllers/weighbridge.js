"use strict";
angular.module("xenon.controllers").controller("WeighbridgeCtrl", function ($scope, $rootScope,
    $navigation, $http, $state, $modal, $nodeRed, Restangular, $q, $Functions, $esp32Control, ScaleEndpointResolver) {
    $rootScope.Start();
    if (MyLocalStorage.getItem("user_info").business_partner == "false")
    {
        $scope.businessPartner = false;
    } else
    {
        $scope.businessPartner = true;
    }

    var vm = this;
    var routeName = "weighbridge";
    let valueSocket = undefined;
    let scaleSocket = undefined;
    vm.isEditing = false;
    vm.companyList = [];
    vm.siteList = [];
    vm.weighbridgeList = [];
    vm.User = [];
    vm.availablePorts = [];

    function getScaleContext() {
        return {
            company_id: vm.HeaderSingle.company_id || ($rootScope.Params && $rootScope.Params.company_id),
            site_id: vm.HeaderSingle.site_id || ($rootScope.Params && $rootScope.Params.site_id),
            workstation_id: vm.HeaderSingle.workstation_id || ($rootScope.Params && $rootScope.Params.workstation_id)
        };
    }

    function getScaleBases() {
        return ScaleEndpointResolver.getScaleBases(getScaleContext());
    }

    function loadPorts() {
        $rootScope.Start();
        var bases = getScaleBases();
        return $http.get(bases.httpBase + '/ports')
            .then(function(response) {
                if (response.data) {
                    vm.availablePorts = response.data.map(function(port) {
                        return {
                            port: port,
                            name: port
                        };
                    });
                    console.log('Available Ports:', vm.availablePorts);
                }
            })
            .catch(function(error) {
                console.error('Error loading ports:', error);
            })
            .finally(function() {
                $rootScope.Loaded();
            });
    }

    vm.refreshPorts = function() {
        loadPorts();
    };

    vm.HeaderSingle = {
        company_id: null,
        site_id: null,
        workstation_id: null,
    };

    // Add scale list initialization
    vm.scaleList = [];
    vm.weighbridgeInfo = {};

    function loadScaleList() {
        var bases = getScaleBases();
        return $http.post(bases.httpBase + '/setup', {
            type: 'select',
            data: {}
        });
    }

    // Add function to get scale name from record
    vm.getScaleName = function(record) {
        if (!record || !vm.scaleList) return '';
        var scale = vm.scaleList.find(s => s.record == record);
        return scale ? scale.name : '';
    };

    function loadData() {
        $rootScope.Start();
        vm.isEditing = false;
        const navInfo = $navigation.get();
        $Functions.Weighbridges().then(
            function (data) {
                vm.weighbridgeList = data;
                $rootScope.Loaded();
            },
            function (response) {
                $rootScope.Error(response);
            }
        );
    }

    vm.showAddForm = function () {
        vm.isEditing = true;
        vm.weighbridgeInfo = {};
        
        Promise.all([loadPorts(), loadScaleList()])
            .then(function([_, scaleResponse]) {
                if (scaleResponse.data && scaleResponse.data.length > 0) {
                    vm.scaleList = scaleResponse.data.map(item => ({
                        name: item.name,
                        record: item.record
                    }));
                    console.log('Scale List:', vm.scaleList);
                }
            })
            .catch(function(error) {
                console.error('Error in showAddForm:', error);
                $rootScope.Error(error);
            });
    };
    
    vm.showEditForm = function (weighbridge) {
        $rootScope.Start();
        
        // First load ports and get weighbridge info
        Promise.all([
            loadPorts(),
            Restangular.one(routeName, weighbridge.value).get(),
            loadScaleList()
        ]).then(function([_, weighbridgeInfo, scaleResponse]) {
            // Convert Restangular object to plain object to avoid binding issues
            vm.weighbridgeInfo = weighbridgeInfo.plain ? weighbridgeInfo.plain() : weighbridgeInfo;
            console.log('Loaded weighbridge info:', vm.weighbridgeInfo);
            console.log('Is plain object?', !vm.weighbridgeInfo.restangularized);
            
            // Ensure ESP32 fields exist and are initialized (not undefined)
            if (vm.weighbridgeInfo.incoming_boom_ip === null || vm.weighbridgeInfo.incoming_boom_ip === undefined) {
                vm.weighbridgeInfo.incoming_boom_ip = '';
            }
            if (vm.weighbridgeInfo.exiting_boom_ip === null || vm.weighbridgeInfo.exiting_boom_ip === undefined) {
                vm.weighbridgeInfo.exiting_boom_ip = '';
            }
            if (vm.weighbridgeInfo.incoming_light_ip === null || vm.weighbridgeInfo.incoming_light_ip === undefined) {
                vm.weighbridgeInfo.incoming_light_ip = '';
            }
            if (vm.weighbridgeInfo.exiting_light_ip === null || vm.weighbridgeInfo.exiting_light_ip === undefined) {
                vm.weighbridgeInfo.exiting_light_ip = '';
            }
            
            // Ensure decimal_places is a number, default to 0 if undefined
            vm.weighbridgeInfo.decimal_places = vm.weighbridgeInfo.decimal_places !== undefined ? 
                parseFloat(vm.weighbridgeInfo.decimal_places) : 0;
            vm.weighbridgeInfo.stable_samples = vm.weighbridgeInfo.stable_samples !== undefined ? 
                parseFloat(vm.weighbridgeInfo.stable_samples) : 0;
            
            // Process scale list response
            if (scaleResponse.data && scaleResponse.data.length > 0) {
                vm.scaleList = scaleResponse.data.map(item => ({
                    name: item.name,
                    record: item.record
                }));
                console.log('Scale List:', vm.scaleList);

                // Verify the scale exists in the list
                if (vm.weighbridgeInfo.scale) {
                    console.log('Looking for scale:', vm.weighbridgeInfo.scale, 'Type:', typeof vm.weighbridgeInfo.scale);
                    // Convert both to strings for comparison
                    var scaleToFind = vm.weighbridgeInfo.scale.toString();
                    var scale = vm.scaleList.find(s => s.record.toString() === scaleToFind);
                    if (!scale) {
                        console.warn('Scale record not found in list:', vm.weighbridgeInfo.scale);
                    } else {
                        console.log('Scale found:', scale);
                        // Ensure the scale value is set as the record
                        vm.weighbridgeInfo.scale = scale.record;
                    }
                }
            }

            vm.isEditing = true;
            $rootScope.Loaded();
        }).catch(function(response) {
            console.error('Error in showEditForm:', response);
            $rootScope.Error(response);
        });
    };

    vm.saveForm = function (data) {
        $rootScope.Start();
        console.log('WeighbridgeInfo before save:', vm.weighbridgeInfo);
        
        // Ensure decimal_places and stable_samples are numbers
        vm.weighbridgeInfo.decimal_places = vm.weighbridgeInfo.decimal_places !== undefined ? 
            parseFloat(vm.weighbridgeInfo.decimal_places) : 0;
        vm.weighbridgeInfo.stable_samples = vm.weighbridgeInfo.stable_samples !== undefined ? 
            parseFloat(vm.weighbridgeInfo.stable_samples) : 0;

        // No need to modify scale as it should already be the record number
        if (vm.weighbridgeInfo.scale) {
            // Verify the scale exists in the list
            var selectedScale = vm.scaleList.find(s => s.record === vm.weighbridgeInfo.scale);
            if (!selectedScale) {
                console.warn('Selected scale not found in list:', vm.weighbridgeInfo.scale);
            }
        }

        if (typeof vm.weighbridgeInfo.id === "undefined") {
            vm.weighbridgeInfo.company_id = vm.HeaderSingle.company_id;
            vm.weighbridgeInfo.site_id = vm.HeaderSingle.site_id;
            vm.weighbridgeInfo.workstation_id = vm.HeaderSingle.workstation_id;
            Restangular.all("weighbridge")
                .post(vm.weighbridgeInfo)
                .then(
                    function () {
                        loadData();
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
        } else {
            // If we converted to plain object, use Restangular.one().put()
            if (!vm.weighbridgeInfo.save) {
                Restangular.one("weighbridge", vm.weighbridgeInfo.id)
                    .customPUT(vm.weighbridgeInfo)
                    .then(
                        function () {
                            loadData();
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
            } else {
                vm.weighbridgeInfo.save().then(
                    function () {
                        loadData();
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
            }
        }
    };

    vm.deleteWeighbridge = function (weighbridge) {
        vm.isEditing = false;
        if (!confirm("Are you sure you want to delete the weighbridge?"))
        {
            return;
        }

        $rootScope.Start();
        Restangular.one(routeName, weighbridge.value)
            .get()
            .then(function (weighbridgeInfo) {
                weighbridgeInfo.remove().then(
                    function () {
                        loadData();
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
            });
    };

    vm.cancelEdit = function () {
        vm.isEditing = false;
    };

    vm.changeFilter = function (type) {
        switch (type)
        {
            case "company":
                $navigation.Company(vm.HeaderSingle.company_id);
                $navigation.Site(null);
                $Functions.Site().then(
                    function (siteList) {
                        vm.siteList = siteList;
                        if (vm.siteList.length === 1)
                        {
                            vm.HeaderSingle.site_id = vm.siteList[0].value;
                            vm.changeFilter("site");
                        }
                        $rootScope.Loaded("Single Site on WeighbridgeCtrl");
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
                break;
            case "site":
                $navigation.Site(vm.HeaderSingle.site_id);
                $navigation.Workstation(null);
                $Functions.Workstation().then(
                    function (workstationList) {
                        vm.workstationList = workstationList;
                        if (vm.workstationList.length === 1)
                        {
                            vm.HeaderSingle.workstation_id = vm.workstationList[0].value;
                            vm.changeFilter("workstation");
                        }
                        $rootScope.Loaded("Single Site on WeighbridgeCtrl");
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );

                break;
            case "workstation":
                $navigation.Workstation(vm.HeaderSingle.workstation_id);

                loadData();

                break;
        }
    };
    function connectWebSocket() {
        if (scaleSocket) {
            scaleSocket.close();
        }
        var bases = getScaleBases();
        scaleSocket = new WebSocket(bases.wsBase + "/ws/emso");
        
        // Initialize weight samples array outside the message handler
        let weightSamples = [];
        
        scaleSocket.onmessage = function(event) {
            if (event.data !== undefined) {
                // Store raw data
                vm.weighbridgeInfo.data = event.data;
                
                // Parse the weight value (stream is kg); decimal_places = display precision, not scale factor
                let newWeight = parseFloat(event.data);
                if (Number.isFinite(newWeight)) {
                    const decimalPlaces = parseInt(vm.weighbridgeInfo.decimal_places, 10);
                    if (Number.isInteger(decimalPlaces) && decimalPlaces >= 0) {
                        const factor = Math.pow(10, decimalPlaces);
                        newWeight = Math.round(newWeight * factor) / factor;
                    }
                }
                
                // Handle stable samples
                if (weightSamples.length === 0 || newWeight === weightSamples[weightSamples.length - 1]) {
                    weightSamples.push(newWeight);
                } else {
                    // Reset samples if weight changed
                    weightSamples = [newWeight];
                }
                
                // Only update weight if we have enough stable samples
                if (weightSamples.length >= vm.weighbridgeInfo.stable_samples) {
                    vm.weighbridgeInfo.weight = newWeight;
                    weightSamples = []; // Reset samples after stable weight is found
                }
                $scope.$apply();
            }
        };
    }

    vm.StartWeighing = function () {
        if (!vm.weighbridgeInfo.scale || !vm.weighbridgeInfo.port_num) {
            console.error('Missing scale record or port number');
            return;
        }

        var bases = getScaleBases();
        $http.post(bases.httpBase + '/scale', {
            record: vm.weighbridgeInfo.scale,
            enabled: true,
            port: vm.weighbridgeInfo.port_num
        }).then(function(response) {
            console.log('Scale started:', response.data);
            connectWebSocket();
        }).catch(function(error) {
            console.error('Error starting scale:', error);
        });
    };

    vm.StopWeighing = function () {
        if (!vm.weighbridgeInfo.scale) {
            console.error('Missing scale record');
            return;
        }

        var bases = getScaleBases();
        $http.post(bases.httpBase + '/scale', {
            record: vm.weighbridgeInfo.scale,
            enabled: false
        }).then(function(response) {
            console.log('Scale stopped:', response.data);
            if (scaleSocket) {
                scaleSocket.close();
                scaleSocket = undefined;
            }
        }).catch(function(error) {
            console.error('Error stopping scale:', error);
        });
    };

    vm.changeCompanyID = function () {
        $navigation.Company(vm.HeaderSingle.company_id);
        loadData();
    };

    vm.changeSiteID = function () {
        $navigation.Site(vm.HeaderSingle.site_id);
        loadData();
    };

    vm.changeWorkstationID = function () {
        $navigation.Workstation(vm.HeaderSingle.workstation_id);
        loadData();
    };

    vm.initialize = function () {
        $navigation.clear();
        $Functions.Users().then(function (user) {
            vm.getData("company");
            if ($rootScope.Params.company_id !== null) vm.getData("site");
            if ($rootScope.Params.site_id !== null) vm.getData("Workstation");
            $rootScope.AxelDisplay = "hidden";
            if ($rootScope.Params.company_id !== null && $rootScope.Params.site_id !== null && $rootScope.Params.workstation_id !== null) {
                loadData();
            } else {
                $rootScope.Loaded();
            }
        });
    };

    vm.getData = function (type) {
        switch (type)
        {
            case "company":
                $Functions.Company().then(function (companyList) {
                    vm.HeaderSingle.company_id = $rootScope.Params.company_id;
                    vm.companyList = companyList;
                });
                break;
            case "site":
                $Functions.Site().then(
                    function (siteList) {
                        vm.HeaderSingle.site_id = $rootScope.Params.site_id;
                        vm.siteList = siteList;
                        if (vm.siteList.length == 1)
                        {
                            vm.HeaderSingle.site_id = vm.siteList[0].value;
                            $navigation.Site(vm.HeaderSingle.site_id);
                            vm.getData("workstation");
                        }
                        $rootScope.Loaded("Single Site on WeighbridgeCtrl");
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
                break;
            case "Workstation":
                $Functions.Workstation().then(
                    function (workstationList) {
                        vm.HeaderSingle.workstation_id = $rootScope.Params.workstation_id;
                        vm.workstationList = workstationList;
                        if (vm.workstationList.length == 1)
                        {
                            vm.HeaderSingle.workstation_id = vm.workstationList[0].value;
                            $navigation.Workstation(vm.HeaderSingle.workstation_id);
                            vm.getData("weighbridge");
                        }
                        $rootScope.Loaded("Single Workstation on WeighbridgeCtrl");
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
                break;
        }
    };

    // ESP32 Relay Test Functions
    vm.testRelay = function(entityName, ip, relayNumber) {
        console.log('[Test Relay] Function called', { 
            entityName: entityName, 
            ip: ip, 
            relayNumber: relayNumber,
            type: typeof relayNumber 
        });
        console.log('[Test Relay] weighbridgeInfo object:', vm.weighbridgeInfo);
        
        if (!ip || !relayNumber) {
            console.error('[Test Relay] Validation failed - IP:', ip, 'Relay:', relayNumber);
            swal("Error", entityName + " IP address or relay number not configured", "error");
            return;
        }

        console.log('[Test Relay] Starting test for', entityName);
        $rootScope.Start();
        
        // Turn relay ON, wait 1 second, turn OFF
        $esp32Control.controlRelay(ip, relayNumber, true)
            .then(function(response) {
                console.log('[Test Relay] Relay turned ON successfully', response);
                toastr.success(entityName + ' Relay ' + relayNumber + ' turned ON');
                
                // Wait 1 second then turn OFF
                setTimeout(function() {
                    console.log('[Test Relay] Turning relay OFF');
                    $esp32Control.controlRelay(ip, relayNumber, false)
                        .then(function(response) {
                            console.log('[Test Relay] Relay turned OFF successfully', response);
                            $rootScope.Loaded();
                            toastr.success(entityName + ' Relay ' + relayNumber + ' turned OFF');
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
        console.log('[Test] Full weighbridgeInfo object:', JSON.stringify(vm.weighbridgeInfo, null, 2));
        console.log('[Test] ESP32 fields specifically:', {
            incoming_boom_ip: vm.weighbridgeInfo.incoming_boom_ip,
            incoming_boom_relay: vm.weighbridgeInfo.incoming_boom_relay,
            exiting_boom_ip: vm.weighbridgeInfo.exiting_boom_ip,
            exiting_boom_relay: vm.weighbridgeInfo.exiting_boom_relay,
            incoming_light_ip: vm.weighbridgeInfo.incoming_light_ip,
            incoming_light_relay: vm.weighbridgeInfo.incoming_light_relay,
            exiting_light_ip: vm.weighbridgeInfo.exiting_light_ip,
            exiting_light_relay: vm.weighbridgeInfo.exiting_light_relay
        });
        var ip = vm.weighbridgeInfo.incoming_boom_ip;
        var relay = vm.weighbridgeInfo.incoming_boom_relay;
        console.log('[Test] Incoming Boom - IP:', ip, 'Relay:', relay);
        vm.testRelay('Incoming Boom', ip, relay);
    };

    vm.testExitingBoom = function() {
        console.log('[Test] testExitingBoom clicked');
        var ip = vm.weighbridgeInfo.exiting_boom_ip;
        var relay = vm.weighbridgeInfo.exiting_boom_relay;
        console.log('[Test] Exiting Boom - IP:', ip, 'Relay:', relay);
        vm.testRelay('Exiting Boom', ip, relay);
    };

    vm.testIncomingLight = function() {
        console.log('[Test] testIncomingLight clicked');
        var ip = vm.weighbridgeInfo.incoming_light_ip;
        var relay = vm.weighbridgeInfo.incoming_light_relay;
        console.log('[Test] Incoming Light - IP:', ip, 'Relay:', relay);
        vm.testRelay('Incoming Light', ip, relay);
    };

    vm.testExitingLight = function() {
        console.log('[Test] testExitingLight clicked');
        var ip = vm.weighbridgeInfo.exiting_light_ip;
        var relay = vm.weighbridgeInfo.exiting_light_relay;
        console.log('[Test] Exiting Light - IP:', ip, 'Relay:', relay);
        vm.testRelay('Exiting Light', ip, relay);
    };
});
