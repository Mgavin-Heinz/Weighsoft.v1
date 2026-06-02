angular.module("xenon.controllers").controller("TareEditCtrl", function ($scope, $rootScope, $EMSOservice, $Functions, Restangular, $q, $navigation, $state, $stateParams, $http, ScaleEndpointResolver, SiteWeightUnits) {
    var vm = this;

    vm.selected_weighbridge = null;
    vm.weight = null;
    vm.weighttxt = null;
    var weighbridgeList = [];
    vm.weighbridge_id = null;
    vm.WeighBridge = { manual: 'Select Weighbridge' };
    let scaleSocket = undefined;
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
    vm.weightSamples = [];
    vm.siteDecimalsFallback = { decimals: 0 };
    vm.formatTareScaleReading = function (value) {
        var dec = SiteWeightUnits.displayDecimalsFromWeighbridgeOrSite(vm.WeighBridge, vm.siteDecimalsFallback);
        var n = typeof value === "string" ? parseFloat(value) : value;
        if (!Number.isFinite(n)) {
            return dec > 0 ? (0).toFixed(dec) : "0";
        }
        var rounded = SiteWeightUnits.roundToDecimals(n, dec);
        return dec > 0 ? rounded.toFixed(dec) : String(Math.round(rounded));
    };
    vm.tareInfo = {
        registration_no: "",
        weight: "",
        expiry_date: "",
        weighbridges: [],
        company_id: 0,
        site_id: 0,
    };
    console.log('STATE PARAMS', $stateParams);
    console.log('ROOTSCOPE', $rootScope.Params.company_id, $rootScope.Params.site_id);

    var getLookupData = function () {
        $rootScope.Start();
        var LookupTares = $Functions.Tares();
        $Functions.Weighbridges($rootScope.Params.company_id, $rootScope.Params.site_id).then((value) => {
            console.log('VALUE', value);
            vm.Weighbridges = value;
            weighbridgeList = value;
        });
        Promise.all([LookupTares]).then(
            function (values) {
                console.log('VALUE', values);
                tareList = values[0];
                if ($stateParams.id && $stateParams.id.length > 0) loadTare();
                $rootScope.Loaded();
            },
            function (response) {
                $rootScope.Error(response);
            }
        );
    };

    var loadTare = function () {
        $rootScope.Start();
        Restangular.one("tares", $stateParams.id)
            .get()
            .then(
                function (tareInfo) {
                    console.log("LOADTARE", tareInfo);
                    vm.tareInfo = tareInfo;
                    vm.selected_weighbridge = weighbridgeList.find((weighbridge) => weighbridge.value == tareInfo.weighbridge_id);
                    vm.setSelectedWeighBridge();
                    vm.isEditing = true;
                    $rootScope.Loaded();
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
    };
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
        if (scaleSocket) {
            scaleSocket.close();
            scaleSocket = null;
        }
        var bases = getScaleBases();
        scaleSocket = new WebSocket(bases.wsBase + "/ws/emso");

        scaleSocket.onmessage = function (event) {
            if (event.data !== undefined) {
                const rawKg = parseFloat(event.data);
                if (!Number.isFinite(rawKg)) {
                    return;
                }

                if (!vm.weightSamples) vm.weightSamples = [];

                const requiredStableSamples = parseInt(vm.WeighBridge.stable_samples, 10) || 0;

                // Check if the sample matches last recorded weight
                if (vm.weightSamples.length === 0 || vm.weightSamples[vm.weightSamples.length - 1] === rawKg) {
                    vm.weightSamples.push(rawKg);
                    // Keep array length limited to requiredStableSamples
                    if (vm.weightSamples.length > requiredStableSamples) {
                        vm.weightSamples.shift(); // remove oldest sample
                    }
                } else {
                    vm.weightSamples = [rawKg]; // reset samples on weight change
                }

                // Set weight when stable (tare weight stored as kg)
                if (vm.weightSamples.length === requiredStableSamples) {
                    const roundedKg = SiteWeightUnits.fromScaleKgRoundedKg(rawKg, vm.WeighBridge, vm.siteDecimalsFallback);
                    vm.weight = roundedKg;
                    vm.tareInfo.weight = roundedKg;
                    vm.weighttxt = String(event.data);
                    console.log('Stable weight detected (kg):', roundedKg);
                }

                console.log('Weight Samples:', vm.weightSamples);
            }
        };
    }
    vm.ResetWeighing = function () {
        if (!vm.WeighBridge || !vm.WeighBridge.scale) {
            console.warn('Cannot reset weighing: WeighBridge not loaded');
            return;
        }
        $rootScope.WeighFeedback = "";
        stopScale(vm.WeighBridge.scale);
        startScale(vm.WeighBridge.scale, vm.WeighBridge.port_num);
        connectWebSocket();
    };

    vm.closeWebSocket = function() {
        if (scaleSocket && scaleSocket.readyState === WebSocket.OPEN) {
            console.log('Closing WebSocket connection...');
            scaleSocket.close();
            scaleSocket = null;
        }
        if (vm.WeighBridge && vm.WeighBridge.scale) {
            stopScale(vm.WeighBridge.scale);
        }
    };
    vm.Functions = {
        Weighbridge: function () {
            var deferred = $q.defer();
            console.log('WEIGHBRIDGE', vm.selected_weighbridge);
            Restangular.one("weighbridge", vm.selected_weighbridge.value)
                .get()
                .then(
                    function (data) {
                        console.log('DATA', data);
                        $rootScope.WeighFeedback = $rootScope.WeighFeedback + "weighbridge loaded \n";
                        $rootScope.WeighBridge = data;
                        vm.WeighBridge = data; // Store locally for WebSocket
                        $rootScope.weight_sep = $rootScope.WeighBridge.weight_sep + "***";
                        
                        // Use WebSocket instead of EMSO service (matching weighing_create.js)
                        if ($rootScope.WeighBridge.manual == "No") {
                            $rootScope.WeighFeedback = $rootScope.WeighFeedback + "$rootScope.WeighBridge.manual == 'No' \n";
                            vm.ResetWeighing();
                        }
                        
                        deferred.resolve({ data: { message: "Weighbridges Success!" } });
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        },
        Single: function (type) {
            $rootScope.Start("Single on TareEditCtrl");
            switch (type)
            {
                case "weighbridge":
                    vm.Functions.Weighbridge().then(
                        function (value) {
                            $rootScope.Loaded("Single weighbridge on TareEditCtrl");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                    break;
            }
        },
    };

    vm.setSelectedWeighBridge = function () {
        console.log('WEIGHBRIDGE', vm.selected_weighbridge);
        $navigation.Weighbridge(vm.selected_weighbridge.value);
        vm.Functions.Single("weighbridge");
    };

    vm.saveForm = function (data) {
        // Validate the mandatory input fileds to create a tare
        if (!isTareFormValid()) return false;

        $rootScope.Start();
        if (typeof vm.tareInfo.id === "undefined")
        {
            vm.tareInfo.company_id = $rootScope.Params.company_id;
            vm.tareInfo.site_id = $rootScope.Params.site_id;
            vm.tareInfo.weighbridge_id = vm.selected_weighbridge.value;
            vm.tareInfo.weighbridges = undefined;
            console.log('WEIGHT', vm.tareInfo.weight);
            console.log('TAREINFO', vm.tareInfo);
            //vm.tareInfo.weight = $rootScope.Params.weight;
            Restangular.all("tares")
                .post(vm.tareInfo)
                .then(
                    function () {
                        goToTareList();
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
        } else
        {
            console.log('WEIGHT 1', vm.tareInfo.weight);
            console.log('TAREINFO 1', vm.tareInfo);
            if (vm.tareInfo.weight === 0) return false;
            Restangular.one("tares", $stateParams.id)
                .customPUT(vm.tareInfo)
                .then(
                    function () {
                        goToTareList();
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
        }
        vm.closeWebSocket();
    };

    vm.cancelEdit = function () {
        vm.closeWebSocket();
        goToTareList();
    };

    // A tare should have a name, expiry date, amount
    // a product. Without this tare will be invalid hence
    // we should not alllow it to be submitted
    var isTareFormValid = function () {
        return vm.tareInfo.registration_no.length !== 0 && vm.weight !== 0 && vm.tareInfo.expiry_date.length !== 0;
    };

    function goToTareList() {
        $state.go("app.tares.list", {
            id: $rootScope.Params.site_id,
        });
    }

    // Cleanup WebSocket when controller is destroyed
    $scope.$on('$destroy', function() {
        vm.closeWebSocket();
    });

    getLookupData();
});
