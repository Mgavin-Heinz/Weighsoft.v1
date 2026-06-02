"use strict";

angular.module("xenon.controllers")
    .controller("WeighingCtrl", function ($scope, $rootScope, Restangular, $q,
        $navigation, $modal, $interval, $filter, $nodeRed, $http, $Functions, $Exceptions, $SharedWeighingFunctions) {
        const vm = this;
        const routeName = "weighingheaders";

        // #region Initialization
        let allContracts = [];
        let allPallets = [];
        let allTares = [];
        let valueSocket = undefined;
        let scaleSocket = undefined;

        $rootScope.WeighBridge = {};
        $scope.showweighings = function (weighings) {
            return weighings.status == "OPEN" || weighings.status == "VERIFY";
        };
        vm.Companies = [];
        vm.Sites = [];
        vm.Workstations = [];
        vm.User;
        vm.HeaderSingle = {
            company_id: null,
            site_id: null,
            workstation_id: null,
        };
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
            vm.Site = {};
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
        vm.FormDisplay = false;
        vm.Single = {};
        setDefaultData();
        // #endregion
        // #region Module Functions
        let selectedWeighingId = null;

        vm.baseData = Restangular.all(routeName).withHttpConfig({ cache: true });
        $rootScope.WeighFeedback = "";
        $rootScope.FingerFeedback = "";
        vm.NumberplateChange = function () {
            const inlist = vm.formData.findIndex((list) => list.RegNumber == vm.Single.RegNumber && list.status !== "CLOSED" && list.settings_id == vm.Single.settings_id);

            if (vm.Single.RegNumber == "Loading.." || vm.Single.RegNumber == "Numberplate not recognized" || inlist > -1) vm.NumberplateClass = "invalid";
            else vm.NumberplateClass = "";
        };
        vm.GetCamera = function () {

            vm.Cameras.forEach(function (mapData) {
                mapData.src = mapData.ip_address + "?time=" + Math.floor(Math.random() * 1000000000);
            });
        };
        vm.NPR = function () {
            const datestring = $filter("date")(new Date(), "yyyyMMdd.hhmmss");
            vm.Single.RegNumber = "Loading..";
            vm.NumberplateChange();

            const handleResponse = (response) => {
                vm.Single.RegNumber = response.data;
                vm.NumberplateChange();
            };

            $http({
                method: "GET",
                url: `/weighsoft/backend/npr.php?filename=${datestring}&ip=${vm.pn_recog}`,
            }).then(handleResponse, handleResponse);

            vm.GetCamera();
        };

        vm.calculateMoistureDeduction = function (totalWeight, type) {
            vm.moistureDeduction = 0;

            if (vm.Single.SecondWeight > 0 && vm.Single.moisture_deduction > 0)
            {
                const moisturePercentage = parseFloat(vm.Single.moisture_deduction) - vm.Setting.moisture_deduction_level;
                if (moisturePercentage > 0)
                {
                    console.log(`moisture_deduction:${vm.Single.moisture_deduction}\n moisture_deduction_level:${vm.Setting.moisture_deduction_level}`);
                    vm.moistureCoefficient = 1 - (100 - vm.Single.moisture_deduction) / (100 - vm.Setting.moisture_deduction_level);
                    console.log('moistureCoefficient:' + vm.moistureCoefficient);
                    let totalWeightUpdate = type === 'handling' ? totalWeight - vm.handlingCharges : totalWeight;
                    vm.moistureDeduction = totalWeightUpdate * vm.moistureCoefficient;
                    vm.Single.moistureDeduction = vm.moistureDeduction;
                    console.log(vm.moistureDeduction);
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
                    const totalWeightUpdate = type === 'moisture' ? totalWeight - vm.moistureDeduction : totalWeight;
                    vm.handlingCharges = totalWeightUpdate * (handlingPercentage / 100);
                    vm.Single.handlingCharges = vm.handlingCharges;
                }
            }
        };
        vm.updateNetWeight = function () {
            if (vm.Site.deduct_flow === undefined)
            {
                GetSites();
            }
            vm.nettWeight = Math.abs(vm.Single.FirstWeight - vm.Single.SecondWeight);
            const flow = vm.Site.deduct_flow || "default";
            const settings = {
                "pallet_enabled": vm.calculatePalletCharges,
                "enable_handling": () => vm.calculateHandlingCharges(vm.nettWeight, flow),
                "enable_moisture": () => vm.calculateMoistureDeduction(vm.nettWeight, flow)
            };

            Object.keys(settings).forEach(setting => {
                if (vm.Setting[setting] === "true")
                {
                    settings[setting]();
                }
            });
            vm.nettWeight = vm.nettWeight - vm.Single.moistureDeduction ?? 0;
            vm.nettWeight = vm.nettWeight - vm.Single.handlingCharges ?? 0;
            vm.nettWeight = vm.nettWeight - vm.Single.pallet_charges ?? 0;

        };

        // #endregion
        // #region Form Functions
        const GetCompanies = function () {
            $Functions.Company(vm.User.company_id).then(function (companyList) {
                vm.Companies = companyList;
                if ($rootScope.Params.company_id !== null)
                {
                    vm.HeaderSingle.company_id = $rootScope.Params.company_id;
                    $navigation.Company(vm.HeaderSingle.company_id);
                    vm.ReportData.Company = $rootScope.MasterData.find((company) => company.id === $rootScope.Params.company_id);
                    GetSites();
                }
                else
                {
                    $rootScope.Loaded("Single Site on WeighingCtrl");
                }
            });
        }
        vm.formatNumber = function (i) {
            const decimals = Number.isInteger(vm?.Site?.decimals) && vm.Site.decimals >= 0
                ? vm.Site.decimals
                : 0;
        
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
        const GetSites = function () {
            $Functions.Site().then(
                function (siteList) {
                    vm.HeaderSingle.site_id = $rootScope.Params.site_id;
                    vm.Sites = siteList;
                    const site = vm.Sites.find((site) => site.value == vm.HeaderSingle.site_id);

                    if (site)
                    {
                        vm.FingerPrintVerify = site.finger_active;
                        vm.Site.decimals = site.decimals;
                        vm.Site.measure_type = site.measure_type;
                        vm.Site.deduct_flow = site.deduct_flow;
                    }

                    $navigation.Site(vm.HeaderSingle.site_id);

                    if (vm.Sites.length === 1)
                    {
                        vm.HeaderSingle.site_id = vm.Sites[0].value;
                        $rootScope.Params.site_id = vm.Sites[0].value;
                    }

                    if (vm.Sites.length === 1 || $rootScope.Params.site_id !== null)
                    {
                        GetWorkstations();
                    }

                    $rootScope.Loaded("Single Site on WeighingCtrl");
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
        };

        /**
         * Retrieves the list of workstations and sets the appropriate header and navigation values.
         * If there is only one workstation or a workstation ID is provided in the rootScope parameters, it sets the header and navigation to that workstation and loads the data.
         * Otherwise, it sets the header and navigation to the default workstation and loads the data.
         * @function
         * @memberof Functions
         * @name GetWorkstations
         */
        const GetWorkstations = function () {
            $Functions.Workstation().then(
                function (workstationList) {
                    vm.Workstations = workstationList;
                    vm.HeaderSingle.workstation_id = $rootScope.Params.workstation_id;
                    $navigation.Workstation(vm.HeaderSingle.workstation_id);
                    if (vm.Workstations.length == 1 || $rootScope.Params.workstation_id !== null)
                    {
                        if (vm.Workstations.length == 1)
                        {
                            vm.HeaderSingle.workstation_id = vm.Workstations[0].value;
                            $rootScope.Params.workstation_id = vm.Workstations[0].value;
                        }
                        LoadData();
                    }
                    $rootScope.Loaded("Single Workstation on WeighingCtrl");
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
        }
        vm.Functions = {
            // Weighbridge: function () {
            //     const deferred = $q.defer();
            //     vm.Single.weighbridge_id = vm.selected_weighbridge.value;
            //     Restangular.one("weighbridge", vm.selected_weighbridge.value)
            //         .withHttpConfig({ cache: true })
            //         .get()
            //         .then(
            //             function (data) {
            //                 $rootScope.WeighFeedback = $rootScope.WeighFeedback + "weighbridge loaded \n";
            //                 $rootScope.WeighBridge = data;
            //                 $rootScope.weight_sep = $rootScope.WeighBridge.weight_sep + "***";
            //                 //$EMSOservice.dispose();
            //                 if ($rootScope.WeighBridge.manual == "No")
            //                 {
            //                     $rootScope.WeighFeedback = $rootScope.WeighFeedback + "$rootScope.WeighBridge.manual == 'No' \n";
            //                     $EMSOservice.WighingRun(
            //                         vm.Single.weight,
            //                         $rootScope.WeighBridge.ip_address,
            //                         $rootScope.WeighBridge.port_num,
            //                         $rootScope.WeighBridge.baud_rate,
            //                         $rootScope.WeighBridge.parity,
            //                         $rootScope.WeighBridge.stop_bits,
            //                         $rootScope.WeighBridge.data_bits
            //                     );
            //                 }
            //                 deferred.resolve({
            //                     data: { message: "Weighbridges Success!" },
            //                 });
            //             },
            //             function (response) {
            //                 deferred.reject({ data: { message: response } });
            //             }
            //         );
            //     return deferred.promise;
            // },
            // Haulier: function () {
            //     const deferred = $q.defer();
            //     Restangular.all("haulier")
            //         .withHttpConfig({ cache: true })
            //         .getList($navigation.get())
            //         .then(
            //             function (data) {
            //                 vm.Hauliers = [];
            //                 data.forEach(function (mapData) {
            //                     vm.Hauliers.push({
            //                         value: mapData.id,
            //                         name: mapData.name + "(" + mapData.code + ")",
            //                         report: mapData.code + "<br>" + mapData.name + "<br>",
            //                     });
            //                 });
            //                 deferred.resolve({ data: { message: "Hauliers Success!" } });
            //             },
            //             function (response) {
            //                 deferred.reject({ data: { message: response } });
            //             }
            //         );
            //     return deferred.promise;
            // },
            // BusinessPartner: function () {
            //     const deferred = $q.defer();
            //     Restangular.all("businesspartner")
            //         .withHttpConfig({ cache: true })
            //         .getList($navigation.get())
            //         .then(
            //             function (data) {
            //                 vm.BusinessPartners = [];
            //                 data.forEach(function (mapData) {
            //                     vm.BusinessPartners.push({
            //                         value: mapData.id,
            //                         name: mapData.name + "(" + mapData.code + ")",
            //                         report: mapData.code + "<br>" + mapData.name + "<br>",
            //                     });
            //                 });
            //                 deferred.resolve({
            //                     data: { message: "Business Partner Success!" },
            //                 });
            //             },
            //             function (response) {
            //                 deferred.reject({ data: { message: response } });
            //             }
            //         );
            //     return deferred.promise;
            // },
            // Product: function () {
            //     const deferred = $q.defer();
            //     Restangular.all("product")
            //         .withHttpConfig({ cache: true })
            //         .getList($navigation.get())
            //         .then(
            //             function (data) {
            //                 vm.Products = [];
            //                 data.forEach(function (mapData) {
            //                     vm.Products.push({
            //                         value: mapData.id,
            //                         name: mapData.name + "(" + mapData.code + ")",
            //                         report: mapData.code + "<br>" + mapData.name + "<br>",
            //                     });
            //                 });
            //                 deferred.resolve({ data: { message: "Product Success!" } });
            //             },
            //             function (response) {
            //                 deferred.reject({ data: { message: response } });
            //             }
            //         );
            //     return deferred.promise;
            // },
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

                            // if (getType.toString.call(vm.finger) === "[object Function]")
                            // {
                            //     vm.finger();
                            // }
                            //Delete Form
                            // vm.finger = $scope.$watch(
                            //     function () {
                            //         return $rootScope.FingerFeedback;
                            //     },
                            //     function (current, original) {
                            //         if (current !== original && $rootScope.FingerFeedback.length > 800 && $rootScope.FingerFeedback.indexOf(";") === -1)
                            //         {
                            //             vm.userprofile.forEach(function (user) {
                            //                 if (user.fingerprint.indexOf(";") == -1)
                            //                 {
                            //                     if (user.fingerprint.substring(1, user.fingerprint.length) == $rootScope.FingerFeedback.substring(1, user.fingerprint.length))
                            //                     {
                            //                         $rootScope.WeighFeedback = $rootScope.WeighFeedback + user.firstname + " " + user.lastname + "\n";
                            //                         vm.ScannedUser = user.id;
                            //                         vm.Single.user_id = user.id;
                            //                         vm.Single.user_name = user.firstname + " " + user.lastname;
                            //                         swal("Congrats", "Finger Print Match." + user.firstname + " " + user.lastname, "info");
                            //                     }
                            //                 } else
                            //                 {
                            //                     const fingerprints = user.fingerprint.split(";");
                            //                     fingerprints.forEach(function (current_value) {
                            //                         if (current_value.substring(1, user.fingerprint.length) == $rootScope.FingerFeedback.substring(1, user.fingerprint.length))
                            //                         {
                            //                             vm.ScannedUser = user.id;
                            //                             vm.Single.user_id = user.id;
                            //                             vm.Single.user_name = user.firstname + " " + user.lastname;
                            //                             swal("Congrats", "Finger Print Match." + user.firstname + " " + user.lastname, "info");
                            //                         }
                            //                     });
                            //                 }
                            //             });
                            //         }
                            //     }
                            // );
                            deferred.resolve({ data: { message: "userprofile success!" } });
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
                return deferred.promise;
            },
            Camera: function () {
                const deferred = $q.defer();
                let CamerasService = Restangular.one("getImageFromIpString");
                vm.Single.printcamera = vm.Setting.use_cameras == 'Yes' && vm.Setting.print_cameras_on_ticket == 'Yes' ? 'Yes' : 'No';
                Restangular.all("camera").withHttpConfig({ cache: true })
                    .getList($navigation.get())
                    .then(
                        function (data) {
                            vm.Cameras = data;
                            vm.Cameras.forEach(function (mapData) {
                                mapData.isnpr = mapData.pn_recog;
                                if (mapData.pn_recog == "true")
                                {
                                    vm.pn_recog = "data:image/png;base64" + mapData.base64;
                                }
                                mapData.CameraTick = setInterval(function () {
                                    CamerasService.customPOST({
                                        "imageUrl": mapData.ip_address
                                    }).then(
                                        function (response) {
                                            mapData.base64 = response;
                                            if (mapData.pn_recog == "true")
                                            {
                                                vm.pn_recog = "data:image/png;base64," + mapData.base64;
                                            }
                                            else
                                            {
                                                mapData.src = "data:image/png;base64," + mapData.base64;
                                            }
                                        },
                                        function (failure) {
                                            console.log(failure);
                                        });
                                }, 10000);
                            });
                            deferred.resolve({ data: { message: "Cameras Success!" } });
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
                return deferred.promise;
            }
        };
        // #endregion
        // #region Weighing and Fingerprints Actions
        // vm.Fingerprint = function () {
        //     $EMSOservice.DoVerification();
        // };
        // vm.ResetWeighing = function () {
        //     $rootScope.WeighFeedback = "";
        //     $EMSOservice.WighingStop($rootScope.WeighBridge.port_num);
        //     $EMSOservice.dispose($rootScope.WeighBridge.port_num);
        //     $rootScope.WeighFeedback = $rootScope.WeighFeedback + "ResetWeighing \n";
        //     $EMSOservice.WighingRun(
        //         vm.Single.weight,
        //         $rootScope.WeighBridge.ip_address,
        //         $rootScope.WeighBridge.port_num,
        //         $rootScope.WeighBridge.baud_rate,
        //         $rootScope.WeighBridge.parity,
        //         $rootScope.WeighBridge.stop_bits,
        //         $rootScope.WeighBridge.data_bits
        //     );
        // };

        function resetFormState(vm) {
            vm.formData = [];
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
            vm.HeaderSingle.status = "CLOSED";
        }
        // #endregion
        // #region Startup Actions
        function LoadData(cancel) {
            $rootScope.Start("vm.LoadData in WeighingCtrl");
            resetFormState(vm);
            if (cancel)
            {
                $rootScope.Loaded("vm.LoadData in WeighingCtrl");
            }
            else
                vm.baseData.getList(vm.HeaderSingle).then(
                    function (data) {
                        //vm.Single = JSON.parse(JSON.stringify(EmptyObject));
                        data.forEach((d) => {
                            d.index = data.indexOf(d);
                        });
                        vm.formData = data;
                        $rootScope.Loaded("vm.LoadData in WeighingCtrl");
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
            vm.FormDisplay = false;
        }
        vm.SetSettings = function () {
            vm.Single.settings_id = vm.selected_settings.id;
            const site = vm.Sites.find((site) => site.value == vm.HeaderSingle.site_id);
            if (site && site.override_silo != null)
            {
                vm.Single.SiloOverride = site.override_silo;
            }
        }
        //TODO : Check single Comapny, site
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
                            GetSites();
                        } else
                        {
                            $rootScope.Loaded("Single Site on WeighingCtrl");
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
                            $rootScope.Loaded("Single Site on WeighingCtrl");
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
                            $rootScope.Loaded("Single Workstation on WeighingCtrl");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );

                    break;
                case "settings":
                    $rootScope.Start("weighingLoad");
                    vm.SetSettings();
                    $Functions.weighingLoad(vm.selected_settings.id).then(function (data) {
                        vm.Setting = data.Setting;
                        vm.ReportData.Settings = data.Setting.name;
                        vm.ReportData.Header = data.Setting.custom_header_text;
                        vm.ReportData.HeaderImg = data.Setting.display_custom_header_img;
                        vm.ReportData.Footer = data.Setting.custom_footer_text;
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
                            vm.allCameras = data.use_cameras;
                        }
                        if (data.pallet_enabled !== undefined)
                        {
                            vm.allPallets = data.pallet_enabled;
                        }
                        if (data.contract_enabled !== undefined)
                        {
                            vm.allContracts = data.contract_enabled;
                        }
                        $rootScope.Loaded("weighingLoad");
                    });

                    // LoadData();
                    break;
                case "weighbridge":
                    $navigation.Weighbridge(vm.selected_weighbridge.id);
                    vm.Single.weighbridge_id = vm.selected_weighbridge.id;
                    vm.WeighBridge = vm.selected_weighbridge;
                    // if (vm.FingerPrintVerify === "Yes")
                    // {
                    //     $rootScope.FingerFeedback = "StartVerification";
                    //     vm.Functions.Users().then(
                    //         function () {
                    //             $rootScope.Loaded("Single grade on WeighingCtrl");
                    //         },
                    //         function (response) {
                    //             $rootScope.Error(response);
                    //         }
                    //     );
                    // }
                    if (vm.WeighBridge.manual === "Yes")
                    {
                        if (valueSocket !== undefined)
                            valueSocket.onmessage(function (event) {
                                //console.log(event.data);
                            });
                        valueSocket = undefined;
                    }

                    if (vm.WeighBridge.manual === "No" && valueSocket === undefined)
                    {
                        valueSocket = $nodeRed.GetData("value");

                        valueSocket.onmessage(function (event) {
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
                    }
                    if (vm.WeighBridge.manual === "Yes")
                    {
                        if (scaleSocket !== undefined)
                            scaleSocket.onmessage(function (event) {
                                //console.log(event.data);
                            });
                        scaleSocket = undefined;
                    }

                    if (vm.WeighBridge.manual === "No" && scaleSocket === undefined)
                    {
                        scaleSocket = $nodeRed.GetData("scale");

                        scaleSocket.onmessage(function (event) {
                            vm.Single.weighttxt = event.data;
                        });
                    }

                    break;
                case "haulier":
                    vm.Single.haulier_id = vm.selected_haulier.id;
                    if (vm.Hauliers && vm.Hauliers.length > 0)
                    {
                        let haulier = vm.Hauliers.find(data => vm.Single.haulier_id === data.value);
                        if (haulier)
                        {
                            vm.ReportData.Hauliers = haulier.report;
                            //vm.ReportData.HauliersName = haulier.name + "(" + haulier.code + ")";
                        }
                    }
                    break;
                case "businesspartner":
                    vm.Single.businesspartner_id = vm.selected_businessPartner.id;
                    if (vm.BusinessPartners && vm.BusinessPartners.length > 0)
                    {
                        let businessPartner = vm.BusinessPartners.find(data => vm.Single.businesspartner_id === data.value);
                        if (businessPartner)
                        {
                            vm.ReportData.BusinessPartners = businessPartner.report;
                        }
                    }
                    //TOTO vm.loadContracts();
                    break;
                case "contract":
                    vm.Single.contract_id = vm.selected_contract.id;
                    if (vm.Contracts && vm.Contracts.length > 0)
                    {
                        let contract = vm.Contracts.find(data => vm.Single.contract_id === data.value);
                        if (contract)
                        {
                            vm.ReportData.Contract = contract;
                        }
                    }
                    break;
                case "pallet":
                    vm.Single.pallet_id = vm.selected_pallet.id;
                    if (vm.Pallets && vm.Pallets.length > 0)
                    {
                        let pallet = vm.Pallets.find(data => vm.Single.pallet_id === data.value);
                        if (pallet)
                        {
                            vm.ReportData.Pallet = pallet;
                            vm.ReportData.palletName = pallet.pallet_name;
                            vm.ReportData.amount = pallet.amount;
                        }
                    }
                    break;
                case "tare":
                    vm.Single.tare_id = vm.selected_tare.id;
                    if (vm.Tares && vm.Tares.length > 0)
                    {
                        let tare = vm.Tares.find(data => vm.Single.tare_id == buzz.data);
                        if (tare)
                        {
                            vm.ReportData.Tare = tare;
                        }
                    }
                    break;
                case "product":
                    vm.Single.product_id = vm.selected_product.id;
                    if (vm.Products && vm.Products.length > 0)
                    {
                        let product = vm.Products.find(data => vm.Single.product_id == data.value);
                        if (product)
                        {
                            vm.ReportData.Products = product.report;
                        }
                        //TOTO vm.loadContracts();vm.loadContracts();
                    }
                    break;
            }
        };
        vm.getDateTime = null;
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
            const netWeight = Math.abs(parseFloat(vm.Single.FirstWeight) - parseFloat(vm.Single.SecondWeight));
            const productLine = {
                code: vm.selected_product.code,
                desc: vm.selected_product.name,
                unitPrice: unitPrice,
                qty: { value: netWeight, symbol: vm.Setting.MeasureTypes },
                total: unitPrice * netWeight,
                type: "P",
            };
            productLines.push(productLine);

            // Handling Charges
            const onePercentOfTotal = unitPrice * netWeight * 0.01;
            const handlingPercentage = vm.Single.handling_charges;
            const handlingCharge = onePercentOfTotal * handlingPercentage;
            const handlingChargeItem = {
                code: null,
                desc: "Handling Charges",
                unitPrice: onePercentOfTotal,
                qty: { value: handlingPercentage, symbol: "%" },
                total: handlingCharge,
                type: "HC",
            };
            if (vm.Setting.enable_handling === "true")
            {
                productLines.push(handlingChargeItem);
            }
            // Moisture
            const moisture = vm.Single.moisture_deduction ? parseFloat(vm.Single.moisture_deduction) - vm.Setting.moisture_deduction_level : 0;
            let moistureCharge;
            if (moisture > 0)
            {
                moistureCharge = unitPrice * netWeight * (moisture / 100);
            }
            if (moistureCharge)
                productLines.push({
                    code: null,
                    desc: "Moisture " + parseFloat(vm.Single.moisture_deduction).toFixed(2) + " %",
                    unitPrice: onePercentOfTotal,
                    qty: { value: moisture, symbol: "%" },
                    total: moistureCharge,
                    type: "MC",
                });
            const palletCharge = vm.Single.pallet_charges ? parseFloat(vm.Single.pallet_charges) : 0;
            if (palletCharge > 0)
            {
                Restangular.one("pallets", vm.Single.pallet_id).withHttpConfig({ cache: true })
                    .get()
                    .then((res) => {
                        productLines.push({
                            code: null,
                            desc: "Pallet Handling Charges",
                            unitPrice: res.amount,
                            qty: { value: vm.Single.pallet_count },
                            total: palletCharge,
                            type: "PC",
                        });
                    });
            }

            vm.invoice.productLines = productLines;
            vm.invoice.subTotal = productLine.total - handlingCharge - (moistureCharge ? moistureCharge : 0) - (palletCharge ? palletCharge : 0);
            vm.invoice.vat = vm.selected_product.vat ? roundToTwo((vm.invoice.subTotal * parseFloat(vm.selected_product.vat)) / 100) : 0;
            vm.invoice.total = vm.invoice.subTotal + vm.invoice.vat;
            vm.invoice.balanceDue = vm.invoice.amountDue = vm.invoice.total;
        };

        function roundToTwo(num) {
            return +(Math.round(num + "e+2") + "e-2");
        }

        vm.SetReportingData = function (data) {
            vm.ReportData.Settings = data.Setting.name;
            //                vm.ReportData.Header = data.Setting.custom_header_text;
            //                vm.ReportData.HeaderImg = data.Setting.display_custom_header_img;
            //                vm.ReportData.Footer = data.Setting.custom_footer_text;
            //                vm.ReportData.FooterImg = data.Setting.display_custom_footer_img;
            vm.Single.transaction = data.transaction;
            vm.Single.RegNumber = data.RegNumber;
            vm.Single.RegNumber2 = data.RegNumber2;
            vm.Single.RegNumber3 = data.RegNumber3;
            vm.Single.FirstWeight = data.FirstWeight.WeightTotal;
            vm.Single.SecondWeight = data.SecondWeight != undefined && data.SecondWeight.WeightTotal != null ? data.SecondWeight.WeightTotal : 0;
            vm.Single.FirstDate = data.FirstWeight.created_at;
            vm.Single.SecondDate = data.SecondWeight != null ? data.SecondWeight.created_at : null;
            vm.ReportData.BusinessPartners = vm.selected_businessPartner != undefined ? vm.selected_businessPartner.report : null;
            vm.invoice.businessPartner = vm.selected_businessPartner;
            vm.Site.formatNumber = vm.formatNumber;
            if (vm.selected_contract)
            {
                vm.ReportData.Contract = vm.selected_contract;
                const thisWeighingAmount = Math.abs(parseFloat(vm.Single.FirstWeight) - parseFloat(vm.Single.SecondWeight));
                // Calculate the contract status based on this weighing and past
                angular.extend(vm.ReportData.Contract, {
                    promised: vm.Single.contract_total_amount,
                    delivered: vm.Single.contract_total_amount - vm.Single.contract_remaining_amount + thisWeighingAmount,
                    remaining: vm.Single.contract_remaining_amount - thisWeighingAmount,
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
            vm.ReportData.Hauliers = vm.selected_haulier != undefined ? vm.selected_haulier.report : null;
            vm.ReportData.Products = vm.selected_product != undefined ? vm.selected_product.report : null;
            vm.Single.handlingAlias = vm.handlingAlias;
            if (data.FirstUser) {
                vm.Single.FirstUser = data.FirstUser;
            }
            if (data.user_name) {
                vm.Single.user_name = data.user_name;
            }
        };
        // #endregion
        // #region Contract Transactions
        const loadContractTransactions = function () {
            $rootScope.Start();
            Restangular.all("contracttransaction").withHttpConfig({ cache: true })
                .get("", { contract_id: vm.selected_contract.value })
                .then(
                    function (contractTrans) {
                        let delivered = 0;
                        angular.forEach(contractTrans, function (trans) {
                            delivered += trans.amount;
                        });
                        (vm.contractStatus.promised = vm.selected_contract.amount), (vm.contractStatus.delivered = delivered);
                        vm.contractStatus.remaining = parseFloat(vm.selected_contract.amount) - delivered;

                        $rootScope.Loaded();
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
        };

        vm.loadContracts = function (item) {
            //TODO: Fix contracts
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
                (vm.contractStatus.promised = vm.Single.contract_total_amount),
                    (vm.contractStatus.delivered = vm.Single.contract_total_amount - vm.Single.contract_remaining_amount + thisWeighingAmount),
                    (vm.contractStatus.remaining = vm.Single.contract_remaining_amount - thisWeighingAmount);
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
        // #endregion
        // #region Pallet and Tare

        vm.setSelectedPallet = function () {
            vm.Single.pallet_id = vm.selected_pallet.pallet_id;
        };
        vm.setSelectedTare = function () {
            vm.Single.tare_id = vm.selected_tare.id;
            vm.ReportData.tareSelected = true;
            vm.Single.FirstWeight = parseFloat(vm.selected_tare.weight).toFixed(2);
        };

        vm.calculatePalletCharges = function () {
            vm.palletCharges = 0;
            const palletCount = vm.Single.pallet_count ? parseFloat(vm.Single.pallet_count) : 0;
            if (palletCount > 0)
            {
                vm.palletCharges = vm.selected_pallet.amount * palletCount;
                vm.Single.pallet_charges = vm.palletCharges;
            }
        };
        // #endregion
        // #region Save and Cancel
        vm.save = function () {
            $rootScope.Start("vm.LoadData in WeighingCtrl");
            vm.Single.moistureCoefficient = vm.moistureCoefficient;
            vm.Single.moistureWeight = vm.moistureDeduction;
            vm.Single.handlingWeight = vm.handlingCharges;
            vm.Single.AxelSetups = JSON.stringify($rootScope.AxelSetups.Selected);
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
            if (vm.Setting.use_product_list == "Yes" && (typeof vm.Single.product_id === "undefined" || vm.Single.product_id == null))
            {
                Error = Error + "Please select Product. \n";
            }
            if (vm.Setting.haulier == "Yes" && (typeof vm.Single.haulier_id === "undefined" || vm.Single.haulier_id == null))
            {
                Error = Error + "Please select Haulier.\n";
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
            if (vm.Single.actiontype === "Edit" && vm.Single.contract_id && vm.selected_contract)
            {
                const excessContractAmount = vm.Single.contract_remaining_amount - Math.abs(vm.nettWeight);
                if (excessContractAmount < 0) Error = Error + "You have exceeded the contract amount by " + Math.abs(excessContractAmount) + " kgs \n Please reduce and retake the weighing.";
            }
            if (Error != "")
            {
                swal("Oops...", Error, "error");
                $rootScope.Loaded("Single Site on WeighingCtrl");
                return;
            }

            if (vm.Cameras.length > 0)
            {

                vm.Cameras.forEach(function (mapData) {
                    angular.isDefined(mapData.CameraTick);
                    {
                        $interval.cancel(mapData.CameraTick);
                    }
                });
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
            vm.Single.Cameras = vm.Cameras;
            if (!vm.Single.$valid)
            {
                let addData = vm.Single;
                if (vm.selected_settings.tares_enabled === "true")
                {
                    vm.Single.WeightTotal = vm.Single.FirstWeight;
                    vm.Single.company_id = vm.HeaderSingle.company_id;
                    vm.Single.site_id = vm.HeaderSingle.site_id;
                    vm.Single.workstation_id = vm.HeaderSingle.workstation_id;
                    vm.Single.NettWeight = vm.nettWeight > 0 ? vm.nettWeight : Math.abs(vm.Single.FirstWeight - vm.Single.SecondWeight);
                    vm.Single.TotalWeight = Math.abs(vm.Single.FirstWeight - vm.Single.SecondWeight);
                    Restangular.all("weighingheaders")
                        .post(vm.Single)
                        .then((data) => {
                            if (vm.Setting.print_ticket !== "N")
                            {
                                vm.SetReportingData(data);
                                setTimeout(function () {
                                    window.print();
                                    setTimeout(function () {
                                        vm = $SharedWeighingFunctions.GetDefaultData(vm);
                                        LoadData();
                                        vm.FormDisplay = false;
                                    }, 100);
                                }, 100);
                            } else
                            {
                                vm = $SharedWeighingFunctions.GetDefaultData(vm);
                                LoadData();
                                vm.FormDisplay = false;
                            }
                        });
                } else if (typeof vm.Single.id === "undefined" && vm.selected_settings.tares_enabled !== "true")
                {
                    vm.Single.WeightTotal = vm.Single.FirstWeight;
                    vm.Single.company_id = vm.HeaderSingle.company_id;
                    vm.Single.site_id = vm.HeaderSingle.site_id;
                    vm.Single.workstation_id = vm.HeaderSingle.workstation_id;
                    Restangular.all("weighingheaders")
                        .post(vm.Single)
                        .then(
                            function (data) {
                                if (vm.Setting.print_ticket != "1" && vm.Setting.print_ticket != "B" && vm.selected_settings.tares_enabled !== "true")
                                {
                                    vm = $SharedWeighingFunctions.GetDefaultData(vm);
                                    LoadData();
                                    vm.FormDisplay = false;
                                } else
                                {
                                    vm.SetReportingData(data);
                                    setTimeout(function () {
                                        window.print();
                                        setTimeout(function () {
                                            vm = $SharedWeighingFunctions.GetDefaultData(vm);
                                            LoadData();
                                            vm.FormDisplay = false;
                                        }, 100);
                                    }, 100);
                                }
                            },
                            function (response) {
                                $rootScope.Error(response);
                            }
                        );
                } else
                {
                    vm.Single.NettWeight = vm.nettWeight > 0 ? vm.nettWeight : Math.abs(vm.Single.WeightTotal - vm.Single.SecondWeight);
                    vm.Single.WeightTotal = vm.Single.SecondWeight;
                    vm.Single.TotalWeight = Math.abs(vm.Single.FirstWeight - vm.Single.SecondWeight);
                    vm.Single.company_id = vm.HeaderSingle.company_id;
                    vm.Single.site_id = vm.HeaderSingle.site_id;
                    vm.Single.workstation_id = vm.HeaderSingle.workstation_id;
                    Restangular.one("weighingheaders", vm.Single.id)
                        .customPUT(vm.Single, "")
                        .then(function (data) {
                            if (vm.Setting.print_ticket != "2" && vm.Setting.print_ticket != "B")
                            {
                                LoadData();
                                vm.FormDisplay = false;
                            } else
                            {
                                vm.SetReportingData(data);
                                setTimeout(function () {
                                    window.print();
                                    setTimeout(function () {
                                        vm = $SharedWeighingFunctions.GetDefaultData(vm);
                                        LoadData();
                                        vm.FormDisplay = false;
                                    }, 100);
                                }, 100);
                            }
                        },
                            function (response) {
                                $rootScope.Error(response);
                            }
                        );
                }
            }
        };

        vm.cancel = function () {
            // $EMSOservice.dispose($rootScope.WeighBridge.port_num);
            // vm.ScannedUser = null;
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
            vm.FormDisplay = false;
            vm.deleteFormDisplay = false;
            vm = $SharedWeighingFunctions.GetDefaultData(vm);
            LoadData(true);
        };
        // #endregion
        // #region New Weight
        // vm.addForm = function () {
        //     $rootScope.Start("WeighSettings");
        //     vm.FormDisplay = true;
        //     vm.ReadOnly = false;
        //     vm.ScannedUser = null;
        //     vm.siloSaveFlag = false;
        //     $rootScope.AxelSetups = {
        //         Items: [],
        //         Selected: null,
        //     };
        //     const getType = {};
        //     if (getType.toString.call(vm.finger) === "[object Function]")
        //     {
        //         vm.finger();
        //     }
        //     if (getType.toString.call(vm.listener) === "[object Function]")
        //     {
        //         vm.listener();
        //     }
        //     vm.selected_product = null;
        //     vm.selected_pallet = null;
        //     vm.selected_tare = null;
        //     vm.selected_businessPartner = null;
        //     vm.selected_contract = null;
        //     vm.selected_settings = null;
        //     vm.selected_weighbridge = null;
        //     vm.Single = {
        //         company_id: vm.HeaderSingle.company_id,
        //         site_id: vm.HeaderSingle.site_id,
        //         workstation_id: vm.HeaderSingle.workstation_id,
        //         settings_id: null,
        //         weighbridge_id: null,
        //         Custom1: null,
        //         Custom2: null,
        //         Custom3: null,
        //         Custom4: null,
        //         Custom5: null,
        //         Custom6: null,
        //         Custom7: null,
        //         Custom8: null,
        //         Custom9: null,
        //         Custom10: null,
        //         numberplate_1: "",
        //         numberplate_recognition: "",
        //         numberplate_2: "",
        //         numberplate_3: "",
        //         FirstWeight: 0,
        //         SecondWeight: 0,
        //         Weight1: 0,
        //         Weight2: 0,
        //         Weight3: 0,
        //         Weight4: 0,
        //         Weight5: 0,
        //         WeightTotal: 0,
        //         businesspartner_id: null,
        //         contract_id: null,
        //         product_id: null,
        //         haulier_id: null,
        //         weight: null,
        //         tare_id: null,
        //         actiontype: "New",
        //         NumberplateVerify: "warning",
        //         SiloOverride: "No",
        //     };
        //     let CalculatedWeight = 0;
        //     let UnstableWeights = [];
        //     //TODO only once the weighbridge is loaded ??
        //     // vm.listener = $scope.$watch("Weight", function (current, original) {
        //     //     if (vm.Single !== null && $rootScope.WeighBridge.weight_reg !== undefined)
        //     //     {
        //     //         vm.Single.weighttxt = String($rootScope.Weight).substring(1);
        //     //         const StringRegEx = "[0-9" + ($rootScope.WeighBridge.weight_special == "Yes" ? "\\.\\-" : "") + "]{" + $rootScope.WeighBridge.weight_num_amt + "}";
        //     //         const RegEx = new RegExp(StringRegEx);
        //     //         const StableSamples = $rootScope.WeighBridge.stable_samples;
        //     //         let temp = null;
        //     //         let WeightText = $rootScope.Weight;
        //     //         if (WeightText.match(RegEx) !== null && WeightText.match(RegEx) !== undefined)
        //     //         {
        //     //             temp = WeightText.match(RegEx)[0];
        //     //         }
        //     //         let UnstableWeight = 0;
        //     //         if (temp !== null)
        //     //         {
        //     //             const pow = parseInt($rootScope.WeighBridge.decimal_places) || 0;
        //     //             if (pow !== 0)
        //     //             {
        //     //                 UnstableWeight = parseFloat(temp) / Math.pow(10, pow);
        //     //             } else
        //     //             {
        //     //                 UnstableWeight = parseFloat(temp);
        //     //             }


        //     //             if (UnstableWeights.indexOf(UnstableWeight) > -1)
        //     //             {
        //     //                 UnstableWeights.push(UnstableWeight);
        //     //             } else
        //     //             {
        //     //                 UnstableWeights = [];
        //     //                 UnstableWeights.push(UnstableWeight);
        //     //             }

        //     //             if (UnstableWeights.length >= StableSamples)
        //     //             {
        //     //                 CalculatedWeight = UnstableWeights[0];
        //     //             }
        //     //             vm.Single.weight = CalculatedWeight;
        //     //             if (vm.Setting.type_of_weighing == "1" && (vm.Setting.second_can_axel === "Off" || vm.Setting.second_can_axel === "false"))
        //     //             {
        //     //                 vm.Single.SecondWeight = CalculatedWeight;
        //     //             } else if (vm.Setting.type_of_weighing == "2" && (vm.Setting.second_can_axel === "Off" || vm.Setting.second_can_axel === "false") && vm.Setting.tares_enabled === "true")
        //     //             {
        //     //                 vm.Single.SecondWeight = CalculatedWeight;
        //     //             } else if (vm.Setting.first_can_axel === "Off" || vm.Setting.first_can_axel === "false")
        //     //             {
        //     //                 vm.Single.FirstWeight = CalculatedWeight;
        //     //             }
        //     //             $rootScope.WeightInt = CalculatedWeight;
        //     //         }
        //     //     }
        //     // });
        //     $Functions.WeighSettings().then(function (data) {
        //         vm.Settings = data.Settings;
        //         vm.Weighbridges = data.Weighbridges;
        //         $rootScope.Loaded("WeighSettings");
        //     });

        // };
        // #endregion
        // #region Second Weight
        vm.editForm = function (data) {
            $rootScope.Start("vm.editForm in WeighingCtrl");
            // Clear previous selection if any
            vm.moistureDeduction = 0;
            vm.totalWeightWithMoisture = 0;

            vm.selected_contract = null;
            vm.Contracts = [];
            $rootScope.AxelSetups = {
                Items: [],
                Selected: null,
            };

            $Functions.secondWeightLoad(data.id).then(function (data) {
                vm.Settings = data.Settings;
                vm.Weighbridges = data.Weighbridges;
                vm.Setting = data.Settings;
                vm.ReportData.Settings = data.Setting.name;
                vm.ReportData.Header = data.Setting.custom_header_text;
                vm.ReportData.HeaderImg = data.Setting.display_custom_header_img;
                vm.ReportData.Footer = data.Setting.custom_footer_text;
                vm.ReportData.FooterImg = data.Setting.display_custom_footer_img;
                vm.Single = data.weighingHeader;
                if (data.haulier !== undefined)
                {
                    vm.Hauliers = data.haulier;
                    vm.selected_haulier = vm.Hauliers.find((haul) => haul.id == vm.Single.haulier_id);
                    vm.SelectOnChange("haulier");
                }
                if (data.stored_tares !== undefined)
                {
                    vm.allTares = tares;
                    vm.selected_tare = vm.allTares.find((tare) => tare.id == vm.Single.tare_id);
                    vm.SelectOnChange("tare");
                }
                if (data.business_partner !== undefined)
                {
                    vm.BusinessPartners = data.business_partner;
                    vm.selected_businessPartner = vm.BusinessPartners.find((business) => business.id == vm.Single.businesspartner_id);
                    vm.SelectOnChange("businesspartner");
                }
                if (data.use_product_list !== undefined)
                {
                    vm.Products = data.use_product_list;
                    vm.selected_product = vm.Products.find((product) => product.id == vm.Single.product_id);
                    vm.SelectOnChange("product");
                }
                if (data.use_cameras !== undefined)
                {
                    vm.allCameras = data.use_cameras;
                }
                if (data.pallet_enabled !== undefined)
                {
                    vm.allPallets = data.pallet_enabled;
                    vm.selected_pallet = vm.allPallets.find((pallet) => pallet.id == vm.Single.pallet_id);
                    vm.SelectOnChange("pallet");
                }
                if (data.contract_enabled !== undefined)
                {
                    vm.allContracts = data.contract_enabled;
                    vm.selected_contract = vm.allContracts.find((contract) => contract.id == vm.Single.contract_id);
                    vm.SelectOnChange("contract");
                }
                vm.FormDisplay = true;
                vm.ReadOnly = true;
                vm.selected_settings = vm.Settings.find((settings) => settings.id == vm.Single.settings_id);
                vm.Setting = data.Setting;
                vm.SetSettings();
                vm.Single.NumberplateVerify = "warning";
                vm.Single.SiloOverride = "No";
                vm.Single.FirstWeight = vm.Single.FirstWeight;
                // vm.Single.palletCharges =
                const First = vm.Single.weighingLines.find((p) => p.Status == "1");
                const firstNameFromLine = First !== undefined && First.user_name ? First.user_name : null;
                vm.Single.FirstUser = firstNameFromLine || vm.Single.FirstUser || null;
                const Verify = vm.Single.weighingLines.find((p) => p.Status == "V");
                vm.Single.VerifyUser = Verify !== undefined ? Verify.user_name : null;
                const Second = vm.Single.weighingLines.find((p) => p.Status == "2");
                const secondNameFromLine = Second !== undefined && Second.user_name ? Second.user_name : null;
                vm.Single.user_name = secondNameFromLine || vm.Single.user_name || null;
                vm.Single.actiontype = "Edit";
                vm.selected_weighbridge = vm.Weighbridges.find((weighbridge) => weighbridge.id == vm.Single.weighbridge_id);
                vm.SelectOnChange("weighbridge");
                //TODO: vm.deriveContractStatus();
                $rootScope.Loaded("vm.editForm in WeighingCtrl");
            });
            // $Functions.Settings().then(function (settings) {
            //     vm.listener = $scope.$watch(
            //         function () {
            //             return $rootScope.Weight;
            //         },
            //         function (current, original) {
            //             if (vm.Single !== null && $rootScope.WeighBridge.weight_reg !== undefined)
            //             {
            //                 vm.Single.weighttxt = String($rootScope.Weight).substring(1);
            //                 const StringRegEx = "[0-9" + ($rootScope.WeighBridge.weight_special == "Yes" ? "\\.\\-" : "") + "]{" + $rootScope.WeighBridge.weight_num_amt + "}";
            //                 const RegEx = new RegExp(StringRegEx);
            //                 let temp = null;
            //                 if ($rootScope.Weight === undefined)
            //                     return;
            //                 if ($rootScope.Weight.match(RegEx) !== null && $rootScope.Weight.match(RegEx) !== undefined)
            //                 {
            //                     temp = $rootScope.Weight.match(RegEx)[0];
            //                 }
            //                 if (temp !== null)
            //                 {
            //                     const pow = parseInt($rootScope.WeighBridge.decimal_places) || 0;
            //                     if (pow !== 0)
            //                     {
            //                         vm.Single.weight = parseFloat(temp) / Math.pow(10, pow);
            //                         if (vm.Setting.second_can_axel === "Off" || vm.Setting.second_can_axel === "false")
            //                         {
            //                             vm.Single.SecondWeight = parseFloat(temp) / Math.pow(10, pow);
            //                         }
            //                         $rootScope.WeightInt = parseFloat(temp) / Math.pow(10, pow);
            //                         //;
            //                     } else
            //                     {
            //                         if (vm.Setting.second_can_axel === "Off" || vm.Setting.second_can_axel === "false")
            //                         {
            //                             vm.Single.SecondWeight = parseFloat(temp);
            //                         }
            //                         vm.Single.weight = parseFloat(temp);
            //                         $rootScope.WeightInt = parseFloat(temp);
            //                     }
            //                     vm.updateNetWeight();
            //                 }
            //             }
            //         }
            //     );
            // });
        }
        // #endregion
        // #region Delete
        vm.deleteForm = function (data) {
            selectedWeighingId = data.id;
            vm.deleteFormDisplay = true;
            vm.ScannedUser = null;
            $rootScope.FingerFeedback = "StartVerification";
            vm.Functions.Users().then(
                function () {
                    $rootScope.Loaded("Single grade on WeighingCtrl");
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
            //TODO: Retest Delete Form
            Restangular.one(routeName, data.id).withHttpConfig({ cache: true })
                .customGET("", vm.HeaderSingle)
                .then(
                    function (dat) {
                        vm.ReadOnly = true;
                        vm.Single = dat;
                        $rootScope.Loaded("Complete");
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
        };

        vm.delete = function (data) {
            if (!vm.deleteReason)
            {
                swal("Delete Weighing", "Please add a reason to delete.", "error");
                return;
            }
            const currentTime = new Date();
            vm.Single.deleted_at = currentTime;
            vm.Single.reason = vm.deleteReason;
            vm.Single.customPOST(
                {
                    reason: vm.deleteReason,
                },
                "delete",
                {},
                {}
            ).then(
                function () {
                    vm.deleteFormDisplay = false;
                    vm.deleteReason = "";
                    LoadData();
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );

            $Functions.Users().then(function (user) {
                vm.exception = {
                    code: "TRANSACTION DELETED",
                    description: "Transaction " + vm.Single.transaction + " deleted by " + user.firstname + " " + user.lastname,
                    jsondata: JSON.stringify({
                        transaction_id: vm.Single.transaction,
                        user_id: user.id,
                    }),
                    comment: vm.Single.reason,
                    weighbridge_id: vm.Single.weighbridge_id,
                    workstation_id: vm.Single.workstation_id,
                    company_id: vm.Single.company_id,
                    site_id: vm.Single.site_id,
                };
                $Exceptions.set(vm.exception).then(function () {
                    console.log("success");
                });
            });
        };
        // #endregion
        // #region Axel
        vm.AxelChange = function () {
            if (typeof vm.Single.id == "undefined")
            {
                vm.Single.FirstWeight = parseInt(vm.Single.Weight1) + parseInt(vm.Single.Weight2) + parseInt(vm.Single.Weight3) + parseInt(vm.Single.Weight4) + parseInt(vm.Single.Weight5);
                vm.Single.weight = parseInt(vm.Single.Weight1) + parseInt(vm.Single.Weight2) + parseInt(vm.Single.Weight3) + parseInt(vm.Single.Weight4) + parseInt(vm.Single.Weight5);
            } else
            {
                vm.Single.SecondWeight =
                    parseInt(!vm.Single.Weight1 ? 0 : vm.Single.Weight1) +
                    parseInt(!vm.Single.Weight2 ? 0 : vm.Single.Weight2) +
                    parseInt(!vm.Single.Weight3 ? 0 : vm.Single.Weight3) +
                    parseInt(!vm.Single.Weight4 ? 0 : vm.Single.Weight4) +
                    parseInt(!vm.Single.Weight5 ? 0 : vm.Single.Weight5);
                vm.Single.weight =
                    parseInt(!vm.Single.Weight1 ? 0 : vm.Single.Weight1) +
                    parseInt(!vm.Single.Weight2 ? 0 : vm.Single.Weight2) +
                    parseInt(!vm.Single.Weight3 ? 0 : vm.Single.Weight3) +
                    parseInt(!vm.Single.Weight4 ? 0 : vm.Single.Weight4) +
                    parseInt(!vm.Single.Weight5 ? 0 : vm.Single.Weight5);
            }
        };
        $rootScope.$on("axleWeighingEvent", function (event, data) {
            vm.Single.Weight1 = data.Weight1;
            vm.Single.Weight2 = data.Weight2;
            vm.Single.Weight3 = data.Weight3;
            vm.Single.Weight4 = data.Weight4;
            vm.Single.Weight5 = data.Weight5;
            vm.Single.Weight6 = data.Weight6;
            console.log("-----");
            if (vm.Single.actiontype === "New" && vm.selected_settings.tares_enabled !== "true")
            {
                console.log("-----");
                vm.Single.FirstWeight = data.TotalWeight;
                console.log(vm.Single.FirstWeight);
            } else
            {
                vm.Single.SecondWeight = data.TotalWeight;
            }
            vm.updateNetWeight();
        });

        $rootScope.WeighingSystem = {
            On: null,
            Weight: null,
        };
        vm.OpenDialog = function () {
            $rootScope.AxelSetups = {
                Items: [],
                Selected: null,
                FirstWeighType: vm.selected_settings.first_can_axel,
                SecondWeighType: vm.selected_settings.second_can_axel,
            };
            Restangular.all("axelsetup").withHttpConfig({ cache: true })
                .getList({ company: vm.HeaderSingle.company_id })
                .then(function (data) {
                    $rootScope.AxelSetups.Items = data;
                    $rootScope.normalfrm = vm.normalform;
                    $rootScope.currentModal = $modal.open({
                        templateUrl: appHelper.templatePath("weighing/modal"),
                        controller: "ModalInstanceCtrl as Modal",
                        size: "lg",
                        scope: $rootScope,
                        backdrop: true,
                    });
                    $rootScope.currentModal.result.then(
                        function (selectedItem) {
                            $rootScope.Loaded(selectedItem.label);
                        },
                        function (selectedItem) {
                            $rootScope.Loaded("Modal dismissed at: " + new Date());
                        }
                    );
                });
        };
        // #endregion
        // #region initialize
        vm.initialize = function () {
            $navigation.clear();

            $Functions.Users().then(function (user) {
                vm.User = user;
                GetCompanies();

                $rootScope.AxelDisplay = "hidden";
                //LoadData();
            });
        };
        // #endregion

    });
