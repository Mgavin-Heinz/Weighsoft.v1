"use strict";

angular
    .module("xenon.controllers")
    .controller("WeighingUpdateCtrl", function ($scope, $state, $rootScope, Restangular, $q, $navigation, $modal, $interval, $filter, $nodeRed, $http, $Functions, $Exceptions, $stateParams, $SharedWeighingFunctions, $EMSOservice, $esp32Control, ScaleEndpointResolver, SiteWeightUnits) {
        const vm = this;
        const routeName = "weighingheaders";
        const CAMERA_REFRESH_MS = 2000;
        function stopAllCameras() {
            if (vm.Cameras && vm.Cameras.length > 0) {
                vm.Cameras.forEach(function (mapData) {
                    if (angular.isDefined(mapData.CameraTick)) {
                        clearInterval(mapData.CameraTick);
                        mapData.CameraTick = undefined;
                    }
                    if (mapData._cancelDefer) {
                        mapData._cancelDefer.resolve();
                        mapData._cancelDefer = undefined;
                    }
                });
            }
        }

        const headerId = $stateParams.id;

        // #region Initialization
        let allContracts = [];
        let allCameras = [];
        let allPallets = [];
        let allTares = [];
        let valueSocket = undefined;
        let scaleSocket = undefined;
        let broadcastSocket = undefined;
        vm.isSaving = false;
        vm.saveSuccessful = false;
        function getScaleContext() {
            return {
                company_id: vm.HeaderSingle.company_id || (vm.Single && vm.Single.company_id),
                site_id: vm.HeaderSingle.site_id || (vm.Single && vm.Single.site_id),
                workstation_id: vm.HeaderSingle.workstation_id || (vm.Single && vm.Single.workstation_id)
            };
        }
        function getScaleBases() {
            return ScaleEndpointResolver.getScaleBases(getScaleContext());
        }

        function notifyMissingWeighbridge(context) {
            console.error("Missing weighbridge configuration in WeighingUpdateCtrl (" + context + ")", {
                transactionId: headerId,
                selectedWeighbridge: vm.selected_weighbridge,
                singleWeighbridgeId: vm.Single && vm.Single.weighbridge_id,
                header: vm.HeaderSingle
            });
            if (typeof toastr !== "undefined" && toastr.error) {
                toastr.error("Unable to load weighbridge configuration for this transaction. Please refresh and reselect workstation/weighbridge.");
            }
        }

        function hasValidWeighbridge() {
            return !!(vm.WeighBridge && typeof vm.WeighBridge.manual !== "undefined");
        }
        function getHeaderSiteId() {
            return vm.HeaderSingle.site_id || (vm.Single && vm.Single.site_id) || ($rootScope.Params && $rootScope.Params.site_id) || null;
        }
        function resolveSharedWorkstationMode() {
            const sharedFromState = String($stateParams.shared_workstation || "").toLowerCase();
            if (sharedFromState === "yes" || sharedFromState === "no")
            {
                return sharedFromState === "yes";
            }
            const siteId = getHeaderSiteId();
            if (!siteId || !$rootScope.MasterData)
            {
                return false;
            }
            const company = $rootScope.MasterData.find(function (item) {
                return item && item.sites && item.sites.find(function (site) { return site.id == siteId; });
            });
            if (!company || !company.sites)
            {
                return false;
            }
            const site = company.sites.find(function (item) {
                return item.id == siteId;
            });
            return !!(site && String(site.shared_workstation || "").toLowerCase() === "yes");
        }
        function isSharedWorkstationEnabled() {
            return resolveSharedWorkstationMode();
        }
        function isSecondWeighingTransaction(header) {
            return !!(header && String(header.status || "").toUpperCase() === "OPEN");
        }
        function requiresManualWeighbridgeSelection(header) {
            return isSharedWorkstationEnabled() && isSecondWeighingTransaction(header);
        }
        function hydrateHeaderContextFromParams() {
            if (!$rootScope.Params)
            {
                return;
            }
            if (!vm.HeaderSingle.company_id && $rootScope.Params.company_id)
            {
                vm.HeaderSingle.company_id = $rootScope.Params.company_id;
            }
            if (!vm.HeaderSingle.site_id && $rootScope.Params.site_id)
            {
                vm.HeaderSingle.site_id = $rootScope.Params.site_id;
            }
            if (!vm.HeaderSingle.workstation_id && $rootScope.Params.workstation_id)
            {
                vm.HeaderSingle.workstation_id = $rootScope.Params.workstation_id;
            }
        }

        $rootScope.WeighBridge = {};
        $scope.showweighings = function (weighings) {
            return weighings.status == "OPEN" || weighings.status == "VERIFY";
        };
        vm.Companies = [];
        vm.Sites = [];
        vm.Workstations = [];
        vm.User;
        vm.HeaderSingle = {
            company_id: $stateParams.company_id,
            site_id: $stateParams.site_id,
            workstation_id: $stateParams.workstation_id,
            company: $stateParams.company,
            site: $stateParams.site,
            workstation: $stateParams.workstation
        };
        vm.selected_settings = 0;
        function setDefaultData() {
            vm.invoice = {
                productLines: [],
                subTotal: 0,
                vat: 0,
                total: 0,
                balanceDue: 0,
                amountDue: 0,
                businessPartner: null,
            };
            vm.nettWeight = 0;
            vm.contractStatus = {
                promised: 0,
                delivered: 0,
                remaining: 0,
            };
            vm.NumberplateClass = "";
            vm.NumberplateVerify = "warning";
            vm.FingerPrintVerify = "No";
            vm.SiloOverride = "No";
            vm.ReportData = {
                Hauliers: null,
                BusinessPartners: null,
                Products: null,
                Settings: null,
                Pallets: null,
                Tares: null,
                Pallet: null,
                palletName: null,
                amount: null,
            };

            vm.handlingAlias = "Handling";
            vm.Site = {
                decimals: $stateParams.SiteDecimals,
                measure_type: $stateParams.SiteMeasure_type,
                deduct_flow: $stateParams.SiteDeduct_flow
            };
            vm.weighingTypes = [];
            vm.Hauliers = [];
            vm.Businesspartners = [];
            vm.Products = [];
            vm.Pallets = [];
            vm.Tares = [];
            vm.Settings = [];
            vm.Cameras = [];
            vm.ScannedUser = null;
            vm.selected_businessPartner = [];
            vm.selected_contract = [];
            vm.selected_pallet = [];
            vm.selected_tare = [];
            vm.selected_product = [];
            vm.selected_haulier = [];
            vm.formData = [];
            vm.siloSaveFlag = false;
            vm.deleteFormDisplay = false;
            vm.totalWeightWithMoisture = 0;
            vm.moistureDeduction = 0;
            vm.palletCharges = 0;
            vm.Setting = {
                company_id: "",
                name: "New Name",
                haulier: "false",
                use_product_list: "false",
                stored_tares: "false",
                numberplate_1: "No",
                numberplate_recognition: "No",
                numberplate_2: "No",
                numberplate_3: "No",
                business_partner: "false",
                type_of_weighing: "single",
                first_can_axel: "false",
                second_can_axel: "false",
                goods_type: "Received Goods",
                print_ticket: "none",
                reprint: "false",
                custom_fields: "false",
                user_defined_input1: "N",
                user_defined_name1: "",
                user_defined_val1: "",
                user_defined_rep1: "false",
                user_defined_input2: "N",
                user_defined_name2: "",
                user_defined_val2: "",
                user_defined_rep2: "false",
                user_defined_input3: "N",
                user_defined_name3: "",
                user_defined_val3: "",
                user_defined_rep3: "false",
                user_defined_input4: "N",
                user_defined_name4: "",
                user_defined_val4: "",
                user_defined_rep4: "false",
                user_defined_input5: "N",
                user_defined_name5: "",
                user_defined_val5: "",
                user_defined_rep5: "false",
                user_defined_input6: "N",
                user_defined_name6: "",
                user_defined_val6: "",
                user_defined_rep6: "false",
                user_defined_input7: "N",
                user_defined_name7: "",
                user_defined_val7: "",
                user_defined_rep7: "false",
                user_defined_input8: "N",
                user_defined_name8: "",
                user_defined_val8: "",
                user_defined_rep8: "false",
                user_defined_input9: "N",
                user_defined_name9: "",
                user_defined_val9: "",
                user_defined_rep9: "false",
                user_defined_input10: "N",
                user_defined_name10: "",
                user_defined_val10: "",
                user_defined_rep10: "false",
                user_defined_input11: "N",
                user_defined_name11: "",
                user_defined_val11: "",
                user_defined_rep11: "false",
                user_defined_input12: "N",
                user_defined_name12: "",
                user_defined_val12: "",
                user_defined_rep12: "false",
                user_defined_input13: "N",
                user_defined_name13: "",
                user_defined_val13: "",
                user_defined_rep13: "false",
                user_defined_input14: "N",
                user_defined_name14: "",
                user_defined_val14: "",
                user_defined_rep14: "false",
                user_defined_input15: "N",
                user_defined_name15: "",
                user_defined_val15: "",
                user_defined_rep15: "false",
                user_defined_input16: "N",
                user_defined_name16: "",
                user_defined_val16: "",
                user_defined_rep16: "false",
                user_defined_input17: "N",
                user_defined_name17: "",
                user_defined_val17: "",
                user_defined_rep17: "false",
                user_defined_input18: "N",
                user_defined_name18: "",
                user_defined_val18: "",
                user_defined_rep18: "false",
                user_defined_input19: "N",
                user_defined_name19: "",
                user_defined_val19: "",
                user_defined_rep19: "false",
                user_defined_input20: "N",
                user_defined_name20: "",
                user_defined_val20: "",
                user_defined_rep20: "false",
                export_AS400: "false",
                silo_verification: "false",
                use_cameras: "false",
                display_cameras: "false",
                print_cameras_on_ticket: "false",
                ticket_header: "false",
                display_custom_header_img: "",
                custom_header_text: "",
                ticket_footer: "false",
                display_custom_footer_img: "",
                custom_footer_text: "",
            };
            vm.exception = {
                code: "Transaction Deleted",
                description: "",
                jsondata: "",
                comment: "",
                weighbridge_id: "",
                workstation_id: "",
                site_id: "",
                company_id: "",
            };
        }
        vm.Weighbridges = [];
        vm.Single = {};
        vm.expectManualWeighbridgeSelection = false;
        setDefaultData();
        // #endregion
        // #region Module Functions
        let selectedWeighingId = null;
        vm.SetSettings = function () {
            vm.Single.settings_id = vm.selected_settings.id;
            const site = vm.Sites.find((site) => site.value == vm.HeaderSingle.site_id);
            if (site && site.override_silo != null)
            {
                vm.Single.SiloOverride = site.override_silo;
                //vm.Single.Settings.selected_settings.invoice_enabled = true;
            }
        };
        vm.baseData = Restangular.all(routeName).withHttpConfig();
        $rootScope.WeighFeedback = "";
        $rootScope.FingerFeedback = "";
        vm.NumberplateChange = function () {
            const inlist = vm.formData.findIndex((list) => list.RegNumber == vm.Single.RegNumber && list.status !== "CLOSED" && list.settings_id == vm.Single.settings_id);

            if (vm.Single.RegNumber == "Loading.." || vm.Single.RegNumber == "Numberplate not recognized" || inlist > -1) vm.NumberplateClass = "invalid";
            else vm.NumberplateClass = "";

            // Smart Hauliers feature: Auto-select haulier based on vehicle registration
            // Only trigger if Numberplate1 is enabled AND Smart Hauliers is enabled on company
            vm.autoSelectedVehicle = null;
            vm.autoSelectedHaulier = false;
            vm.autoSelectedBusinessPartner = false;
            
            // Get company data from $rootScope.MasterData to check smart_hauliers flag
            const currentCompany = $rootScope.MasterData ? 
                $rootScope.MasterData.find(function(c) { return c.id === vm.HeaderSingle.company_id; }) : null;
            
            if (vm.Setting.numberplate_1 == "Yes" && 
                currentCompany && 
                currentCompany.smart_hauliers == 1 &&
                vm.Single.RegNumber && 
                vm.Single.RegNumber != "Loading.." && 
                vm.Single.RegNumber != "Numberplate not recognized") {
                
                console.log('[Smart Hauliers] Looking up vehicle:', vm.Single.RegNumber);
                $rootScope.Start();
                
                Restangular.one('vehicle-lookup')
                    .get({ registration: vm.Single.RegNumber, company_id: vm.HeaderSingle.company_id })
                    .then(function(response) {
                        if (response && response.haulier) {
                            console.log('[Smart Hauliers] Vehicle found:', response);
                            vm.autoSelectedVehicle = response;
                            
                            // Auto-select haulier and trigger dropdown update
                            var haulier = vm.Hauliers.find(function(h) { return h.id === response.haulier.id; });
                            if (haulier) {
                                console.log('[Smart Hauliers] Auto-selecting haulier:', haulier.name);
                                vm.selected_haulier = haulier;
                                vm.autoSelectedHaulier = true;
                                vm.SelectOnChange('haulier');
                            }
                            
                            // Auto-select business partner if linked and trigger dropdown update
                            if (response.haulier.business_partner && response.haulier.business_partner.id) {
                                var bp = vm.BusinessPartners.find(function(b) { return b.id === response.haulier.business_partner.id; });
                                if (bp) {
                                    console.log('[Smart Hauliers] Auto-selecting business partner:', bp.name);
                                    vm.selected_businessPartner = bp;
                                    vm.autoSelectedBusinessPartner = true;
                                    vm.SelectOnChange('businesspartner');
                                }
                            }
                            
                            // Force UI update to refresh dropdowns
                            $scope.$applyAsync();
                            $rootScope.Loaded();
                        } else {
                            console.log('[Smart Hauliers] No vehicle found for:', vm.Single.RegNumber);
                            $rootScope.Loaded();
                        }
                    }, function(error) {
                        // Vehicle not found - that's okay, just don't auto-select
                        console.log('[Smart Hauliers] Vehicle lookup failed:', error);
                        vm.autoSelectedVehicle = null;
                        vm.autoSelectedHaulier = false;
                        vm.autoSelectedBusinessPartner = false;
                        $rootScope.Loaded();
                    });
            }
        };
        vm.GetCamera = function () {
            vm.Cameras.forEach(function (mapData) {
                mapData.src = mapData.ip_address + "?time=" + Math.floor(Math.random() * 1000000000);
            });
        };
        vm.NPR = function () {
            if (vm.Setting.numberplate_recognition !== "Yes" || vm.Setting.numberplate_1 !== "Yes") {
                return;
            }
            if (!vm.pn_recog || typeof vm.pn_recog !== "string" || vm.pn_recog.indexOf("data:image/") !== 0) {
                vm.Single.RegNumber = "Numberplate not recognized";
                vm.NumberplateChange();
                return;
            }
            var base64Match = vm.pn_recog.match(/^data:image\/[^;]+;base64,(.+)$/);
            var base64 = base64Match ? base64Match[1] : null;
            if (!base64) {
                vm.Single.RegNumber = "Numberplate not recognized";
                vm.NumberplateChange();
                return;
            }
            vm.Single.RegNumber = "Loading..";
            vm.NumberplateChange();
            $rootScope.Start();
            Restangular.all("numberplate-recognition").post({ imageBase64: base64 }).then(
                function (response) {
                    vm.Single.RegNumber = (response && (response.plate_number || response.regNumber)) || "Numberplate not recognized";
                    vm.NumberplateChange();
                    if (typeof vm.GetCamera === "function") {
                        vm.GetCamera();
                    }
                    $rootScope.Loaded();
                },
                function (response) {
                    vm.Single.RegNumber = "Numberplate not recognized";
                    vm.NumberplateChange();
                    if (typeof vm.GetCamera === "function") {
                        vm.GetCamera();
                    }
                    $rootScope.Error(response);
                    $rootScope.Loaded();
                }
            );
        };

        vm.calculateMoistureDeduction = function (totalWeight, type) {
            vm.moistureDeduction = 0;

            if (vm.Single.SecondWeight > 0 && vm.Single.moisture_deduction > 0)
            {
                const moisturePercentage = parseFloat(vm.Single.moisture_deduction) - vm.Setting.moisture_deduction_level;
                if (moisturePercentage > 0)
                {
                    vm.moistureCoefficient = 1 - (100 - vm.Single.moisture_deduction) / (100 - vm.Setting.moisture_deduction_level);
                    let totalWeightUpdate = type === "handling" ? totalWeight - vm.handlingCharges : totalWeight;
                    vm.moistureDeduction = totalWeightUpdate * vm.moistureCoefficient;
                    vm.Single.moistureDeduction = vm.moistureDeduction || 0;
                }
            }
        };

        vm.handlingCharges = 0;
        vm.calculateHandlingCharges = function (totalWeight, type) {
            vm.handlingCharges = 0;

            if (vm.Single.SecondWeight > 0 && vm.Single.handling_charges > 0)
            {
                const handlingPercentage = parseFloat(vm.Single.handling_charges);
                if (handlingPercentage > 0)
                {
                    const totalWeightUpdate = type === "moisture" ? totalWeight - vm.moistureDeduction : totalWeight;
                    vm.handlingCharges = totalWeightUpdate * (handlingPercentage / 100);
                    vm.Single.handlingCharges = vm.handlingCharges || 0;
                }
            }
        };
        vm.updateNetWeight = function () {
            //updated
            if (vm.Setting.pallet_enabled === "true") {
                vm.nettWeight = Math.abs(vm.Single.SecondWeight - vm.Single.FirstWeight) - (vm.Single.pallet_charges || 0);
            } else {
                vm.nettWeight = Math.abs(vm.Single.SecondWeight - vm.Single.FirstWeight);
            }

            const flow = vm.Site.deduct_flow || "default";
            
            // Calculate deductions based on flow type
            if (flow === 'moisture') {
                // Option 2: Calculate moisture first, then handling
                vm.calculateMoistureDeduction(vm.nettWeight, flow);
                vm.calculateHandlingCharges(vm.nettWeight, flow);
            } else if (flow === 'handling') {
                // Option 3: Calculate handling first, then moisture
                vm.calculateHandlingCharges(vm.nettWeight, flow);
                vm.calculateMoistureDeduction(vm.nettWeight, flow);
            } else {
                // Option 1: Calculate both on full nett weight
                vm.calculateMoistureDeduction(vm.nettWeight, flow);
                vm.calculateHandlingCharges(vm.nettWeight, flow);
            }

            // Perform the final calculation
            vm.nettWeight = vm.nettWeight - (vm.Single.handlingCharges || 0) - (vm.Single.moistureDeduction || 0);
            vm.recalculatePricing();
        };

        vm.formatNumber = function (i) {
            const decimals = SiteWeightUnits.displayDecimalsFromWeighbridgeOrSite(vm.WeighBridge, vm.Site);
        
            // Handle missing/invalid input
            if (i === undefined || (typeof i !== "number" && typeof i !== "string")) {
                return decimals > 0 ? (0).toFixed(decimals) : 0;
            }
        
            // Parse strings to number
            const n = typeof i === "string" ? parseFloat(i) : i;
        
            if (!Number.isFinite(n)) {
                return decimals > 0 ? (0).toFixed(decimals) : 0;
            }
        
            // Keep your Math.round behavior, then format as needed
            const factor = Math.pow(10, decimals);
            const rounded = Math.round(n * factor) / factor;
        
            // If decimals > 0, return a string with fixed trailing zeros (e.g., "0.00")
            return decimals > 0 ? rounded.toFixed(decimals) : rounded; // number when decimals === 0
        };

        vm.SelectOnChange = function (type) {
            switch (type)
            {
                case "company":
                    $navigation.Company(vm.HeaderSingle.company_id);
                    $Functions.Company(vm.User.company_id).then(function (companyList) {
                        vm.Companies = companyList;
                        if ($rootScope.Params.company_id !== null)
                        {
                            vm.HeaderSingle.company_id = $rootScope.Params.company_id;
                            $navigation.Company(vm.HeaderSingle.company_id);
                            vm.ReportData.Company = $rootScope.MasterData.find((company) => company.id === $rootScope.Params.company_id);
                            vm.Settings.selected_settings.invoice_enabled = true;
                            GetSites();
                        } else
                        {
                            $rootScope.Loaded("Single Site on WeighingUpdateCtrl");
                        }
                    });

                    break;
                case "site":
                    $Functions.Site().then(
                        function (siteList) {
                            vm.Sites = siteList;
                            $navigation.Site(vm.HeaderSingle.site_id);
                            if (vm.Sites.length == 1 || $rootScope.Params.site_id !== null)
                            {
                                if (vm.Sites.length == 1)
                                {
                                    vm.HeaderSingle.site_id = vm.Sites[0].value;
                                    $rootScope.Params.site_id = vm.Sites[0].value;
                                }
                                vm.HeaderSingle.site_id = $rootScope.Params.site_id;
                                GetWorkstations();
                            }
                            $rootScope.Loaded("Single Site on WeighingUpdateCtrl");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );

                    break;
                case "workstation":
                    $Functions.Workstation().then(
                        function (workstationList) {
                            vm.Workstations = workstationList;
                            $navigation.Workstation(vm.HeaderSingle.workstation_id);
                            vm.HeaderSingle.workstation_id = $rootScope.Params.workstation_id;
                            if (vm.Workstations.length == 1 || $rootScope.Params.workstation_id !== null)
                            {
                                if (vm.Workstations.length == 1)
                                {
                                    vm.HeaderSingle.workstation_id = vm.Workstations[0].value;
                                }
                                LoadData();
                            }
                            $rootScope.Loaded("Single Workstation on WeighingUpdateCtrl");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                case "settings":
                    vm.SetSettings();
                    $Functions.secondWeightLoad(vm.selected_settings.id).then(function (data) {
                        vm.Setting = data.Setting;
                        vm.ReportData.Settings = data.Setting.name;
                        // updated
                        vm.Single.type_of_weighing = data.Setting.type_of_weighing;
                        vm.Setting.tares_enabled = data.Setting.tares_enabled;
                        vm.Setting.stored_tares = data.Setting.stored_tares;
                        vm.selected_settings.contract_enabled = data.Setting.contract_enabled;
                        vm.selected_settings.contract_enabled = data.Setting.use_cameras;
                        vm.selected_settings.contract_enabled = data.Setting.display_cameras;
                        vm.ReportData.Header = vm.Settings.custom_header_text;
                        vm.ReportData.HeaderImg = data.Setting.display_custom_header_img;
                        vm.ReportData.Footer = vm.Settings.custom_footer_text;
                        vm.ReportData.FooterImg = data.Setting.display_custom_footer_img;
                        if (data.haulier !== undefined)
                        {
                            vm.Hauliers = data.haulier;
                        }
                        if (data.stored_tares !== undefined)
                        {
                            vm.Tares = data.stored_tares;
                        }
                        if (data.business_partner !== undefined)
                        {
                            vm.BusinessPartners = data.business_partner;
                        }
                        if (data.use_product_list !== undefined)
                        {
                            vm.Products = data.use_product_list;
                        }
                        if (data.use_cameras !== undefined)
                        {
                            if (data.Setting.use_cameras !== 'No' || data.Setting.use_cameras !== 'false')
                            {
                                allCameras = data.use_cameras.filter(camera => camera.camera_active === 'true');
                            }
                        }

                        if (data.pallet_enabled !== undefined)
                        {
                            vm.Pallets = data.pallet_enabled;
                        }
                        if (data.contract_enabled !== undefined)
                        {
                            vm.allContracts = data.contract_enabled;
                        }
                    });

                    // LoadData();
                    break;
                case "weighbridge":
                    $navigation.Weighbridge(vm.selected_weighbridge.id);
                    vm.Single.weighbridge_id = vm.selected_weighbridge.id;
                    vm.WeighBridge = vm.selected_weighbridge;
                    vm.expectManualWeighbridgeSelection = false;
                    vm.ResetWeighing();
                    vm.broadcastTransactionUpdate();
                    break;
                case "haulier":
                    vm.Single.haulier_id = vm.selected_haulier.id;
                    if (vm.Hauliers && vm.Hauliers.length > 0)
                    {
                        let haulier = vm.Hauliers.find((data) => vm.Single.haulier_id === data.value);
                        if (haulier)
                        {
                            vm.ReportData.Hauliers = haulier.report;
                            //vm.ReportData.HauliersName = haulier.name + "(" + haulier.code + ")";
                        }
                    }
                    vm.broadcastTransactionUpdate();
                    break;
                case "businesspartner":
                    vm.Single.businesspartner_id = vm.selected_businessPartner.id;
                    if (vm.BusinessPartners && vm.BusinessPartners.length > 0)
                    {
                        let businessPartner = vm.BusinessPartners.find((data) => vm.Single.businesspartner_id === data.value);
                        if (businessPartner)
                        {
                            vm.ReportData.BusinessPartners = businessPartner.report;
                        }
                    }
                    vm.loadContracts();
                    vm.broadcastTransactionUpdate();
                    break;
                case "contract":
                    vm.Single.contract_id = vm.selected_contract.value;
                    if (vm.allContracts && vm.allContracts.length > 0)
                    {
                        vm.selected_contract = vm.allContracts.find((contract) => contract.id == vm.Single.contract_id);
                        if (vm.selected_contract)
                        {
                            vm.ReportData.Contract = vm.selected_contract;
                            vm.Single.stockpile_nr = vm.selected_contract.stockpile_nr != null && vm.selected_contract.stockpile_nr !== "" ? vm.selected_contract.stockpile_nr : "";
                            vm.Single.destination = vm.selected_contract.destination != null && vm.selected_contract.destination !== "" ? vm.selected_contract.destination : "";
                        }
                        loadContractTransactions();
                    }
                    vm.recalculatePricing();
                    break;
                case "pallet":
                    vm.Single.pallet_id = vm.selected_pallet.id;
                    if (vm.Pallets && vm.Pallets.length > 0)
                    {
                        let pallet = vm.Pallets.find((data) => vm.Single.pallet_id === data.value);
                        if (pallet)
                        {
                            vm.ReportData.Pallet = pallet;
                            vm.ReportData.palletName = pallet.pallet_name;
                            vm.ReportData.amount = pallet.amount;
                            vm.ReportData.palletAmount = vm.amount
                        }
                    }
                    break;
                case "tare":
                    vm.Single.tare_id = vm.selected_tare.id;
                    if (vm.Tares && vm.Tares.length > 0)
                    {
                        let tare = vm.Tares.find((data) => vm.Single.tare_id == data.id);
                        if (tare)
                        {
                            var tareKg = parseFloat(tare.weight);
                            var inSite = SiteWeightUnits.kgToSiteUnits(tareKg, vm.Site.measure_type);
                            vm.Single.FirstWeight = SiteWeightUnits.roundToDecimals(
                                inSite,
                                SiteWeightUnits.displayDecimalsFromWeighbridgeOrSite(vm.WeighBridge, vm.Site)
                            );
                            vm.ReportData.Tare = tare;
                        }
                    }
                    break;
                case "product":
                    vm.Single.product_id = vm.selected_product.id;
                    vm.Single.product_grades_enabled = vm.selected_product && vm.selected_product.grades_enabled ? vm.selected_product.grades_enabled : 'No';
                    if (vm.Products && vm.Products.length > 0)
                    {
                        let product = vm.Products.find(data => vm.Single.product_id == data.value);
                        if (product)
                        {
                            vm.ReportData.Products = product.report;
                            vm.Single.product_grades_enabled = product.grades_enabled || 'No';
                        }
                        // Process grades for the selected product
                        // if (vm.selected_product && vm.selected_product.grades) {
                        //     vm.selected_product.grades = vm.selected_product.grades.split(',').map(function(grade) {
                        //         return { displayName: grade.trim() };
                        //     });
                        //     console.log('PRODUCT GRADES', vm.selected_product.grades);
                        // } else {
                        //     vm.selected_product.grades = [];
                        // }
                        vm.loadContracts();
                    }
                    vm.recalculatePricing();
                    vm.broadcastTransactionUpdate();
                    break;
            }
        };

        // Transaction Update Broadcasting for Mobile Display
        vm.broadcastTransactionUpdate = function() {
            if (broadcastSocket && broadcastSocket.readyState === WebSocket.OPEN) {
                const message = {
                    type: 'transaction_update',
                    data: {
                        weighbridge: vm.WeighBridge ? {
                            id: vm.Single.weighbridge_id,
                            name: vm.WeighBridge.name
                        } : null,
                        business_partner: vm.selected_businessPartner ? {
                            id: Array.isArray(vm.selected_businessPartner) ? vm.selected_businessPartner[0]?.id : vm.selected_businessPartner.id,
                            name: Array.isArray(vm.selected_businessPartner) ? (vm.selected_businessPartner[0]?.name || vm.selected_businessPartner[0]?.registered_name) : (vm.selected_businessPartner.name || vm.selected_businessPartner.registered_name),
                            code: Array.isArray(vm.selected_businessPartner) ? vm.selected_businessPartner[0]?.code : vm.selected_businessPartner.code
                        } : null,
                        haulier: vm.selected_haulier ? {
                            id: Array.isArray(vm.selected_haulier) ? vm.selected_haulier[0]?.id : vm.selected_haulier.id,
                            name: Array.isArray(vm.selected_haulier) ? vm.selected_haulier[0]?.name : vm.selected_haulier.name,
                            code: Array.isArray(vm.selected_haulier) ? vm.selected_haulier[0]?.code : vm.selected_haulier.code
                        } : null,
                        vehicle: vm.Single.vehicle_number ? {
                            rfid: vm.Single.rfid,
                            registration: vm.Single.vehicle_number
                        } : null,
                        product: vm.selected_product ? {
                            id: Array.isArray(vm.selected_product) ? vm.selected_product[0]?.id : vm.selected_product.id,
                            name: Array.isArray(vm.selected_product) ? vm.selected_product[0]?.name : vm.selected_product.name,
                            code: Array.isArray(vm.selected_product) ? vm.selected_product[0]?.code : vm.selected_product.code
                        } : null,
                        weight: vm.Single.weight || vm.Single.SecondWeight || 0,
                        operator: vm.ScannedUser ? {
                            firstname: vm.ScannedUser.firstname,
                            lastname: vm.ScannedUser.lastname,
                            fingerprint: vm.ScannedUser.fingerprint
                        } : null,
                        workstation_id: vm.HeaderSingle.workstation_id,
                        timestamp: new Date().toISOString()
                    }
                };
                broadcastSocket.send(JSON.stringify(message));
            }
        };

        function roundToTwo(num) {
            return +(Math.round(num + "e+2") + "e-2");
        }

        vm.recalculatePricing = function () {
            const product = vm.selected_product;
            if (!product) {
                vm.ReportData.productPrice = null;
                vm.ReportData.productPriceLabel = null;
                vm.ReportData.productVat = 0;
                vm.ReportData.pricingExclVat = 0;
                vm.ReportData.pricingVat = 0;
                vm.ReportData.pricingFinal = 0;
                return;
            }

            const rawPrice = vm.Setting.goods_type === "1" ? product.purchase_price : product.sale_price;
            let unitPrice = parseFloat(rawPrice);

            if (vm.Setting.contract_enabled && vm.selected_contract && vm.selected_contract.price && vm.selected_contract.price.length > 0) {
                const contractPrice = parseFloat(vm.selected_contract.price);
                if (Number.isFinite(contractPrice)) {
                    unitPrice = contractPrice;
                }
            }

            const netWeight = parseFloat(vm.nettWeight ?? vm.Single?.NettWeight ?? 0);
            const safeNetWeight = Number.isFinite(netWeight) ? netWeight : 0;
            const KG_PER_TON = 1000;
            const exclVat = Number.isFinite(unitPrice) ? unitPrice * (safeNetWeight / KG_PER_TON) : 0;
            const vatRate = parseFloat(product.vat);
            const safeVatRate = Number.isFinite(vatRate) ? vatRate : 0;
            const vatAmount = roundToTwo(exclVat * (safeVatRate / 100));
            const total = exclVat + vatAmount;

            vm.ReportData.productPrice = Number.isFinite(unitPrice) ? unitPrice : null;
            vm.ReportData.productPriceLabel = vm.Setting.goods_type === "1" ? "Purchase Price (per Ton)" : "Unit price (per Ton)";
            vm.ReportData.productVat = safeVatRate;
            vm.ReportData.pricingExclVat = exclVat;
            vm.ReportData.pricingVat = vatAmount;
            vm.ReportData.pricingFinal = total;
        };

        vm.SetReportingData = function (data) {

            vm.Settings = data.Settings;
            vm.Setting = data.Setting;
            vm.ReportData.Settings = data.Setting.name;
            // vm.ReportData.Header = data.Setting.custom_header_text;
            // vm.ReportData.HeaderImg = data.Setting.display_custom_header_img;
            // vm.ReportData.Footer = data.Setting.custom_footer_text;
            // vm.ReportData.FooterImg = data.Setting.display_custom_footer_img;
            vm.Single.transaction = data.transaction;
            vm.Single.RegNumber = data.RegNumber;
            vm.Single.RegNumber2 = data.RegNumber2;
            vm.Single.RegNumber3 = data.RegNumber3;
            vm.Single.FirstWeight = data.FirstWeight.WeightTotal;
            vm.Single.SecondWeight = data.SecondWeight != undefined && data.SecondWeight.WeightTotal != null ? data.SecondWeight.WeightTotal : 0;
            vm.Single.FirstDate = data.FirstWeight.created_at;
            vm.Single.SecondDate = data.SecondWeight != null ? data.SecondWeight.created_at : null;
            // Use preserved selections if available to prevent race conditions
            const selections = vm.preservedSelections || {
                businessPartner: vm.selected_businessPartner,
                haulier: vm.selected_haulier,
                product: vm.selected_product,
                contract: vm.selected_contract,
                pallet: vm.selected_pallet
            };
            
            vm.ReportData.BusinessPartners = selections.businessPartner ? selections.businessPartner.report : null;
            vm.invoice.businessPartner = selections.businessPartner;
            vm.Site.formatNumber = vm.formatNumber;
            vm.ReportData.Company = $rootScope.MasterData.find((company) => company.id === $rootScope.Params.company_id);
            vm.ReportData.Site = vm.ReportData.Company.sites.find((site) => site.id === $rootScope.Params.site_id);
            if (selections.contract != null)
            {
                vm.ReportData.Contract = selections.contract;
                // Calculate the contract status based on this weighing and past
                angular.extend(vm.ReportData.Contract, {
                    promised: vm.Single.contract_total_amount,
                    delivered: vm.Single.contract_delivered_amount,
                    remaining: vm.Single.contract_remaining_amount,
                });
            }

            // Add product invoice details
            if (data.Setting.invoice_enabled == "true")
            {
                buildProductInvoice();
            }
            vm.ReportData.moistureDeduction = vm.moistureDeduction;
            vm.ReportData.handlingCharges = vm.handlingCharges;
            vm.ReportData.palletCharges = vm.palletCharges;
            vm.ReportData.MeasureTypes = vm.Setting.measure_type;
            vm.ReportData.nett = vm.nettWeight;
            vm.ReportData.Hauliers = selections.haulier ? selections.haulier.report : null;
            vm.ReportData.Products = selections.product ? selections.product.report : null;
            vm.Single.product_grades_enabled = selections.product && selections.product.grades_enabled ? selections.product.grades_enabled : 'No';
            if (selections.product) {
                var rawPrice = (vm.Setting.goods_type === "1") ? selections.product.purchase_price : selections.product.sale_price;
                var parsedPrice = parseFloat(rawPrice);
                var parsedVat = parseFloat(selections.product.vat);
                var netWeight = parseFloat(vm.ReportData.nett || 0);
                var safeNetWeight = isNaN(netWeight) ? 0 : netWeight;
                const KG_PER_TON = 1000;
                var exclVat = isNaN(parsedPrice) ? 0 : (parsedPrice * (safeNetWeight / KG_PER_TON));
                var safeVatRate = isNaN(parsedVat) ? 0 : parsedVat;
                var vatAmount = exclVat * (safeVatRate / 100);
                vm.ReportData.productPrice = isNaN(parsedPrice) ? null : parsedPrice;
                vm.ReportData.productPriceLabel = (vm.Setting.goods_type === "1") ? "Purchase Price (per Ton)" : "Unit price (per Ton)";
                vm.ReportData.productVat = safeVatRate;
                vm.ReportData.pricingExclVat = exclVat;
                vm.ReportData.pricingVat = vatAmount;
                vm.ReportData.pricingFinal = exclVat + vatAmount;
            } else {
                vm.ReportData.productPrice = null;
                vm.ReportData.productPriceLabel = null;
                vm.ReportData.productVat = 0;
                vm.ReportData.pricingExclVat = 0;
                vm.ReportData.pricingVat = 0;
                vm.ReportData.pricingFinal = 0;
            }
            vm.Single.handlingAlias = vm.handlingAlias;
            if (data.FirstUser) {
                vm.Single.FirstUser = data.FirstUser;
            }
            if (data.user_name) {
                vm.Single.user_name = data.user_name;
            }
        };
        // #endregion

        // #region Ticket and Invoice Actions
        const buildProductInvoice = function () {
            const productLines = [];
            const productPrice = vm.Setting.goods_type === "1" ? vm.selected_product.purchase_price : vm.selected_product.sale_price;
            let unitPrice = parseFloat(productPrice);

            if (vm.Setting.contract_enabled && vm.selected_contract)
            {
                if (vm.selected_contract.price && vm.selected_contract.price.length > 0) unitPrice = parseFloat(vm.selected_contract.price);
            }
            const netWeight = vm.Single.NettWeight;
            const KG_PER_TON = 1000;
            const productLine = {
                code: vm.selected_product.code,
                desc: vm.selected_product.name,
                unitPrice: unitPrice,
                qty: { value: netWeight, symbol: vm.Setting.MeasureTypes },
                total: unitPrice * (netWeight / KG_PER_TON),
                type: "P",
            };
            productLines.push(productLine);

            vm.invoice.productLines = productLines;
            //vm.invoice.subTotal = productLine.total - handlingCharge - (moistureCharge ? moistureCharge : 0) - (palletCharge ? palletCharge : 0);
            vm.invoice.subTotal = unitPrice * (netWeight / KG_PER_TON);
            vm.invoice.vat = vm.selected_product.vat ? roundToTwo((vm.invoice.subTotal * parseFloat(vm.selected_product.vat)) / 100) : 0;
            vm.invoice.total = vm.invoice.subTotal + vm.invoice.vat;
            vm.invoice.balanceDue = vm.invoice.amountDue = vm.invoice.total;
        };

        // #region Contract Transactions
        const loadContractTransactions = function () {
            $rootScope.Start();
            Restangular.all("contracttransaction").withHttpConfig({})
                .get("", { contract_id: vm.Single.contract_id })
                .then(
                    function (contractTrans) {

                        let delivered = 0;
                        angular.forEach(contractTrans, function (trans) {
                            delivered += trans.amount;
                        });
                        (vm.Single.contract_total_amount = vm.selected_contract.amount), (vm.contractStatus.delivered = delivered);
                        vm.Single.contract_remaining_amount = parseFloat(vm.selected_contract.amount) - delivered;
                        vm.deriveContractStatus();
                        $rootScope.Loaded();
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
        };

        vm.loadContracts = function (item) {
            if (vm.selected_settings.contract_enabled === "false") return;

            // Upon edit the contracts are not loaded before products and business partners
            // hence calling the API in this case
            if (allContracts.length === 0)
            {
                $Functions.Contracts().then(
                    function (value) {
                        allContracts = value;
                        populateContracts();
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
            } else
            {
                populateContracts();
            }
        };
        vm.deriveContractStatus = function () {
            if (vm.Single.actiontype === "New" && vm.selected_settings.tares_enabled !== "true")
            {
                loadContractTransactions();
            } else
            {
                let thisWeighingAmount = 0;
                if (vm.Single.SecondWeight && vm.Single.SecondWeight > 0)
                {
                    thisWeighingAmount = vm.nettWeight ? vm.nettWeight : Math.abs(parseFloat(vm.Single.FirstWeight) - parseFloat(vm.Single.SecondWeight));
                }
                // Calculate the contract status based on this weighing and past
                vm.contractStatus.promised = vm.Single.contract_total_amount;
                vm.contractStatus.delivered = thisWeighingAmount + vm.contractStatus.delivered;
                vm.contractStatus.remaining = vm.Single.contract_remaining_amount - thisWeighingAmount;

                //NEW UPDATED 20 May 2024
                vm.Single.contract_delivered_amount = thisWeighingAmount + vm.contractStatus.delivered;
                vm.Single.contract_remaining_amount = vm.Single.contract_remaining_amount - thisWeighingAmount;
            }
        };
        // Populates the matching contract for the selected BP and Product
        var populateContracts = function () {
            if (!vm.selected_settings.contract_enabled) return;

            if (vm.selected_businessPartner && vm.selected_product)
            {
                vm.Contracts = allContracts.filter(function (contract) {
                    return contract.businesspartner_id === vm.selected_businessPartner.id && contract.product_id === vm.selected_product.id;
                });
                vm.selected_contract = vm.Contracts.find((contract) => contract.value === vm.Single.contract_id);
            }
        };
        vm.setSelectedPallet = function () {
            vm.Single.pallet_id = vm.selected_pallet.pallet_id;
        };

        vm.calculatePalletCharges = function () {
            vm.palletCharges = 0;
            const palletCount = vm.Single.pallet_count ? parseFloat(vm.Single.pallet_count) : 0;
            if (palletCount > 0 && vm.selected_pallet && vm.selected_pallet.amount)
            {
                vm.palletCharges = vm.selected_pallet.amount * palletCount;
                vm.Single.pallet_charges = vm.palletCharges;
            }
            vm.updateNetWeight();
        };
        // #endregion

        vm.Functions = {
            Users: function () {
                const deferred = $q.defer();
                Restangular.all("userprofile")
                    .withHttpConfig({ cache: true })
                    .getList($navigation.get())
                    .then(
                        function (data) {
                            vm.userprofile = [];
                            $rootScope.FingerFeedback = "";
                            data.forEach(function (mapData) {
                                vm.userprofile.push({
                                    fingerprint: mapData.fingerprint,
                                    id: mapData.firstname,
                                    firstname: mapData.firstname,
                                    lastname: mapData.lastname,
                                });
                                $rootScope.FingerFeedback = $rootScope.FingerFeedback + mapData.fingerprint + ";";
                            });
                            //$EMSOservice.Run();
                            const getType = {};

                            deferred.resolve({ data: { message: "userprofile success!" } });
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
                return deferred.promise;
            },
        };

        // #region WebSocket Management Functions
        vm.stopWebSocket = function() {
            if (scaleSocket && scaleSocket.readyState === WebSocket.OPEN) {
                console.log('Stopping WebSocket connection...');
                scaleSocket.close();
                scaleSocket = null;
            }
        };

        vm.restartWebSocket = function() {
            if (vm.WeighBridge && vm.WeighBridge.manual === "No" && !vm.saveSuccessful && !$scope.$$destroyed) {
                console.log('Restarting WebSocket connection...');
                vm.ResetWeighing();
            }
        };

        vm.closeWebSocket = function() {
            if (scaleSocket) {
                console.log('Closing WebSocket connection permanently...');
                scaleSocket.close();
                scaleSocket = null;
            }
        };
        // #endregion

        // #region Weighing and Fingerprints Actions
        vm.Fingerprint = function () {
            $EMSOservice.DoVerification();
        };

        vm.ResetWeighing = function () {
            if (vm.WeighBridge === undefined)
                vm.WeighBridge = $rootScope.WeighBridge;
            if (!hasValidWeighbridge())
            {
                if (vm.expectManualWeighbridgeSelection)
                {
                    vm.submit = true;
                    return;
                }
                notifyMissingWeighbridge("ResetWeighing");
                vm.submit = true;
                return;
            }
            if (vm.FingerPrintVerify === "Yes")
            {
                $rootScope.FingerFeedback = "StartVerification";
                vm.Functions.Users().then(
                    function () {
                        $rootScope.Loaded("Single grade on WeighingUpdateCtrl");
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
            }
            if (vm.WeighBridge.manual === "Yes")
            {
                if (scaleSocket)
                {
                    scaleSocket.close();
                }
                scaleSocket = undefined;
                vm.submit = false;
            }

            if (vm.WeighBridge.manual === "No")
            {
                const scaleContext = getScaleContext();
                $nodeRed.ResetWeighing(vm.WeighBridge.scale, vm.WeighBridge.port_num, scaleContext);
                if (scaleSocket)
                {
                    scaleSocket.close();
                }
                scaleSocket = $nodeRed.GetScaleSocket(scaleContext);
                scaleSocket.onmessage = function (event) {
                    const rawKg = parseFloat(event.data);
                    vm.Single.weighttxt = event.data;

                    if (!Number.isFinite(rawKg)) {
                        return;
                    }

                    if (!vm.weightSamples) vm.weightSamples = [];

                    const requiredStableSamples = parseInt(vm.WeighBridge.stable_samples, 10) || 0;

                    // Check if the sample matches last recorded weight
                    if (vm.weightSamples.length === 0 || vm.weightSamples[vm.weightSamples.length - 1] === rawKg)
                    {
                        vm.weightSamples.push(rawKg);
                        // Keep array length limited to requiredStableSamples
                        if (vm.weightSamples.length > requiredStableSamples)
                        {
                            vm.weightSamples.shift(); // remove oldest sample
                        }
                    } else
                    {
                        vm.weightSamples = [rawKg]; // reset samples on weight change
                    }

                    // Set button based on stable or unstable condition
                    if (vm.weightSamples.length === requiredStableSamples)
                    {
                        const displayWeight = SiteWeightUnits.fromScaleKgToSiteDisplay(
                            rawKg,
                            vm.Site.measure_type,
                            vm.WeighBridge,
                            vm.Site
                        );
                        vm.Single.weight = displayWeight;
                        vm.Single.SecondWeight = displayWeight;
                        vm.updateNetWeight();

                        console.log('Stable weight detected:', displayWeight, '(raw kg:', rawKg + ')');
                        vm.submit = false; // Button ON (stable)
                        
                        // Broadcast transaction update when weight changes
                        vm.broadcastTransactionUpdate();
                    } else
                    {
                        if (parseInt(vm.WeighBridge.stable_samples) > 5)
                        {
                            vm.submit = true; // Button OFF (unstable)
                        }
                    }
                };
                
                // Connect broadcast socket for transaction updates
                if (broadcastSocket)
                {
                    broadcastSocket.close();
                }
                var bases = getScaleBases();
                broadcastSocket = new WebSocket(bases.wsBase + '/ws/syncin');
                
                broadcastSocket.onopen = function() {
                    console.log('Broadcast socket connected to /ws/syncin');
                };
                
                broadcastSocket.onerror = function(error) {
                    console.error('Broadcast socket error:', error);
                };
                
                broadcastSocket.onclose = function() {
                    console.log('Broadcast socket closed');
                };
            }
        };

        vm.Fingerprint = function () {
            $rootScope.FingerFeedback = "StartVerification";
            $Functions.Users().then(
                function (value) {
                    $rootScope.Loaded("Single grade on WeighingUpdateCtrl");
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
        };

        vm.cancel = function () {
            stopAllCameras();
            vm.closeWebSocket(); // Close WebSocket on cancel
            $state.go("app.weighing");
        };
        //#region Save
        vm.save = function () {
            if (vm.isSaving) return;  // Prevent multiple clicks if saving is in progress
            vm.isSaving = true;

            // Stop WebSocket to prevent weight changes during save
            vm.stopWebSocket();

            // Force recalculation before saving
            vm.calculatePalletCharges();
            vm.updateNetWeight();

            // Preserve current selections to prevent race conditions during save/print
            vm.preservedSelections = {
                businessPartner: vm.selected_businessPartner ? angular.copy(vm.selected_businessPartner) : null,
                haulier: vm.selected_haulier ? angular.copy(vm.selected_haulier) : null,
                product: vm.selected_product ? angular.copy(vm.selected_product) : null,
                contract: vm.selected_contract ? angular.copy(vm.selected_contract) : null,
                pallet: vm.selected_pallet ? angular.copy(vm.selected_pallet) : null
            };

            vm.Single.actiontype = "Edit";
            vm.Single.company_id = vm.HeaderSingle.company_id ?? vm.Single.company_id;
            vm.Single.site_id = vm.HeaderSingle.site_id ?? vm.Single.site_id;
            vm.Single.workstation_id = vm.HeaderSingle.workstation_id ?? vm.Single.workstation_id;
            vm.Single.moistureCoefficient = vm.moistureCoefficient;
            vm.Single.moistureWeight = vm.moistureDeduction;
            vm.Single.handlingWeight = vm.handlingCharges;
            //vm.Single.AxelSetups = JSON.stringify($rootScope.AxelSetups.Selected);
            vm.Single.SiloOverride = vm.SiloOverride;
            const today = new Date();
            vm.getDateTime =
                today.getFullYear() +
                "-" +
                (today.getMonth() + 1 < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1) +
                "-" +
                (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) +
                " " +
                (today.getHours() < 10 ? "0" + today.getHours() : today.getHours()) +
                ":" +
                (today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes()) +
                ":" +
                (today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds());
            let Error = "";
            if (typeof vm.Single.settings_id === "undefined" || vm.Single.settings_id == null)
            {
                Error = Error + "Please select weighing type. \n";
            }
            if (typeof vm.Single.weighbridge_id === "undefined" || vm.Single.weighbridge_id == null)
            {
                Error = Error + "Please select weighbridge. \n";
            }
            if (vm.Setting.business_partner == "Yes" && (typeof vm.Single.businesspartner_id === "undefined" || vm.Single.businesspartner_id == null))
            {
                Error = Error + "Please select Business Partner. \n";
            }
            // Additional validation to ensure selection data is fully loaded
            if (vm.Setting.business_partner == "Yes" && vm.Single.businesspartner_id && (!vm.selected_businessPartner || !vm.selected_businessPartner.report))
            {
                Error = Error + "Business Partner data not fully loaded. Please reselect Business Partner.\n";
            }
            if (vm.Setting.use_product_list == "Yes" && (typeof vm.Single.product_id === "undefined" || vm.Single.product_id == null))
            {
                Error = Error + "Please select Product. \n";
            }
            // Additional validation to ensure product data is fully loaded
            if (vm.Setting.use_product_list == "Yes" && vm.Single.product_id && (!vm.selected_product || !vm.selected_product.report))
            {
                Error = Error + "Product data not fully loaded. Please reselect Product.\n";
            }
            if (vm.Setting.haulier == "Yes" && (typeof vm.Single.haulier_id === "undefined" || vm.Single.haulier_id == null))
            {
                Error = Error + "Please select Haulier.\n";
            }
            // Additional validation to ensure haulier data is fully loaded
            if (vm.Setting.haulier == "Yes" && vm.Single.haulier_id && (!vm.selected_haulier || !vm.selected_haulier.report))
            {
                Error = Error + "Haulier data not fully loaded. Please reselect Haulier.\n";
            }
            if (
                (typeof vm.Single.id !== "undefined" && typeof vm.Single.SecondWeight === "undefined") ||
                (typeof vm.Single.id !== "undefined" && vm.Single.SecondWeight == 0) ||
                (vm.Setting.type_of_weighing == "1" && vm.Single.SecondWeight == 0)
            )
            {
                Error = Error + "Please enter the second weight.\n";
            }
            if (
                (vm.Setting.type_of_weighing != "1" && typeof vm.Single.id === "undefined" && typeof vm.Single.FirstWeight === "undefined") ||
                (vm.Setting.type_of_weighing != "1" && typeof vm.Single.id === "undefined" && vm.Single.FirstWeight == 0)
            )
            {
                Error = Error + "Please enter the first weight.\n";
            }
            function isNumericString(value) {
                // This regular expression matches strings that are valid numbers (including decimals)
                return /^-?\d+(\.\d+)?$/.test(value);
            }

            if (
                (typeof vm.Single.id !== "undefined" && !isNumericString(vm.Single.FirstWeight))
            )
            {
                Error = Error + "Text is invalid for FirstWeight, Please enter a number.\n";
            }

            if (
                (typeof vm.Single.id !== "undefined" && !isNumericString(vm.Single.SecondWeight))
            )
            {
                Error = Error + "Text is invalid for SecondWeight, Please enter a number.\n";
            }
            if (vm.Setting.numberplate_1 == "Yes" && (vm.Single.RegNumber == null || vm.Single.RegNumber == ""))
            {
                Error = Error + "Please enter the Numberplate.\n";
            }
            if (
                vm.Setting.numberplate_recognition == "Yes" &&
                vm.Setting.numberplate_1 == "Yes" &&
                vm.Single.actiontype != "Edit" &&
                (vm.Single.NumberplateVerify == "danger" || vm.Single.NumberplateVerify == "warning")
            )
            {
                Error = Error + "Please Verify Numberplate.\n";
            }
            //updated 19 March 2024
            for (let i = 1; i <= 20; i++)
            {
                let input = vm.Setting[`user_defined_input${i}`];
                let customField = vm.Single[`Custom${i}`];

                if (input == 'SC' && (customField == null || customField == ""))
                {
                    Error = Error + `Please enter CustomField ${i}.\n`;
                }

                if (input == "TC" && (customField == null || customField == ""))
                {
                    Error = Error + `Please enter CustomField ${i}.\n`;
                }
            }
            // if (vm.Single.actiontype === "Edit" && vm.Single.contract_id != vm.selected_contract.linked_contract_id)
            // {
            //     const excessContractAmount = vm.Single.contract_remaining_amount - Math.abs(vm.nettWeight);
            //     if (excessContractAmount < 0) Error = Error + "You have exceeded the contract amount by " + Math.abs(excessContractAmount) + " kgs \n Please reduce and retake the weighing.";
            // }
            if (vm.Site.measure_type === 'kg')
            {
                if (vm.Single.FirstWeight > 60000)
                {
                    Error = Error + "Warning weight is above 60 Tons.\n";
                }
                if (vm.Single.SecondWeight > 60000)
                {
                    Error = Error + "Warning weight is above 60 Tons.\n";
                }
            }
            if (vm.Site.measure_type === 't')
            {
                if (vm.Single.FirstWeight > 60)
                {
                    Error = Error + "Warning weight is above 60 Tons.\n";
                }
                if (vm.Single.SecondWeight > 60)
                {
                    Error = Error + "Warning weight is above 60 Tons.\n";
                }
            }
            if (Error != "")
            {
                swal("Oops...", Error, "error");
                $rootScope.Loaded("Single Site on WeighingUpdateCtrl");
                return;
            }
            //$EMSOservice.dispose($rootScope.WeighBridge.port_num);
            // const getType = {};
            // if (getType.toString.call($rootScope.weightwatch) === "[object Function]")
            // {
            //     $rootScope.weightwatch();
            // }
            // if (getType.toString.call(vm.listener) === "[object Function]")
            // {
            //     vm.listener();
            // }
            // if (getType.toString.call(vm.finger) === "[object Function]")
            // {
            //     vm.finger();
            // }

            // if (vm.Setting.use_cameras === 'true') {
            //     vm.Single.Cameras = vm.Cameras.map(cam => ({ ip_address: cam.ip_address, isnpr: cam.isnpr, site_id: cam.site_id, company_id: cam.company_id }));
            //     }
            if (vm.Setting.use_cameras === 'Yes')
            {
                vm.Single.Cameras = vm.Cameras;
            }
            vm.Single.WeightTotal = vm.Single.SecondWeight;
            vm.Single.company_id = vm.HeaderSingle.company_id;
            vm.Single.site_id = vm.HeaderSingle.site_id;
            vm.Single.workstation_id = vm.HeaderSingle.workstation_id;
            vm.Single.NettWeight = vm.nettWeight > 0 ? vm.nettWeight : Math.abs(vm.Single.SecondWeight - vm.Single.FirstWeight);
            vm.Single.TotalWeight = Math.abs(vm.Single.SecondWeight - vm.Single.FirstWeight);
            vm.deriveContractStatus();
            vm.Single.save()
                .then(
                    function (success) {
                        toastr.success("Weighing Information Updated", "Success");
                        vm.saveSuccessful = true; // Mark save as successful
                        if (vm.Setting.print_ticket !== "1" && vm.Setting.print_ticket !== 'N')
                        {
                            vm.SetReportingData(success);
                            function doPrintAndCleanup() {
                                window.print();
                                setTimeout(function () {
                                    stopAllCameras();
                                    vm.isSaving = false;
                                    vm.closeWebSocket(); // Close WebSocket permanently on success
                                    $state.go("app.weighing");
                                }, 100);
                            }
                            if (vm.Setting.use_cameras === 'Yes' && vm.Setting.print_cameras_on_ticket === 'Yes' && vm.Cameras && vm.Cameras.length > 0) {
                                var snapshotPromises = vm.Cameras.map(function (mapData) {
                                    var CamerasService = Restangular.one("getImageFromIpString");
                                    return CamerasService.customPOST({
                                        "imageUrl": mapData.ip_address,
                                        "authType": mapData.auth_type || 'none',
                                        "username": mapData.username,
                                        "password": mapData.password
                                    }).then(
                                        function (response) {
                                            mapData.base64 = response;
                                            if (mapData.pn_recog == "true")
                                            {
                                                vm.pn_recog = "data:image/png;base64," + mapData.base64;
                                            }
                                            mapData.src = "data:image/png;base64," + mapData.base64;
                                            return response;
                                        },
                                        function () { return null; }
                                    );
                                });
                                var done = $q.defer();
                                setTimeout(function () { done.resolve(); }, 3000);
                                $q.all(snapshotPromises).then(function () { done.resolve(); }, function () { done.resolve(); });
                                done.promise.then(function () { setTimeout(doPrintAndCleanup, 100); });
                            } else {
                                setTimeout(doPrintAndCleanup, 100);
                            }
                        } else
                        {
                            stopAllCameras();
                            vm.closeWebSocket(); // Close WebSocket permanently on success
                            $state.go("app.weighing");
                        }
                    },
                    function (error) {
                        //toastr.error(error);
                        console.log(error);
                        vm.isSaving = false;
                        vm.restartWebSocket(); // Restart WebSocket on failure
                    }
                );
            // .finally(function () {
            //     // Reset isSaving flag after the operation completes, regardless of success or failure
            //     vm.isSaving = false;
            // });
        };
        //#region Initialize
        vm.initialize = function () {
            $navigation.clear();
            hydrateHeaderContextFromParams();

            $Functions.Users().then(function (user) {
                $rootScope.AxelDisplay = "hidden";
                vm.FormDisplay = true; // needed for the save and cancel div
                vm.User = user;
                $navigation.Company(vm.HeaderSingle.company_id);
                $navigation.Site(vm.HeaderSingle.site_id);
                $navigation.Workstation(vm.HeaderSingle.workstation_id);

                $Functions.WeighSettings().then(function (data) {
                    vm.Settings = data.Settings;
                    vm.Weighbridges = data.Weighbridges;
                    $scope.Service = Restangular.one(routeName, headerId);
                    $scope.Service.customGET("", vm.HeaderSingle)
                        .then(
                            function (dat) {
                                vm.Single = dat;
                                vm.HeaderSingle.company_id = vm.HeaderSingle.company_id || vm.Single.company_id;
                                vm.HeaderSingle.site_id = vm.HeaderSingle.site_id || vm.Single.site_id;
                                vm.HeaderSingle.workstation_id = vm.HeaderSingle.workstation_id || vm.Single.workstation_id;
                                if ($rootScope.Params)
                                {
                                    $rootScope.Params.company_id = vm.HeaderSingle.company_id || $rootScope.Params.company_id;
                                    $rootScope.Params.site_id = vm.HeaderSingle.site_id || $rootScope.Params.site_id;
                                    $rootScope.Params.workstation_id = vm.HeaderSingle.workstation_id || $rootScope.Params.workstation_id;
                                }
                                $rootScope.Start("weighingLoad");

                                $Functions.weighingLoad(vm.Single.settings_id).then(function (data) {
                                    vm.Setting = data.Setting;
                                    vm.ReportData.Header = data.Setting.custom_header_text;
                                    vm.ReportData.HeaderImg = data.Setting.display_custom_header_img;
                                    vm.ReportData.Footer = data.Setting.custom_footer_text;
                                    vm.ReportData.FooterImg = data.Setting.display_custom_footer_img;
                                    vm.selected_settings = vm.Settings.find((settings) => settings.id == vm.Single.settings_id);
                                    vm.selected_settings.contract_enabled = data.Setting.contract_enabled;
                                    const requireManualSelection = requiresManualWeighbridgeSelection(vm.Single);
                                    if (requireManualSelection)
                                    {
                                        vm.expectManualWeighbridgeSelection = true;
                                        vm.selected_weighbridge = null;
                                        vm.Single.weighbridge_id = null;
                                        vm.WeighBridge = undefined;
                                        $rootScope.WeighBridge = {};
                                        vm.submit = true;
                                    } else
                                    {
                                        vm.expectManualWeighbridgeSelection = false;
                                        vm.selected_weighbridge = vm.Weighbridges.find((weighbridge) => weighbridge.id == vm.Single.weighbridge_id);
                                        vm.WeighBridge = vm.selected_weighbridge || vm.WeighBridge || $rootScope.WeighBridge;
                                    }
                                    if (!requireManualSelection && !hasValidWeighbridge())
                                    {
                                        notifyMissingWeighbridge("initialize");
                                        vm.submit = true;
                                        vm.ReadOnly = true;
                                        return;
                                    }
                                    if (!requireManualSelection)
                                    {
                                        vm.RegExChange = function () {
                                            vm.WeighBridge.weight_reg = "[0-9" + (vm.WeighBridge.weight_special == "Yes" ? "\\.\\-" : "") + "]{" + vm.WeighBridge.weight_num_amt + "}";
                                        };
                                        if (vm.FingerPrintVerify === "Yes")
                                        {
                                            $rootScope.FingerFeedback = "StartVerification";
                                            vm.Functions.Users().then(
                                                function () {
                                                    $rootScope.Loaded("Single grade on WeighingUpdateCtrl");
                                                },
                                                function (response) {
                                                    $rootScope.Error(response);
                                                }
                                            );
                                        }
                                        if (vm.WeighBridge.manual === "Yes")
                                        {
                                            if (scaleSocket !== undefined)
                                                scaleSocket.onmessage(function (event) {
                                                    vm.Single.weight = parseFloat(event.data);
                                                    if (vm.Single.actiontype != "Edit")
                                                    {
                                                        vm.Single.FirstWeight = parseFloat(event.data);
                                                    }
                                                    else
                                                    {
                                                        vm.Single.SecondWeight = parseFloat(event.data);
                                                        vm.updateNetWeight();
                                                    }
                                                });
                                            scaleSocket = undefined;
                                        }

                                        if (vm.WeighBridge.manual === "No")
                                        {
                                            vm.ResetWeighing();
                                            // Watch for changes in the weight data and update the view model
                                            // Initialize an array to track recent weight samples
                                            let weightSamples = [];

                                            // Watch for changes in the weight data and update the view model
                                            $rootScope.$watch('weighbridgeWeight', function (newWeight) {
                                                if (newWeight !== undefined && Number.isFinite(newWeight))
                                                {

                                                    // If the list is empty or the new weight matches the last added weight
                                                    if (weightSamples.length === 0 || weightSamples.length <= vm.WeighBridge.stable_samples)
                                                    {
                                                        // Add the new weight to the list of samples
                                                        weightSamples.push(newWeight);
                                                    } else
                                                    {
                                                        // If the weight changed, reset the list
                                                        weightSamples = [];
                                                    }

                                                    // Check if the weight has been stable for the specified number of samples
                                                    if (weightSamples.length >= vm.WeighBridge.stable_samples)
                                                    {
                                                        var displayWeight = SiteWeightUnits.fromScaleKgToSiteDisplay(
                                                            newWeight,
                                                            vm.Site.measure_type,
                                                            vm.WeighBridge,
                                                            vm.Site
                                                        );
                                                        // Update the weight in Single object
                                                        vm.Single.weight = displayWeight;
                                                        vm.Single.SecondWeight = displayWeight;

                                                        // Call the function to update the net weight
                                                        vm.updateNetWeight();

                                                        console.log('Stable weight detected:', displayWeight);

                                                        // Clear the list after updating to start fresh
                                                        weightSamples = [];
                                                    }

                                                    console.log('Weight Samples:', weightSamples);
                                                }
                                            });

                                            $rootScope.$watch('weighbridgeData', function (newData) {
                                                if (newData !== undefined)
                                                {
                                                    vm.Single.weighttxt = newData;
                                                }
                                            });
                                        }
                                    }
                                    vm.ReadOnly = true;
                                    vm.Single.NumberplateVerify = "warning";
                                    vm.Single.SiloOverride = "No";
                                    // updated 19 March 2024
                                    for (let i = 1; i <= 20; i++)
                                    {
                                        let input = vm.Setting[`user_defined_input${i}`];
                                        let customField = vm.Single[`Custom${i}`];

                                        if (input == 'SC' && (customField == null || customField == ""))
                                        {
                                            Error = Error + `Please enter CustomField ${i}.\n`;
                                        }

                                        if (input == "TC" && (customField == null || customField == ""))
                                        {
                                            Error = Error + `Please enter CustomField ${i}.\n`;
                                        } else if (input == 'SO' || input == 'SC')
                                        {
                                            vm.Setting[`user_defined_array${i}`] = vm.Setting[`user_defined_val${i}`].split(",").map((x) => ({ key: x, value: x }));
                                            vm[`selected_Custom${i}`] = { key: customField, value: customField };
                                        }
                                    }
                                    // vm.Single.palletCharges =
                                    const First = vm.Single.weighingLines.find((p) => p.Status == "1");
                                    const firstNameFromLine = First !== undefined && First.user_name ? First.user_name : null;
                                    vm.Single.FirstUser = firstNameFromLine || vm.Single.FirstUser || null;
                                    const Verify = vm.Single.weighingLines.find((p) => p.Status == "V");
                                    vm.Single.VerifyUser = Verify !== undefined ? Verify.user_name : null;
                                    const Second = vm.Single.weighingLines.find((p) => p.Status == "2");
                                    const secondNameFromLine = Second !== undefined && Second.user_name ? Second.user_name : null;
                                    vm.Single.user_name = secondNameFromLine || vm.Single.user_name || null;
                                    if (data.haulier !== undefined)
                                    {
                                        vm.Hauliers = data.haulier;
                                        vm.selected_haulier = vm.Hauliers.find((haulier) => haulier.id == vm.Single.haulier_id);
                                    }
                                    if (data.stored_tares !== undefined)
                                    {
                                        vm.Tares = data.stored_tares;
                                        vm.selected_tare = data.stored_tares;
                                        if (vm.selected_settings.tares_enabled === "true" && vm.Single.tare_id)
                                        {
                                            var tareRow = data.stored_tares.find(function (t) { return t.id == vm.Single.tare_id; });
                                            if (tareRow && tareRow.weight != null && tareRow.weight !== "")
                                            {
                                                var tareKgInit = parseFloat(tareRow.weight);
                                                var inSiteInit = SiteWeightUnits.kgToSiteUnits(tareKgInit, vm.Site.measure_type);
                                                vm.Single.FirstWeight = SiteWeightUnits.roundToDecimals(
                                                    inSiteInit,
                                                    SiteWeightUnits.displayDecimalsFromWeighbridgeOrSite(vm.WeighBridge, vm.Site)
                                                );
                                            }
                                        }
                                    }
                                    if (data.business_partner !== undefined)
                                    {
                                        vm.BusinessPartners = data.business_partner;
                                        vm.selected_businessPartner = vm.BusinessPartners.find((businessPartner) => businessPartner.id == vm.Single.businesspartner_id);
                                        vm.loadContracts();
                                    }
                                    if (data.use_product_list !== undefined)
                                    {
                                        vm.Products = data.use_product_list;
                                        vm.selected_product = vm.Products.find((product) => product.id == vm.Single.product_id);
                                        vm.Single.product_grades_enabled = vm.selected_product && vm.selected_product.grades_enabled ? vm.selected_product.grades_enabled : 'No';
                                        // if (vm.selected_product && vm.selected_product.grades) {
                                        //     vm.selected_product.grades = vm.selected_product.grades.split(',').map(function(grade) {
                                        //         return { displayName: grade.trim() };
                                        //     });
                                        //     console.log('PRODUCT GRADES', vm.selected_product.grades);
                                        // } else {
                                        //     vm.selected_product.grades = [];
                                        // }
                                    }
                                    if (data.use_cameras !== undefined && data.Setting.use_cameras === 'Yes' && data.use_cameras && data.use_cameras.length > 0)
                                    {
                                            vm.Cameras = data.use_cameras.filter(function (camera) { return camera.camera_active === 'true'; });
                                            vm.Single.printcamera = vm.Setting.use_cameras == 'Yes' && vm.Setting.print_cameras_on_ticket == 'Yes' ? 'Yes' : 'No';
                                            console.log('Cameras starting', vm.Cameras.length);
                                            vm.Cameras.forEach(function (mapData) {
                                                mapData.isnpr = mapData.pn_recog;
                                                if (mapData.pn_recog == "true")
                                                {
                                                    vm.pn_recog = "data:image/png;base64," + mapData.base64;
                                                }
                                                mapData.CameraTick = setInterval(function () {
                                                    var cancelDefer = $q.defer();
                                                    mapData._cancelDefer = cancelDefer;
                                                    Restangular.one("getImageFromIpString")
                                                        .withHttpConfig({ timeout: cancelDefer.promise })
                                                        .customPOST({
                                                            "imageUrl": mapData.ip_address,
                                                            "authType": mapData.auth_type || 'none',
                                                            "username": mapData.username,
                                                            "password": mapData.password
                                                        }).then(
                                                            function (response) {
                                                                mapData.base64 = response;
                                                                if (mapData.pn_recog == "true")
                                                                {
                                                                    vm.pn_recog = "data:image/png;base64," + mapData.base64;
                                                                }
                                                                mapData.src = "data:image/png;base64," + mapData.base64;
                                                            },
                                                            function (failure) {
                                                                if (failure && failure.status !== -1) {
                                                                    console.log('Camera error:', failure);
                                                                }
                                                            });
                                                }, CAMERA_REFRESH_MS);
                                            });
                                    }
                                    // updated
                                    if (data.pallet_enabled !== undefined)
                                    {
                                        vm.Pallets = data.pallet_enabled;
                                        vm.selected_pallet = vm.Pallets.find((pallet) => pallet.pallet_id == vm.Single.pallet_id);
                                        if (vm.selected_pallet !== undefined)
                                        {
                                            vm.ReportData.palletName = vm.selected_pallet.pallet_name;
                                            vm.ReportData.amount = vm.selected_pallet.amount;
                                            vm.ReportData.palletAmount = vm.selected_pallet.amount;
                                        }
                                        vm.calculatePalletCharges();
                                    }
                                    if (data.contract_enabled !== undefined)
                                    {
                                        vm.allContracts = data.contract_enabled;
                                        console.log('ALLCONTRACTS', vm.allContracts);
                                        vm.selected_contract = vm.allContracts.find((contract) => contract.id == vm.Single.contract_id);
                                        console.log('SELECTED CONTRACTS', vm.selected_contract);
                                        if (vm.selected_contract !== undefined)
                                        {
                                            vm.Single.contract_id = vm.selected_contract.id;
                                            loadContractTransactions();
                                        }
                                        vm.ReportData.Contract = vm.selected_contract;
                                    }
                                    $rootScope.Loaded("weighingLoad");
                                });
                                //vm.ImageUploaderSet();
                            },
                            function (error) {
                                $rootScope.Error(error);
                                console.log(error);
                            }
                        );
                    $rootScope.Loaded("WeighSettings");
                });
            });
        };
        
        // #region Cleanup
        // Cleanup WebSocket and camera intervals when controller is destroyed
        $scope.$on('$destroy', function() {
            stopAllCameras();
            vm.closeWebSocket();
        });
    });
