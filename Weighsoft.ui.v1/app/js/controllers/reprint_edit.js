"use strict";
angular.module("xenon.controllers").controller("ReprintEditCtrl", function ($scope, $rootScope, $state, $stateParams, Restangular, $q, $navigation, $Functions) {
    var vm = this;
    $scope.System = vm;

    var routeName = "weighingheaders";

    vm.HeaderSingle = {
        company_id: $stateParams.company_id,
        site_id: $stateParams.site_id,
        workstation_id: $stateParams.workstation_id,
        weighing_header: $stateParams.id,
    };

    vm.Single = {};
    vm.Settings = [];
    vm.Products = [];
    vm.BusinessPartners = [];
    vm.Hauliers = [];
    vm.Pallets = [];
    vm.Site = {};

    // Reporting and calculation state
    vm.ReportData = {
        Hauliers: null,
        BusinessPartners: null,
        Products: null,
        Settings: null,
        Pallets: null,
        Pallet: null,
        palletName: null,
        amount: null
    };
    vm.nettWeight = 0;
    vm.moistureDeduction = 0;
    vm.handlingCharges = 0;
    vm.palletCharges = 0;
    vm.selected_businessPartner = null;
    vm.selected_product = null;
    vm.selected_haulier = null;
    vm.selected_pallet = null;

    // Contracts and grades
    vm.allContracts = [];
    vm.Contracts = [];
    vm.selected_contract = null;
    vm.contractStatus = { promised: 0, delivered: 0, remaining: 0 };

    vm.load = function () {
        if (!$stateParams.id) {
            $state.go('app.reprint_list');
            return;
        }

        $rootScope.Start && $rootScope.Start("ReprintEdit load");
        $navigation.clear();
        $navigation.Company($stateParams.company_id);
        $navigation.Site($stateParams.site_id);
        $navigation.Workstation($stateParams.workstation_id);

        $Functions.Users().then(function (user) {
            vm.User = user;

            // Load the transaction with improved error handling
            var transactionPromise = Restangular.one(routeName, $stateParams.id)
                .withHttpConfig({ timeout: 30000 }) // 30 second timeout
                .customGET("", vm.HeaderSingle);
                
            transactionPromise.then(function (data) {
                vm.Single = angular.copy(data);
                // Flatten weighing line dates
                if (data.weighingLines) {
                    angular.forEach(data.weighingLines, function (w) {
                        if (w.Status === "1") vm.Single.FirstDate = w.created_at;
                        if (w.Status === "2") vm.Single.SecondDate = w.created_at;
                    });
                }

                // Coerce numeric fields to numbers to satisfy input[type=number] - PRESERVE EXISTING VALUES
                vm.Single.FirstWeight = parseFloat(vm.Single.FirstWeight) || 0;
                vm.Single.SecondWeight = parseFloat(vm.Single.SecondWeight) || 0;
                
                console.log("ReprintEdit: Loaded weights from database:", {
                    FirstWeight: vm.Single.FirstWeight,
                    SecondWeight: vm.Single.SecondWeight,
                    rawData: {
                        FirstWeight: data.FirstWeight,
                        SecondWeight: data.SecondWeight
                    }
                });
                vm.Single.moisture_deduction = parseFloat(vm.Single.moisture_deduction) || 0;
                vm.Single.handling_charges = parseFloat(vm.Single.handling_charges) || 0;
                vm.Single.pallet_count = parseFloat(vm.Single.pallet_count) || 0;
                vm.Single.pallet_charges = parseFloat(vm.Single.pallet_charges) || 0;

                // Ensure required keys exist for saving
                vm.Single.company_id = vm.Single.company_id || vm.HeaderSingle.company_id;
                vm.Single.site_id = vm.Single.site_id || vm.HeaderSingle.site_id;
                vm.Single.workstation_id = vm.Single.workstation_id || vm.HeaderSingle.workstation_id;
                vm.Single.reason = vm.Single.reason || "";

                // Reference data then finish loading
                return loadReferenceData().then(function(){
                    // Map selected_* from ids for ui behavior and ReportData
                    if (vm.BusinessPartners && vm.BusinessPartners.length) {
                        vm.selected_businessPartner = vm.BusinessPartners.find(function (bp) { return bp.value == vm.Single.businesspartner_id; });
                        if (vm.selected_businessPartner) vm.ReportData.BusinessPartners = vm.selected_businessPartner.report;
                    }
                    if (vm.Hauliers && vm.Hauliers.length) {
                        vm.selected_haulier = vm.Hauliers.find(function (h) { return h.value == vm.Single.haulier_id; });
                        if (vm.selected_haulier) vm.ReportData.Hauliers = vm.selected_haulier.report;
                    }
                    if (vm.Products && vm.Products.length) {
                        vm.selected_product = vm.Products.find(function (p) { return p.value == vm.Single.product_id; });
                        if (vm.selected_product) {
                            vm.ReportData.Products = vm.selected_product.report;
                            vm.Single.product_grades_enabled = vm.selected_product.grades_enabled || 'No';
                            // Grades array if present on product
                            if (typeof vm.selected_product.grades === 'string' && vm.selected_product.grades.length) {
                                vm.selected_product.gradesArray = vm.selected_product.grades.split(',').map(function(x){ return x.trim(); });
                            }
                        } else {
                            vm.Single.product_grades_enabled = vm.Single.product_grades_enabled || 'No';
                        }
                    } else {
                        vm.Single.product_grades_enabled = vm.Single.product_grades_enabled || 'No';
                    }
                    if (vm.Pallets && vm.Pallets.length) {
                        vm.selected_pallet = vm.Pallets.find(function (pl) { return pl.value == vm.Single.pallet_id; });
                        if (vm.selected_pallet) {
                            vm.ReportData.Pallet = vm.selected_pallet;
                            vm.ReportData.palletName = vm.selected_pallet.pallet_name;
                            vm.ReportData.amount = vm.selected_pallet.amount;
                        }
                    }
                    // If header has no pallet linked, hide pallet section even if enabled in settings
                    if (!vm.Single.pallet_id) {
                        vm.Setting.pallet_enabled = "false";
                    }

                    // Build contracts
                    buildContracts();
                    if (vm.Single.contract_id) {
                        vm.selected_contract = vm.Contracts.find(function (c) { return (c.value || c.id) == vm.Single.contract_id; }) || null;
                        if (vm.selected_contract) {
                            vm.ReportData.Contract = vm.selected_contract;
                            loadContractTransactions();
                        }
                    }

                    // Initialize custom select values for SO/SC
                    for (var i = 1; i <= 20; i++) {
                        var inputType = vm.Setting['user_defined_input' + i];
                        if (inputType === 'SO' || inputType === 'SC') {
                            var cv = vm.Single['Custom' + i];
                            if (cv) vm['selected_Custom' + i] = { key: cv, value: cv };
                        }
                    }

                    // Initial calculations
                    vm.calculatePalletCharges && vm.calculatePalletCharges();
                    vm.updateNetWeight && vm.updateNetWeight();
                }).finally(function(){
                    $rootScope.Loaded && $rootScope.Loaded("ReprintEdit load done");
                });
            }).catch(function(error) {
                console.error("ReprintEdit: Transaction loading failed:", error);
                $rootScope.Error(error);
                $rootScope.Loaded && $rootScope.Loaded("ReprintEdit load failed - transaction");
                // Optionally redirect back to list on critical failure
                if (error.status === 404 || error.status === 403) {
                    swal("Error", "Transaction not found or access denied.", "error", function() {
                        $state.go('app.reprint_list');
                    });
                }
            });
        }).catch(function(error) {
            console.error("ReprintEdit: User loading failed:", error);
            $rootScope.Error(error);
            $rootScope.Loaded && $rootScope.Loaded("ReprintEdit load failed - user");
        });
    };

    function loadReferenceData() {
        var promises = [];
        
        // Add timeout and error handling for all reference data calls
        var timeoutConfig = { timeout: 15000 }; // 15 second timeout for each call
        
        // Settings
        promises.push($Functions.Settings().then(function (settings) {
            vm.Settings = settings;
            vm.Setting = settings.find(function (s) { return s.id == vm.Single.settings_id; }) || {};
            // Ensure all user_defined_* fields are present to drive labels/visibility
            for (var i = 1; i <= 20; i++) {
                vm.Setting['user_defined_input' + i] = vm.Setting['user_defined_input' + i] || 'N';
                vm.Setting['user_defined_name' + i] = vm.Setting['user_defined_name' + i] || ('Custom ' + i);
            }
            // Normalize flags used in UI
            vm.Setting.enable_moisture = vm.Setting.enable_moisture || "false";
            vm.Setting.enable_handling = vm.Setting.enable_handling || "false";
            vm.Setting.pallet_enabled = vm.Setting.pallet_enabled || "false";
            // Build arrays for select-type custom fields
            for (var j = 1; j <= 20; j++) {
                var inputType = vm.Setting['user_defined_input' + j];
                var values = vm.Setting['user_defined_val' + j];
                if ((inputType === 'SO' || inputType === 'SC') && typeof values === 'string') {
                    vm.Setting['user_defined_array' + j] = values.split(',').map(function (x) { var v = x.trim(); return { key: v, value: v }; });
                }
            }
        }));
        // Site info for decimals
        promises.push($Functions.Site().then(function (sites) {
            var s = sites.find(function (x) { return x.value == vm.HeaderSingle.site_id || x.id == vm.HeaderSingle.site_id; });
            if (s) {
                vm.Site.decimals = s.decimals || 2;
                vm.Site.measure_type = s.measure_type;
                vm.Site.deduct_flow = s.deduct_flow;
            }
        }));
        // Products
        promises.push(Restangular.all("product")
            .withHttpConfig(timeoutConfig)
            .getList($navigation.get())
            .then(function (data) {
                vm.Products = data.map(function (p) { return { value: p.id, code: p.code, name: p.name, report: p.name + " (" + p.code + ")", purchase_price: p.purchase_price, sale_price: p.sale_price, vat: p.vat, grades: p.grades, grades_enabled: p.grades_enabled }; });
            })
            .catch(function(error) {
                console.error("Failed to load products:", error);
                vm.Products = []; // Set empty array on failure
                return []; // Return empty to continue promise chain
            })
        );
        // BPs
        promises.push(Restangular.all("businesspartner")
            .withHttpConfig(timeoutConfig)
            .getList($navigation.get())
            .then(function (data) {
                vm.BusinessPartners = data.map(function (bp) { return { value: bp.id, name: bp.name + " (" + bp.code + ")", report: bp.name + " (" + bp.code + ")" }; });
            })
            .catch(function(error) {
                console.error("Failed to load business partners:", error);
                vm.BusinessPartners = [];
                return [];
            })
        );
        // Hauliers
        promises.push(Restangular.all("haulier")
            .withHttpConfig(timeoutConfig)
            .getList($navigation.get())
            .then(function (data) {
                vm.Hauliers = data.map(function (h) { return { value: h.id, name: h.name + " (" + h.code + ")", report: h.name + " (" + h.code + ")" }; });
            })
            .catch(function(error) {
                console.error("Failed to load hauliers:", error);
                vm.Hauliers = [];
                return [];
            })
        );
        // Pallets (optional)
        promises.push(Restangular.all("pallets")
            .withHttpConfig(timeoutConfig)
            .getList($navigation.get())
            .then(function (data) {
                vm.Pallets = data.map(function (pl) { return { value: pl.id, pallet_name: pl.pallet_name, amount: pl.amount }; });
            })
            .catch(function(error) {
                console.error("Failed to load pallets:", error);
                vm.Pallets = [];
                return [];
            })
        );
        // Contracts
        promises.push($Functions.Contracts ? 
            $Functions.Contracts().then(function (value) {
                vm.allContracts = value || [];
            }).catch(function(error) {
                console.error("Failed to load contracts:", error);
                vm.allContracts = [];
                return [];
            }) : $q.when([])
        );

        // Return promise that handles partial failures gracefully
        return $q.all(promises).catch(function(error) {
            console.error("Some reference data failed to load:", error);
            // Don't fail completely if some reference data fails
            // The individual catch handlers above will set empty arrays
            return true; // Continue with partial data
        });
    }

    function buildContracts() {
        vm.Contracts = [];
        if (!vm.selected_businessPartner || !vm.selected_product || !vm.allContracts || vm.allContracts.length === 0) return;
        vm.Contracts = vm.allContracts.filter(function (contract) {
            return contract.businesspartner_id === vm.selected_businessPartner.value && contract.product_id === vm.selected_product.value;
        }).map(function (c) { return { id: c.id, value: c.id, name: c.name, amount: c.amount, price: c.price }; });
    }

    function loadContractTransactions() {
        if (!vm.selected_contract) return;
        Restangular.all("contracttransaction").withHttpConfig({})
            .get("", { contract_id: vm.selected_contract.value || vm.selected_contract.id })
            .then(function (contractTrans) {
                var delivered = 0;
                angular.forEach(contractTrans, function (trans) { delivered += trans.amount; });
                vm.contractStatus.promised = vm.selected_contract.amount || 0;
                vm.contractStatus.delivered = delivered;
                vm.contractStatus.remaining = (parseFloat(vm.selected_contract.amount) || 0) - delivered;
            }, function (response) { $rootScope.Error(response); });
    }

    vm.Site.formatNumber = function (i) {
        var d = Number.isInteger(vm?.Site?.decimals) && vm.Site.decimals >= 0 ? vm.Site.decimals : 2;
        if (i === undefined || (typeof i !== "number" && typeof i !== "string")) return d > 0 ? (0).toFixed(d) : "0";
        var n = typeof i === "string" ? parseFloat(i) : i;
        if (!Number.isFinite(n)) return d > 0 ? (0).toFixed(d) : "0";
        return d > 0 ? n.toFixed(d) : Math.round(n).toString();
    };

    // Calculation helpers (manual weights, aligned with update)
    vm.calculateMoistureDeduction = function (totalWeight, type) {
        vm.moistureDeduction = 0;
        if (vm.Single.SecondWeight > 0 && vm.Single.moisture_deduction > 0) {
            var level = vm.Setting.moisture_deduction_level || 0;
            var moisturePercentage = parseFloat(vm.Single.moisture_deduction) - level;
            if (moisturePercentage > 0) {
                vm.moistureCoefficient = 1 - (100 - vm.Single.moisture_deduction) / (100 - level);
                var totalWeightUpdate = type === "handling" ? totalWeight - vm.handlingCharges : totalWeight;
                vm.moistureDeduction = totalWeightUpdate * vm.moistureCoefficient;
                vm.Single.moistureDeduction = vm.moistureDeduction || 0;
            }
        }
    };
    vm.calculateHandlingCharges = function (totalWeight, type) {
        vm.handlingCharges = 0;
        if (vm.Single.SecondWeight > 0 && vm.Single.handling_charges > 0) {
            var handlingPercentage = parseFloat(vm.Single.handling_charges);
            if (handlingPercentage > 0) {
                var totalWeightUpdate = type === "moisture" ? totalWeight - vm.moistureDeduction : totalWeight;
                vm.handlingCharges = totalWeightUpdate * (handlingPercentage / 100);
                vm.Single.handlingCharges = vm.handlingCharges || 0;
            }
        }
    };
    vm.calculatePalletCharges = function () {
        vm.palletCharges = 0;
        var palletCount = vm.Single.pallet_count ? parseFloat(vm.Single.pallet_count) : 0;
        if (palletCount > 0 && vm.selected_pallet && vm.selected_pallet.amount) {
            vm.palletCharges = vm.selected_pallet.amount * palletCount;
            vm.Single.pallet_charges = vm.palletCharges || 0;
        }
    };
    vm.updateNetWeight = function () {
        var fw = parseFloat(vm.Single.FirstWeight) || 0;
        var sw = parseFloat(vm.Single.SecondWeight) || 0;
        var gross = Math.abs(sw - fw);
        vm.Single.GrossWeight = gross;
        if (vm.Setting.pallet_enabled === "true") {
            vm.nettWeight = gross - (vm.Single.pallet_charges || 0);
        } else {
            vm.nettWeight = gross;
        }
        var flow = vm.Site.deduct_flow || "default";
        if (flow === 'moisture') {
            vm.calculateMoistureDeduction(vm.nettWeight, flow);
            vm.calculateHandlingCharges(vm.nettWeight, flow);
        } else if (flow === 'handling') {
            vm.calculateHandlingCharges(vm.nettWeight, flow);
            vm.calculateMoistureDeduction(vm.nettWeight, flow);
        } else {
            vm.calculateMoistureDeduction(vm.nettWeight, flow);
            vm.calculateHandlingCharges(vm.nettWeight, flow);
        }
        vm.nettWeight = vm.nettWeight - (vm.Single.handlingCharges || 0) - (vm.Single.moistureDeduction || 0);
    };

    // Selection handlers
    vm.SelectOnChange = function (type) {
        switch (type) {
            case 'haulier':
                vm.Single.haulier_id = vm.selected_haulier ? vm.selected_haulier.value : null;
                if (vm.selected_haulier) vm.ReportData.Hauliers = vm.selected_haulier.report;
                break;
            case 'businesspartner':
                vm.Single.businesspartner_id = vm.selected_businessPartner ? vm.selected_businessPartner.value : null;
                if (vm.selected_businessPartner) vm.ReportData.BusinessPartners = vm.selected_businessPartner.report;
                // contracts depend on BP + product
                buildContracts();
                break;
            case 'product':
                vm.Single.product_id = vm.selected_product ? vm.selected_product.value : null;
                if (vm.selected_product) {
                    vm.ReportData.Products = vm.selected_product.report;
                    if (typeof vm.selected_product.grades === 'string' && vm.selected_product.grades.length) {
                        vm.selected_product.gradesArray = vm.selected_product.grades.split(',').map(function(x){ return x.trim(); });
                    }
                }
                // contracts depend on BP + product
                buildContracts();
                break;
            case 'contract':
                vm.Single.contract_id = vm.selected_contract ? (vm.selected_contract.value || vm.selected_contract.id) : null;
                vm.ReportData.Contract = vm.selected_contract || null;
                loadContractTransactions();
                break;
            case 'pallet':
                vm.Single.pallet_id = vm.selected_pallet ? vm.selected_pallet.value : null;
                if (vm.selected_pallet) {
                    vm.ReportData.Pallet = vm.selected_pallet;
                    vm.ReportData.palletName = vm.selected_pallet.pallet_name;
                    vm.ReportData.amount = vm.selected_pallet.amount;
                }
                vm.calculatePalletCharges();
                vm.updateNetWeight();
                break;
        }
    };

    vm.save = function () {
        $rootScope.Start && $rootScope.Start("ReprintEdit save");
        // Build a clean payload with all expected fields
        var payload = angular.copy(vm.Single) || {};
        // Ensure IDs present (backend relies on them)
        payload.company_id = payload.company_id || vm.HeaderSingle.company_id;
        payload.site_id = payload.site_id || vm.HeaderSingle.site_id;
        payload.workstation_id = payload.workstation_id || vm.HeaderSingle.workstation_id;
        // License plates (force canonical keys)
        payload.RegNumber = payload.RegNumber || payload.RegNumber1 || payload.reg_number || payload.numberplate || payload.number_plate || null;
        if (typeof payload.RegNumber2 === 'undefined') payload.RegNumber2 = payload.reg_number2 || payload.numberplate_2 || null;
        if (typeof payload.RegNumber3 === 'undefined') payload.RegNumber3 = payload.reg_number3 || payload.numberplate_3 || null;
        // Include all Custom1..Custom20 explicitly so backend gets them
        for (var i = 1; i <= 20; i++) {
            var k = 'Custom' + i;
            if (typeof payload[k] === 'undefined') { payload[k] = null; }
            // For SO/SC, map selected to value
            var inputType = vm.Setting['user_defined_input' + i];
            if ((inputType === 'SO' || inputType === 'SC') && vm['selected_Custom' + i]) {
                payload[k] = vm['selected_Custom' + i].key;
            }
            // Coerce to string if present so DB updates as text
            if (payload[k] !== null && typeof payload[k] !== 'string') { payload[k] = String(payload[k]); }
        }
        // Ensure action type so backend takes update path and not verify branch
        payload.actiontype = payload.actiontype || 'Edit';
        // Recalculate totals and include in save payload
        vm.calculatePalletCharges && vm.calculatePalletCharges();
        vm.updateNetWeight && vm.updateNetWeight();
        
        // CRITICAL FIX: Ensure FirstWeight and SecondWeight are properly included in payload
        payload.FirstWeight = parseFloat(vm.Single.FirstWeight) || 0;
        payload.SecondWeight = parseFloat(vm.Single.SecondWeight) || 0;
        payload.TotalWeight = Math.abs(payload.SecondWeight - payload.FirstWeight);
        payload.NettWeight = vm.nettWeight;
        
        // Ensure deduction values are included
        payload.moisture_deduction = parseFloat(vm.Single.moisture_deduction) || 0;
        payload.handling_charges = parseFloat(vm.Single.handling_charges) || 0;
        payload.pallet_count = parseFloat(vm.Single.pallet_count) || 0;
        payload.pallet_charges = parseFloat(vm.Single.pallet_charges) || 0;
        
        if (typeof vm.moistureCoefficient !== 'undefined') payload.moistureCoefficient = vm.moistureCoefficient;
        if (typeof vm.moistureDeduction !== 'undefined') payload.moistureWeight = vm.moistureDeduction;
        if (typeof vm.handlingCharges !== 'undefined') payload.handlingWeight = vm.handlingCharges;
        // Sync ids from selected_* (if present) or preserve existing values when settings are off
        if (vm.selected_businessPartner) {
            payload.businesspartner_id = vm.selected_businessPartner.value;
        } else if (vm.Setting.business_partner !== 'Yes' && vm.Single.businesspartner_id) {
            // Preserve existing value when setting is off
            payload.businesspartner_id = vm.Single.businesspartner_id;
        }
        
        if (vm.selected_haulier) {
            payload.haulier_id = vm.selected_haulier.value;
        } else if (vm.Setting.haulier !== 'Yes' && vm.Single.haulier_id) {
            // Preserve existing value when setting is off
            payload.haulier_id = vm.Single.haulier_id;
        }
        
        if (vm.selected_product) {
            payload.product_id = vm.selected_product.value;
        } else if (vm.Setting.use_product_list !== 'Yes' && vm.Single.product_id) {
            // Preserve existing value when setting is off
            payload.product_id = vm.Single.product_id;
        }
        
        if (vm.selected_pallet) {
            payload.pallet_id = vm.selected_pallet.value;
        } else if (vm.Setting.pallet_enabled !== 'true' && vm.Single.pallet_id) {
            // Preserve existing value when setting is off
            payload.pallet_id = vm.Single.pallet_id;
        }
        
        if (vm.selected_contract) {
            payload.contract_id = vm.selected_contract.value || vm.selected_contract.id;
        } else if (vm.Single.contract_id) {
            // Always preserve contract if it exists (no specific setting check needed)
            payload.contract_id = vm.Single.contract_id;
        }
        
        // Also preserve grade information
        if (vm.Single.grade_id) {
            payload.grade_id = vm.Single.grade_id;
        }
        if (vm.Single.grades) {
            payload.grades = vm.Single.grades;
        }

        // Validations similar to update
        var Error = "";
        function isNumericString(value) { return /^-?\d+(\.\d+)?$/.test(value); }
        if (vm.Setting.business_partner == 'Yes' && !payload.businesspartner_id) { Error += "Please select Business Partner.\n"; }
        if (vm.Setting.use_product_list == 'Yes' && !payload.product_id) { Error += "Please select Product.\n"; }
        if (vm.Setting.haulier == 'Yes' && !payload.haulier_id) { Error += "Please select Haulier.\n"; }
        if (!isNumericString(payload.FirstWeight)) { Error += "Text is invalid for FirstWeight, Please enter a number.\n"; }
        if (!isNumericString(payload.SecondWeight)) { Error += "Text is invalid for SecondWeight, Please enter a number.\n"; }
        if (vm.Site.measure_type === 'kg') {
            if (parseFloat(payload.FirstWeight) > 60000) Error += "Warning weight is above 60 Tons.\n";
            if (parseFloat(payload.SecondWeight) > 60000) Error += "Warning weight is above 60 Tons.\n";
        }
        if (vm.Site.measure_type === 't') {
            if (parseFloat(payload.FirstWeight) > 60) Error += "Warning weight is above 60 Tons.\n";
            if (parseFloat(payload.SecondWeight) > 60) Error += "Warning weight is above 60 Tons.\n";
        }
        if (Error !== "") {
            swal("Oops...", Error, "error");
            $rootScope.Loaded && $rootScope.Loaded("ReprintEdit save validation");
            return;
        }

        // Persist updates
        Restangular.one(routeName, vm.Single.id).customPUT(payload, "").then(function () {
            $rootScope.Loaded && $rootScope.Loaded("ReprintEdit save done");
            swal({ title: "Saved", text: "Transaction updated.", type: "success" }, function () { $state.go('app.reprint_list'); });
        }, function (response) {
            $rootScope.Error(response);
        });
    };

    vm.cancel = function () { $state.go('app.reprint_list'); };
});


