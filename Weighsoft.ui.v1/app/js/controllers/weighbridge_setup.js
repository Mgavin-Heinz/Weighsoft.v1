"use strict";
angular.module("xenon.controllers").controller("WeighbridgeSetupCtrl", function ($scope, $rootScope,
    $navigation, $Functions, $http, ScaleEndpointResolver) {
    $rootScope.Start();

    var vm = this;
    vm.isEditing = false;
    vm.isAdd = false;
    vm.weighbridgeList = [];
    vm.weighbridgeInfo = {};
    vm.availablePorts = [];
    vm.wsConnection = null;

    function getScaleContext() {
        return {
            company_id: $rootScope.Params && $rootScope.Params.company_id,
            site_id: $rootScope.Params && $rootScope.Params.site_id,
            workstation_id: $rootScope.Params && $rootScope.Params.workstation_id
        };
    }

    function getScaleBases() {
        return ScaleEndpointResolver.getScaleBases(getScaleContext());
    }

    function makeRequest(type, data) {
        var bases = getScaleBases();
        return $http.post(bases.httpBase + '/setup', {
            type: type,
            data: data
        });
    }

    function startScale(record, port) {
        var bases = getScaleBases();
        return $http.post(bases.httpBase + '/scale', {
            record: record,
            enabled: true,
            port: port
        });
    }

    function stopScale(record) {
        var bases = getScaleBases();
        return $http.post(bases.httpBase + '/scale', {
            record: record,
            enabled: false
        });
    }

    function connectWebSocket() {
        if (vm.wsConnection) {
            vm.wsConnection.close();
        }

        var bases = getScaleBases();
        vm.wsConnection = new WebSocket(bases.wsBase + '/ws/emso');
        
        vm.wsConnection.onmessage = function(event) {
            if (event.data !== undefined) {
                vm.weighbridgeInfo.weight = parseFloat(event.data);
                $scope.$apply();
            }
        };

        vm.wsConnection.onerror = function(error) {
            console.error('WebSocket error:', error);
        };

        vm.wsConnection.onclose = function() {
            console.log('WebSocket connection closed');
            vm.wsConnection = null;
        };
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

    function loadData() {
        $rootScope.Start();
        vm.isEditing = false;
        vm.isAdd = false;
        
        makeRequest("select", {})
            .then(function(response) {
                if (response.data && response.data.length > 0) {
                    vm.weighbridgeList = response.data.map(function(item) {
                        return {
                            record: item.record,
                            name: item.name,
                            baudrate: item.baudrate,
                            parity: item.parity,
                            databits: item.databits,
                            stopbits: item.stopbits,
                            seperator: item.seperator,
                            regex: item.regex,
                            weight_reg: item.regex,
                            display_name: item.display_name,
                            display_baudrate: item.display_baudrate,
                            display_parity: item.display_parity,
                            display_databits: item.display_databits,
                            display_stopbits: item.display_stopbits,
                            remote_display: item.remote_display === undefined ? "No" : item.remote_display,
                            stable_samples: item.stable_samples,
                            weight_special: item.weight_special,
                            weight_num_amt: item.weight_num_amt,
                            port_num: item.port_num
                        };
                    });
                    console.log('Processed Weighbridge List:', vm.weighbridgeList);
                }
            })
            .catch(function(error) {
                console.error('Error loading weighbridge data:', error);
            })
            .finally(function() {
                $rootScope.Loaded();
            });
    }

    vm.refreshPorts = function() {
        loadPorts();
    };

    vm.showAddForm = function () {
        vm.isEditing = true;
        vm.isAdd = true;
        vm.weighbridgeInfo = {};
        loadPorts();
    };

    vm.showEditForm = function (weighbridge) {
        $rootScope.Start();
        vm.isEditing = true;
        vm.isAdd = false;
        
        loadPorts().then(function() {
            return makeRequest("select", { record: weighbridge.record });
        })
        .then(function(response) {
            if (response.data && response.data.length > 0) {
                vm.weighbridgeInfo = response.data[0];
                console.log('Weighbridge Info:', vm.weighbridgeInfo);
            }
        })
        .catch(function(error) {
            console.error('Error fetching weighbridge details:', error);
        })
        .finally(function() {
            $rootScope.Loaded();
        });
    };

    vm.RegExChange = function () {
        vm.weighbridgeInfo.weight_reg = "[0-9" + 
            (vm.weighbridgeInfo.weight_special == "Yes" ? "\\.\\-" : "") + 
            "]{" + vm.weighbridgeInfo.weight_num_amt + "}";
    };

    vm.StartWeighing = function () {
        if (!vm.weighbridgeInfo.record || !vm.weighbridgeInfo.port_num) {
            console.error('Missing record or port number');
            return;
        }

        startScale(vm.weighbridgeInfo.record, vm.weighbridgeInfo.port_num)
            .then(function(response) {
                console.log('Scale started:', response.data);
                connectWebSocket();
            })
            .catch(function(error) {
                console.error('Error starting scale:', error);
            });
    };

    vm.StopWeighing = function () {
        if (!vm.weighbridgeInfo.record) {
            console.error('Missing record');
            return;
        }

        stopScale(vm.weighbridgeInfo.record)
            .then(function(response) {
                console.log('Scale stopped:', response.data);
                if (vm.wsConnection) {
                    vm.wsConnection.close();
                    vm.wsConnection = null;
                }
            })
            .catch(function(error) {
                console.error('Error stopping scale:', error);
            });
    };

    vm.ResetWeighing = function () {
        vm.StopWeighing();
        setTimeout(function() {
            vm.StartWeighing();
        }, 1000); // Wait 1 second before restarting
    };

    vm.saveForm = function (data) {
        $rootScope.Start();
        vm.RegExChange();
        var requestData = {
            name: data.name,
            baudrate: data.baudrate,
            parity: data.parity,
            databits: data.databits,
            stopbits: data.stopbits,
            seperator: data.seperator,
            weight_special: data.weight_special,
            weight_num_amt: data.weight_num_amt,
            regex: data.weight_reg == undefined ? vm.weighbridgeInfo.weight_reg : data.weight_reg,
            display_name: data.display_name,
            display_baudrate: data.display_baudrate,
            display_parity: data.display_parity,
            display_databits: data.display_databits,
            display_stopbits: data.display_stopbits,
            remote_display: data.remote_display === undefined ? "No" : data.remote_display,
        };

        if (!vm.isAdd && data.record) {
            requestData.record = data.record;
        }

        makeRequest(vm.isAdd ? "add" : "update", requestData)
            .then(function(response) {
                console.log((vm.isAdd ? 'Add' : 'Update') + ' result:', response.data);
                loadData();
            })
            .catch(function(error) {
                console.error('Error ' + (vm.isAdd ? 'adding' : 'updating') + ' weighbridge:', error);
            })
            .finally(function() {
                $rootScope.Loaded();
            });
    };

    vm.deleteWeighbridge = function (weighbridge) {
        if (!confirm("Are you sure you want to delete the weighbridge?")) {
            return;
        }

        $rootScope.Start();
        makeRequest("delete", { record: weighbridge.record })
            .then(function(response) {
                console.log('Delete result:', response.data);
                loadData();
            })
            .catch(function(error) {
                console.error('Error deleting weighbridge:', error);
            })
            .finally(function() {
                $rootScope.Loaded();
            });
    };

    vm.cancelEdit = function () {
        vm.isEditing = false;
        vm.isAdd = false;
    };

    vm.initialize = function () {
        $navigation.clear();
        $Functions.Users().then(function (user) {
            $rootScope.AxelDisplay = "hidden";
            loadPorts();
            loadData();
        });
    };
});
