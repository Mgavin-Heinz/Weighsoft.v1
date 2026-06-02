"use strict";
angular.module("xenon.controllers").controller("ReprintsCtrl", function ($scope, $rootScope, $EMSOservice, Restangular, $q, $navigation, $modal, $interval, $Functions, DTOptionsBuilder) {
    if (MyLocalStorage.getItem("user_info").business_partner == "false")
    {
        $scope.businessPartner = false;
    } else
    {
        $scope.businessPartner = true;
    }
    var vm = this;
    vm.Site = {};
    vm.handlingAlias = "Handling";
    vm.HeaderSingle = {
        company_id: null,
        site_id: null,
        workstation_id: null,
    };
    vm.invoice = {
        productLines: [],
        subTotal: 0,
        vat: 0,
        total: 0,
        balanceDue: 0,
        amountDue: 0,
        businessPartner: null,
    };
    vm.ReportData = {
        Hauliers: null,
        BusinessPartners: null,
        Products: null,
        Settings: null,
        palletCharges: 0,
        First: {
            Weight: null,
            Weight1: null,
            Weight2: null,
            Weight3: null,
            Weight4: null,
            Weight5: null,
            Weight6: null,
            WeightDate: null,
            UserName: null,
            UserId: null,
        },
        Second: {
            Weight: null,
            Weight1: null,
            Weight2: null,
            Weight3: null,
            Weight4: null,
            Weight5: null,
            Weight6: null,
            WeightDate: null,
            UserName: null,
            UserId: null,
        },
        Verify: {
            UserName: null,
            UserId: null,
        },
    };

    var routeName = "weighingheaders";
    vm.Companies = [];
    vm.Sites = [];
    vm.Workstations = [];
    vm.UserLevel;

    vm.HeaderSingle = {
        company_id: null, site_id: null,
        workstation_id: null, pageSize: 10,
        searchTerm: "", pageStart: 0, 
        orderByDir: "desc", orderByCol : "updated_at"
    };
    $rootScope.WeighBridge = {};
    vm.Hauliers = [];
    vm.Businesspartners = [];
    vm.Products = [];
    vm.formData = [];
    vm.Settings = [];
    vm.Cameras = [];
    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withButtons(["csv", "colvis", "print", "excel"])
        .withOption("aaSorting", [[1, "desc"]]);
    vm.Setting = {
        company_id: "",
        name: "New Name",
        haulier: "false",
        use_product_list: "false",
        stored_tares: "false",
        numberplate_recognition: "false",
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
        actiontype: "New",
    };
    vm.Weighbridges = [];
    vm.FormDisplay = false;
    vm.deleteFormDisplay = false;
    vm.Single = {};
    vm.baseData = Restangular.all(routeName);
    var EmptyObject = {
        company_id: null,
        site_id: null,
        workstation_id: null,
        settings_id: null,
        weighbridge_id: null,
        Custom1: null,
        Custom2: null,
        Custom3: null,
        Custom4: null,
        Custom5: null,
        Custom6: null,
        Custom7: null,
        Custom8: null,
        Custom9: null,
        Custom10: null,
        FirstWeight: 0,
        SecondWeight: 0,
        Weight1: 0,
        Weight2: 0,
        Weight3: 0,
        Weight4: 0,
        Weight5: 0,
        TotalWeight: 0,
        businesspartner_id: null,
        product_id: null,
        haulier_id: null,
        weight: null,
        actiontype: "New",
    };
    vm.Site.formatNumber = function (i) {
            if (vm.Site.decimals === undefined)
            {
                //GetSites();
            }
            if (i === undefined || (typeof i !== "number" && typeof i !== "string"))
            {
                return 0;
            }
            i = typeof i === "string" ? parseFloat(i) : i;
            const decimals = vm.Site.decimals ?? 0;
            return Math.round(i * Math.pow(10, decimals)) / Math.pow(10, decimals);
        };
    $rootScope.FingerFeedback = "";
    vm.Functions = {
        HeadAll: function () {
            $rootScope.Start("All on HeadCtrl");
            $rootScope.Loaded("All fix on HeadCtrl");
            vm.Functions.Company().then(
                function (value) {
                    vm.Functions.Site().then(
                        function (value) {
                            vm.Functions.Workstation().then(
                                function (value) {
                                    $rootScope.Loaded("All on HeadCtrl");
                                },
                                function (response) {
                                    $rootScope.Error(response);
                                }
                            );
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
        },
        All: function (readonly) {
            var deferred = $q.defer();
            $rootScope.Start("All on ReprintsCtrl");
            $rootScope.Loaded("All fix on ReprintsCtrl");
            vm.Functions.Weighbridges().then(
                function (readonly) {
                    vm.Functions.Haulier().then(
                        function (readonly) {
                            vm.Functions.BusinessPartner().then(
                                function (readonly) {
                                    vm.Functions.Product().then(
                                        function (readonly) {
                                            vm.Functions.Grade().then(
                                                function (readonly) {
                                                    deferred.resolve({ data: { message: "All on ReprintsCtrl" } });
                                                },
                                                function (response) {
                                                    deferred.reject({ data: { message: response } });
                                                }
                                            );
                                        },
                                        function (response) {
                                            deferred.reject({ data: { message: response } });
                                        }
                                    );
                                },
                                function (response) {
                                    deferred.reject({ data: { message: response } });
                                }
                            );
                        },
                        function (response) {
                            deferred.reject({ data: { message: response } });
                        }
                    );
                },
                function (response) {
                    deferred.reject({ data: { message: response } });
                }
            );
            return deferred.promise;
        },
        Users: function () {
            var deferred = $q.defer();
            Restangular.all("userprofile")
                .getList($navigation.get())
                .then(
                    function (data) {
                         // Fetch the role information
                         Restangular.one("usertype", data.role_id)
                         .get()
                         .then(
                             function (role) {
                                 // Combine the role data with the user data
                                 data.role = role;  // Add the role data to the user data object
                             }
                         );
                        vm.UserLevel = data.role.id;
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
                        // $EMSOservice.Run();
                        var getType = {};

                        if (getType.toString.call(vm.finger) === "[object Function]")
                        {
                            vm.finger();
                        }
                        //Delete Form
                        vm.finger = $scope.$watch(
                            function () {
                                return $rootScope.FingerFeedback;
                            },
                            function (current, original) {
                                if (current !== original && $rootScope.FingerFeedback.length > 800 && $rootScope.FingerFeedback.indexOf(";") === -1)
                                {
                                    vm.userprofile.forEach(function (user) {
                                        if (user.fingerprint.indexOf(";") == -1)
                                        {
                                            if (user.fingerprint.substring(1, user.fingerprint.length) == $rootScope.FingerFeedback.substring(1, user.fingerprint.length))
                                            {
                                                $rootScope.WeighFeedback = $rootScope.WeighFeedback + user.firstname + " " + user.lastname + "\n";
                                                vm.ScannedUser = user.id;
                                                vm.Single.user_id = user.id;
                                                vm.Single.user_name = user.firstname + " " + user.lastname;
                                                swal("Congrats", "Finger Print Match." + user.firstname + " " + user.lastname, "info");
                                            }
                                        } else
                                        {
                                            var fingerprints = user.fingerprint.split(";");
                                            fingerprints.forEach(function (current_value) {
                                                if (current_value.substring(1, user.fingerprint.length) == $rootScope.FingerFeedback.substring(1, user.fingerprint.length))
                                                {
                                                    vm.ScannedUser = user.id;
                                                    vm.Single.user_id = user.id;
                                                    vm.Single.user_name = user.firstname + " " + user.lastname;
                                                    swal("Congrats", "Finger Print Match." + user.firstname + " " + user.lastname, "info");
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        );
                        deferred.resolve({ data: { message: "userprofile success!" } });
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        },
        Single: function (type) {
            $rootScope.Start("Single on ReprintsCtrl");
            switch (type)
            {
                case "company":
                    $Functions.Company(vm.User.company_id).then(function (companyList) {
                        vm.Companies = companyList;
                        if ($rootScope.Params.company_id !== null)
                        {
                            vm.HeaderSingle.company_id = $rootScope.Params.company_id;
                            $navigation.Company(vm.HeaderSingle.company_id);
                            vm.ReportData.Company = $rootScope.MasterData.find((company) => company.id === $rootScope.Params.company_id);
                            vm.ReportData.Site = vm.ReportData.Company.sites.find((site) => site.id === $rootScope.Params.site_id);
                            vm.Functions.Single("site");
                        }
                    });

                    break;
                case "site":
                    $Functions.Site().then(
                        function (siteList) {
                            vm.HeaderSingle.site_id = $rootScope.Params.site_id;
                            vm.Sites = siteList;
                            $navigation.Site(vm.HeaderSingle.site_id);
                            if (vm.Sites.length == 1 || $rootScope.Params.site_id !== null)
                            {
                                if (vm.Sites.length == 1)
                                {
                                    vm.HeaderSingle.site_id = vm.Sites[0].value;
                                    vm.Site.decimals = vm.Sites[0].decimals;
                                    vm.Site.measure_type = vm.Sites[0].measure_type;
                                    vm.Site.deduct_flow = vm.Sites[0].deduct_flow;
                                    $rootScope.Params.site_id = vm.Sites[0].value;
                                }
                                vm.Functions.Single("workstation");
                            }
                            $rootScope.Loaded("Single Site on ReprintsCtrl");
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
                            vm.HeaderSingle.workstation_id = $rootScope.Params.workstation_id;
                            $navigation.Workstation(vm.HeaderSingle.workstation_id);
                            if (vm.Workstations.length == 1 || $rootScope.Params.workstation_id !== null)
                            {
                                if (vm.Workstations.length == 1)
                                {
                                    vm.HeaderSingle.workstation_id = vm.Workstations[0].value;
                                    $rootScope.Params.workstation_id = vm.Workstations[0].value;
                                }
                                vm.Functions.Single("weighbridges");
                                vm.Functions.Single("settings");
                            }
                            $rootScope.Loaded("Single Workstation on ReprintsCtrl");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );

                    break;
                case "weighbridges":
                    $Functions.Weighbridges().then(function (weighbridgeList) {
                        vm.Weighbridges = weighbridgeList;
                    });
                    break;
                case "weighbridge":
                    vm.Functions.Weighbridge().then(
                        function (value) {
                            $rootScope.Loaded("Single weighbridge on ReprintsCtrl");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                    break;
                case "settings":
                    $Functions.Settings().then(
                        function (value) {
                            vm.Settings = value;
                            $rootScope.Loaded("Single settings on ReprintsCtrl2");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                    break;
                case "haulier":
                    $Functions.Haulier().then(
                        function (value) {
                            $rootScope.Loaded("Single Haulier on ReprintsCtrl");
                            vm.SelectOnChange("haulier");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                    break;
                case "businesspartner":
                    $Functions.BusinessPartner().then(
                        function (value) {
                            $rootScope.Loaded("Single BusinessPartner on ReprintsCtrl");
                            vm.SelectOnChange("businesspartner");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                    break;
                case "product":
                    $Functions.Product().then(
                        function (value) {
                            vm.Products = value;
                            $rootScope.Loaded("Single Product on ReprintsCtrl");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                    break;
                case "camera":
                    $Functions.Camera().then(
                        function (value) {
                            $rootScope.Loaded("Single grade on ReprintsCtrl");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                    break;
                case "WeighingDirection":
                    $rootScope.Loaded("WeighingDirection");
                    break;
            }
        },
    };
    vm.Fingerprint = function () {
        $rootScope.FingerFeedback = "StartVerification";
        $Functions.Users().then(
            function (value) {
                $rootScope.Loaded("Single grade on ReprintsCtrl");
            },
            function (response) {
                $rootScope.Error(response);
            }
        );
    };
    vm.load = function () {
        $navigation.clear();
        $Functions.Users().then(function (user) {
            vm.User = user;
            vm.Functions.Single("company");
            vm.Functions.Single("site");
            var navInfo = $navigation.get();

            vm.HeaderSingle.company_id = navInfo.company_id;
            if (navInfo.site_id !== null)
            {
                vm.HeaderSingle.site_id = navInfo.site_id;
                vm.Functions.Single("workstation");
            }
            if (navInfo.workstation_id !== null)
            {
                vm.HeaderSingle.workstation_id = navInfo.workstation_id;
                vm.Functions.Single("weighbridges");
                vm.Functions.Single("settings");
            }
            vm.workstation_id = navInfo.workstation_id;
            $rootScope.AxelDisplay = "hidden";
            LoadData();
        });
    };
    function LoadData() {
        $navigation.clear();
        vm.formData = [];
        $Functions.Users().then(function (user) {
            vm.User = user;
            vm.Functions.Single("company");

            $rootScope.AxelDisplay = "hidden";
            $rootScope.Start("vm.LoadData in ReprintsCtrl");
            vm.baseData.getList(vm.HeaderSingle).then(
                function (data) {
                    vm.formData = data;
                    vm.Single = JSON.parse(JSON.stringify(EmptyObject));

                    vm.FormDisplay = false;
                    $rootScope.Loaded("vm.LoadData in ReprintsCtrl");
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
        });
    }
    vm.ScannedUser = null;
    vm.SelectOnChange = function (type, e) {
        switch (type)
        {
            case "company":
                vm.Sites = [];
                vm.Workstations = [];
                vm.formData = [];
                vm.HeaderSingle.site_id = null;
                vm.HeaderSingle.workstation_id = null;
                $navigation.clear();
                EmptyObject.company_id = vm.HeaderSingle.company_id;
                $navigation.Company(vm.HeaderSingle.company_id);
                EmptyObject.site_id = null;
                EmptyObject.workstation_id = null;
                vm.Functions.Single("site");
                LoadData();
                break;
            case "site":
                vm.Workstations = [];
                vm.formData = [];
                vm.HeaderSingle.workstation_id = null;
                EmptyObject.site_id = vm.HeaderSingle.site_id;
                $navigation.Site(vm.HeaderSingle.site_id);
                EmptyObject.workstation_id = null;
                vm.Functions.Single("workstation");
                LoadData();
                break;
            case "workstation":
                vm.formData = [];
                EmptyObject.workstation_id = vm.HeaderSingle.workstation_id;
                $navigation.Workstation(vm.HeaderSingle.workstation_id);
                vm.Functions.Single("weighbridges");
                vm.Functions.Single("settings");
                vm.Single = JSON.parse(JSON.stringify(EmptyObject));
                LoadData();
                break;
            case "weighbridge":
                vm.Functions.Single("product");
                $navigation.Weighbridge(vm.Single.weighbridge_id);
                break;
            case "haulier":
                if (vm.Hauliers != undefined && vm.Hauliers.length > 0)
                    vm.Hauliers.forEach(function (haul) {
                        if (vm.Single.haulier_id == haul.value)
                        {
                            vm.ReportData.Hauliers = haul.report;
                        }
                    });
                break;
            case "businesspartner":
                if (vm.BusinessPartners != undefined && vm.BusinessPartners.length > 0)
                    vm.BusinessPartners.forEach(function (buzz) {
                        if (vm.Single.businesspartner_id == buzz.value)
                        {
                            vm.ReportData.BusinessPartners = buzz.report;
                            vm.invoice.businessPartner = buzz;
                        }
                    });
                break;
            case "product":
                if (vm.Products != undefined && vm.Products.length > 0)
                    vm.Products.forEach(function (product) {
                        if (vm.Single.product_id == product.value)
                        {
                            vm.ReportData.Products = product.report;
                            console.log('REPRINT PRODUCTS', vm.ReportData.Products)
                            buildProductInvoice(product);
                        }
                    });
                break;
            case "settings":
                vm.Settings.forEach(function (Setting) {
                    if (Setting.id == vm.Single.settings_id)
                    {
                        vm.Setting = Setting;
                        console.log("VM.Setting onchange",vm.Setting);
                        vm.ReportData.Settings = "Reprint: " + vm.Setting.name;
                            vm.ReportData.Header = vm.Setting.custom_header_text;
                            vm.ReportData.HeaderImg = vm.Setting.display_custom_header_img;
                            vm.ReportData.Footer = vm.Setting.custom_footer_text;
                            vm.ReportData.FooterImg = vm.Setting.display_custom_footer_img;
                            vm.ReportData.MeasureTypes = vm.Setting.measure_type;
                    }
                });
                break;
        }
    };
    vm.getDatetime = null;
    vm.save = function () {
        vm.getDatetime = new Date().toString();
        vm.Single.handlingAlias = vm.handlingAlias;

        var getType = {};
        if (getType.toString.call($rootScope.weightwatch) === "[object Function]")
        {
            $rootScope.weightwatch();
        }
        if (getType.toString.call(vm.listener) === "[object Function]")
        {
            vm.listener();
        }
        if (getType.toString.call(vm.finger) === "[object Function]")
        {
            vm.finger();
        }

        if (!vm.Single.$valid)
        {
            if (vm.Single.actiontype !== null && vm.Single.actiontype === "New")
            {
                //
            } else
            {
                setTimeout(function () {
                    window.print();
                    setTimeout(function () {
                        vm.FormDisplay = false;
                        LoadData("vm.save in ReprintsCtrl");
                    }, 100);
                }, 100);
            }
        }
    };
    vm.cancel = function () {
        vm.ScannedUser = null;
        var getType = {};
        if (getType.toString.call($rootScope.weightwatch) === "[object Function]")
        {
            $rootScope.weightwatch();
        }
        if (getType.toString.call(vm.listener) === "[object Function]")
        {
            vm.listener();
        }
        if (getType.toString.call(vm.finger) === "[object Function]")
        {
            vm.finger();
        }
        vm.FormDisplay = false;
        vm.deleteFormDisplay = false;
    };

    function calculateMoisture(totalWeight, moisturePercentage, prescribedMoisture) {
        const moistureCoefficient = 1 - (100 - moisturePercentage) / (100 - prescribedMoisture);
        return totalWeight * moistureCoefficient;
    }

    var buildProductInvoice = function (product) {
        var productLines = [];
        var productPrice = vm.Setting.goods_type === "1" ? product.purchase_price : product.sale_price;
        var unitPrice = parseFloat(productPrice);
        if (vm.Setting.contract_enabled && vm.Single.contract_transaction && vm.Single.contract_transaction.contract)
        {
            if (vm.Single.contract_transaction.contract.price && vm.Single.contract_transaction.contract.price.length > 0) unitPrice = parseFloat(vm.Single.contract_transaction.contract.price);
        }
        //var netWeight = Math.abs(parseFloat(vm.Single.FirstWeight) - parseFloat(vm.Single.SecondWeight));
        var netWeight = vm.Single.NettWeight;
        var productLine = {
            code: product.code,
            desc: product.name,
            unitPrice: unitPrice,
            qty: { value: netWeight, symbol: vm.Setting.MeasureTypes },
            total: unitPrice * netWeight,
            type: "P",
        };
        productLines.push(productLine);

        // Handling Charges
        // var onePercentOfTotal = unitPrice * netWeight * 0.01;
        // var handlingPercentage = vm.Single.handling_charges;
        // var handlingCharge = onePercentOfTotal * handlingPercentage;
        // var handlingChargeItem = {
        //     code: null,
        //     desc: "Handling Charges",
        //     unitPrice: onePercentOfTotal,
        //     qty: { value: handlingPercentage, symbol: "%" },
        //     total: handlingCharge,
        //     type: "HC",
        // };

        // if (vm.Setting.enable_handling === "true")
        // {
        //     productLines.push(handlingChargeItem);
        // }

        // // Moisture
        // var moisture = vm.Single.moistureWeight ? parseFloat(vm.Single.moisture_deduction) - vm.Setting.moisture_deduction_level : 0;

        // var moistureCharge;
        // if (moisture > 0)
        // {
        //     moistureCharge = unitPrice * netWeight * (moisture / 100);
        // }

        // if (moistureCharge && vm.Setting.enable_moisture === "true")
        //     productLines.push({
        //         code: null,
        //         desc: "Moisture " + parseFloat(vm.Single.moisture_deduction).toFixed(2) + " %",
        //         unitPrice: onePercentOfTotal,
        //         qty: { value: moisture, symbol: "%" },
        //         total: moistureCharge,
        //         type: "MC",
        //     });

        // var palletCharge = vm.Single.pallet_charges ? parseFloat(vm.Single.pallet_charges) : 0;
        // if (palletCharge > 0)
        // {
        //     Restangular.one("pallets", vm.Single.pallet_id)
        //         .get()
        //         .then((res) => {
        //             productLines.push({
        //                 code: null,
        //                 desc: "Pallet Handling Charges",
        //                 unitPrice: res.amount,
        //                 qty: { value: vm.Single.pallet_count },
        //                 total: palletCharge,
        //                 type: "PC",
        //             });
        //         });
        // }

        vm.invoice.productLines = productLines;
        //vm.invoice.subTotal = productLine.total - handlingCharge - (moistureCharge ? moistureCharge : 0) - (palletCharge ? palletCharge : 0);
        vm.invoice.subTotal = unitPrice * netWeight;
        console.log("VAT", product.vat);
        vm.invoice.vat = product.vat ? roundToTwo((vm.invoice.subTotal * parseFloat(product.vat)) / 100) : 0;
        vm.invoice.total = vm.invoice.subTotal + vm.invoice.vat;
        vm.invoice.balanceDue = vm.invoice.amountDue = vm.invoice.total;
    };

    function roundToTwo(num) {
        return +(Math.round(num + "e+2") + "e-2");
    }

    // var calculateMoistureDeduction = function () {
    //     var totalWeight = Math.abs(vm.Single.FirstWeight - vm.Single.SecondWeight);
    //     vm.ReportData.nett = totalWeight ? totalWeight : 0;
    //     vm.ReportData.moistureDeduction = 0;
    //     if (vm.Single.SecondWeight > 0 && vm.Single.moisture_deduction > 0) {
    //         var moisturePercentage = vm.Single.moisture_deduction ? parseFloat(vm.Single.moisture_deduction) - vm.Setting.moisture_deduction_level : 0;
    //         if (moisturePercentage > 0) {
    //             vm.ReportData.moistureDeduction = calculateMoisture(totalWeight, vm.Single.moisture_deduction, vm.Setting.moisture_deduction_level);
    //         }
    //     }
    //     vm.ReportData.nett = totalWeight - vm.ReportData.moistureDeduction - vm.ReportData.handlingCharges - vm.ReportData.palletCharges;
    // };
    vm.ReportData.handlingCharges = 0;
    // var calculateHandlingCharges = function () {
    //     var totalWeight = Math.abs(vm.Single.FirstWeight - vm.Single.SecondWeight);
    //     vm.ReportData.handlingCharges = 0;
    //     if (vm.Single.SecondWeight > 0 && vm.Single.handling_charges > 0) {
    //         var handlingPercentage = vm.Single.handling_charges ? parseFloat(vm.Single.handling_charges) : 0;
    //         if (handlingPercentage > 0) {
    //             vm.ReportData.handlingCharges = totalWeight * (handlingPercentage / 100);
    //         }
    //     }
    //     vm.ReportData.nett = totalWeight - vm.ReportData.moistureDeduction - vm.ReportData.handlingCharges - vm.ReportData.palletCharges;
    // };
    var calculatePalletCharges = function () {
        var totalWeight = Math.abs(vm.Single.FirstWeight - vm.Single.SecondWeight);
        vm.ReportData.palletCharges = 0;
        var palletCount = vm.Single.pallet_count ? parseFloat(vm.Single.pallet_count) : 0;
        if (palletCount > 0)
        {
            vm.ReportData.palletCharges = parseFloat(vm.Single.pallet_charges);
            console.log('PALLETS', vm.ReportData.palletCharges);
            vm.ReportData.palletCount = vm.Single.pallet_count;
            Restangular.one("pallets", vm.Single.pallet_id)
                .get()
                .then((res) => {
                    print('RES',res);
                    vm.ReportData.palletName = res.pallet_name;
                    vm.ReportData.palletAmount = res.amount;
                });
        }
        vm.ReportData.nett = totalWeight - vm.ReportData.moistureDeduction - vm.ReportData.handlingCharges - vm.ReportData.palletCharges;
    };
    vm.editForm = function (data) {
        $rootScope.Start("vm.editForm in ReprintsCtrl");
        vm.ScannedUser = null;
        $scope.Service = Restangular.one(routeName, data.id);
        $scope.Service.customGET("", vm.HeaderSingle).then(
            function (dat) {
                // if there is a contract then
                console.log('REPRINT DATA', dat);
            if(dat.contractTransaction != null) {
                if (dat.contract_total_amount && dat.contract_total_amount > 0)
                {
                    vm.ReportData.Contract = {
                        name: dat.contractTransaction.contract.name,
                        promised: dat.contract_total_amount,
                        delivered: dat.contract_total_amount - dat.contract_remaining_amount,
                        remaining: dat.contract_remaining_amount,
                    };
                }
            }
                vm.ReportData.FirstWeight = dat.FirstWeight;
                vm.ReportData.SecondWeight = dat.SecondWeight;
                vm.ReportData.nett = dat.NettWeight;
                vm.ReportData.moistureDeduction = dat.moistureWeight;
                vm.ReportData.handlingCharges = dat.handlingWeight;
                vm.HeaderSingle.weighing_header = dat.id;
                Restangular.all("weighingtransactions")
                    .getList(vm.HeaderSingle)
                    .then(
                        function (weighingtransactions) {
                            vm.Single.weighingtransactions = weighingtransactions;
                            var First = weighingtransactions.findIndex((p) => p.Status == "1");
                            vm.ReportData.First.Weight = parseFloat(weighingtransactions[First].WeightTotal);
                            vm.ReportData.First.Weight1 = weighingtransactions[First].Weight1;
                            vm.ReportData.First.Weight2 = weighingtransactions[First].Weight2;
                            vm.ReportData.First.Weight3 = weighingtransactions[First].Weight3;
                            vm.ReportData.First.Weight4 = weighingtransactions[First].Weight4;
                            vm.ReportData.First.Weight5 = weighingtransactions[First].Weight5;
                            vm.ReportData.First.Weight6 = weighingtransactions[First].Weight6;
                            vm.ReportData.First.WeightDate = weighingtransactions[First].created_at;
                            vm.ReportData.First.UserId = weighingtransactions[First].user_id;
                            vm.ReportData.First.UserName = weighingtransactions[First].user_name;
                            var Second = weighingtransactions.findIndex((p) => p.Status == "2");
                            vm.ReportData.Second.Weight = Second === -1 ? null : parseFloat(weighingtransactions[Second].WeightTotal);
                            vm.ReportData.Second.Weight1 = Second === -1 ? null : parseFloat(weighingtransactions[Second].Weight1);
                            vm.ReportData.Second.Weight2 = Second === -1 ? null : parseFloat(weighingtransactions[Second].Weight2);
                            vm.ReportData.Second.Weight3 = Second === -1 ? null : parseFloat(weighingtransactions[Second].Weight3);
                            vm.ReportData.Second.Weight4 = Second === -1 ? null : parseFloat(weighingtransactions[Second].Weight4);
                            vm.ReportData.Second.Weight5 = Second === -1 ? null : parseFloat(weighingtransactions[Second].Weight5);
                            vm.ReportData.Second.Weight6 = Second === -1 ? null : parseFloat(weighingtransactions[Second].Weight6);
                            $rootScope.AxelSetups = JSON.stringify(weighingtransactions[Second].AxelSetups);
                            vm.ReportData.Second.WeightDate = Second === -1 ? null : weighingtransactions[Second].created_at;
                            vm.ReportData.Second.UserId = Second === -1 ? null : weighingtransactions[Second].user_id;
                            vm.ReportData.Second.UserName = Second === -1 ? null : weighingtransactions[Second].user_name;
                            var Verify = weighingtransactions.findIndex((p) => p.Status == "V");
                            vm.ReportData.Verify.UserId = Verify === -1 ? null : weighingtransactions[Verify].user_id;
                            vm.ReportData.Verify.UserName = Verify === -1 ? null : weighingtransactions[Verify].user_name;

                            // calculateMoistureDeduction();
                            // calculateHandlingCharges();
                            calculatePalletCharges();
                            vm.cam = [];
                            weighingtransactions.forEach((wow) => {
                                wow.Cameras.forEach((c) => {
                                    c.ip_address = "data:image/png;base64," + c.base64;
                                    vm.cam.push(c);
                                });
                            });
                            vm.Single.handlingAlias = vm.handlingAlias;
                            console.log(vm.ReportData);
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                vm.FormDisplay = true;
                vm.ReadOnly = true;
                vm.Single = dat;
                vm.Single.FirstWeight = parseFloat(vm.Single.FirstWeight);
                vm.Single.SecondWeight = parseFloat(vm.Single.SecondWeight);
                angular.forEach(dat.weighingLines, function (weighing) {
                    if (weighing.Status === "1")
                    {
                        vm.Single.FirstDate = weighing.created_at;
                    } else if (weighing.Status === "2")
                    {
                        vm.Single.SecondDate = weighing.created_at;
                    }
                });
                vm.Single.actiontype = "Edit";
                vm.SelectOnChange("settings");
                vm.SelectOnChange("weighbridges");
                vm.SelectOnChange("weighbridge");
                vm.SelectOnChange("haulier");
                Restangular.all("haulier")
                    .getList($navigation.get())
                    .then(
                        function (data) {
                            vm.Hauliers = [];
                            data.forEach(function (mapData) {
                                vm.Hauliers.push({
                                    value: mapData.id,
                                    name: mapData.name + " (" + mapData.code + ")",
                                    report: mapData.name + " (" + mapData.code + ")", //mapData.code + '<br>' + mapData.name + '<br>'
                                });
                            });
                            vm.SelectOnChange("haulier");
                        },
                        function (response) { }
                    );
                Restangular.all("businesspartner")
                    .getList($navigation.get())
                    .then(
                        function (data) {
                            vm.BusinessPartners = [];
                            data.forEach(function (mapData) {
                                vm.BusinessPartners.push({
                                    value: mapData.id,
                                    name: mapData.name + " (" + mapData.code + ")",
                                    report: mapData.name + " (" + mapData.code + ")",
                                    city: mapData.city,
                                    code: mapData.code,
                                    postal_code: mapData.postal_code,
                                    street: mapData.street,
                                    suburb: mapData.suburb,
                                    vat_nr: mapData.vat_nr,
                                });
                            });
                            vm.SelectOnChange("businesspartner");
                        },
                        function (response) { }
                    );
                Restangular.all("product")
                    .getList($navigation.get())
                    .then(
                        function (data) {
                            vm.Products = [];
                            data.forEach(function (mapData) {
                                vm.Products.push({
                                    value: mapData.id,
                                    code: mapData.code,
                                    name: mapData.name + " (" + mapData.code + ")",
                                    report: mapData.name + " (" + mapData.code + ")",
                                    purchase_price: mapData.purchase_price,
                                    sale_price: mapData.sale_price,
                                    vat: mapData.vat,
                                });
                            });
                            vm.SelectOnChange("product");
                        },
                        function (response) { }
                    );

                //vm.SelectOnChange("settings");
                var getType = {};
                vm.finger = $scope.$watch(
                    function () {
                        return $rootScope.FingerFeedback;
                    },
                    function (current, original) {
                        if (current !== original && $rootScope.FingerFeedback.length > 800 && $rootScope.FingerFeedback.indexOf(";") === -1)
                        {
                            vm.userprofile.forEach(function (user) {
                                if (user.fingerprint.substring(1, user.fingerprint.length) == $rootScope.FingerFeedback.substring(1, user.fingerprint.length))
                                {
                                    $rootScope.WeighFeedback = $rootScope.WeighFeedback + user.firstname + " " + user.lastname + "\n";
                                    vm.ScannedUser = user.id;
                                }
                            });
                        }
                    }
                );
                vm.Single.TotalWeight = vm.Single.FirstWeight - vm.Single.SecondWeight;
                vm.ReportData.Company = $rootScope.MasterData.find((company) => company.id === $rootScope.Params.company_id);
                vm.ReportData.Site = vm.ReportData.Company.sites.find((site) => site.id === $rootScope.Params.site_id);
                console.log("REPORT Company", vm.ReportData.Company);
                console.log("REPORT SITE", vm.ReportData.Site);
                $rootScope.Loaded("Complete");
            },
            function (response) {
                $rootScope.Error(response);
            }
        );
    };

    var selectedWeighingId = null;

    vm.deleteReprint = function (data) {
        selectedWeighingId = data.id;
        vm.deleteFormDisplay = true;
        vm.ScannedUser = null;
        $rootScope.FingerFeedback = "StartVerification";
        vm.Functions.Users().then(
            function () {
                $rootScope.Loaded("Single grade on ReprintsCtrl");
            },
            function (response) {
                $rootScope.Error(response);
            }
        );
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
        // if (!confirm("Are you sure you want to delete?")) {
        //   return;
        // }
        // $rootScope.Start();
        // var transService = Restangular.one(routeName, data.id);
        // transService.customGET("", vm.HeaderSingle).then(function (transactionInfo) {
        //   transactionInfo.remove().then(
        //     function () {
        //       LoadData();
        //     },
        //     function (response) {
        //       console.error(JSON.stringify(response));
        //       $rootScope.Error(response);
        //     }
        //   );
        // });
    };

    vm.delete = function (data) {
        if (!vm.deleteReason)
        {
            swal("Delete Weighing", "Please add a reason to delete.", "error");
            return;
        }
        var currentTime = new Date();
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
                comment: vm.deleteReason,
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

    vm.AxelChange = function () {
        if (vm.Single.actiontype !== null && vm.Single.actiontype === "New")
        {
            vm.Single.FirstWeight = parseFloat(vm.Single.Weight1) + parseFloat(vm.Single.Weight2) + parseFloat(vm.Single.Weight3) + parseFloat(vm.Single.Weight4) + parseFloat(vm.Single.Weight5);
        } else
        {
            vm.Single.SecondWeight =
                parseFloat(!vm.Single.Weight1 ? 0 : vm.Single.Weight1) +
                parseFloat(!vm.Single.Weight2 ? 0 : vm.Single.Weight2) +
                parseFloat(!vm.Single.Weight3 ? 0 : vm.Single.Weight3) +
                parseFloat(!vm.Single.Weight4 ? 0 : vm.Single.Weight4) +
                parseFloat(!vm.Single.Weight5 ? 0 : vm.Single.Weight5);
        }
    };
    $rootScope.WeighingSystem = {
        On: null,
        Weight: null,
    };
    vm.OpenDialog = function (modal_id, modal_size, modal_backdrop) {
        $rootScope.AxelSetups = {
            Items: [],
            Selected: null,
        };
        vm.setupBaseData = Restangular.all("axelsetup");
        vm.setupBaseData.getList({ company: vm.HeaderSingle.company_id }).then(function (data) {
            $rootScope.AxelSetups.Items = data;

            $rootScope.normalfrm = vm.normalform;
            $rootScope.currentModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                scope: $rootScope,
                backdrop: typeof modal_backdrop == "undefined" ? true : modal_backdrop,
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
});
