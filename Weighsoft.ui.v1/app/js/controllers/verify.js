'use strict';
angular
        .module('xenon.controllers')
        .controller('VerifyCtrl', function($scope, $rootScope,$stateParams, $EMSOservice, Restangular, $q, $navigation, $modal, $interval, $Functions, $Exceptions){
            var vm = this;
            var routeName = 'weighingheaders';

            $rootScope.WeighBridge = {};
            $scope.showweighings = function(weighings){
                return weighings.status == 'VERIFY';
            };
            vm.HeaderSingle = {
                company_id: $stateParams.company_id,
                site_id: $stateParams.site_id,
                workstation_id: $stateParams.workstation_id,
                company: $stateParams.company,
                site: $stateParams.site,
                workstation: $stateParams.workstation
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
            };

            vm.Companies = [];
            vm.Sites = [];
            vm.Workstations = [];
            vm.User;
            vm.UserLevel;

            vm.weighingTypes = [];
            vm.Hauliers = [];
            vm.Businesspartners = [];
            vm.Products = [];
            vm.Settings = [];
            vm.Cameras = [];
            vm.ScannedUser = null;
            vm.selected_businessPartner = [];
            vm.selected_product = [];
            vm.formData = [];
            vm.siloSaveFlag = false;
            vm.deleteFormDisplay = false;

            vm.Setting = {
                company_id: "",
                name: "New Name",
                haulier: "false",
                use_product_list: "false",
                stored_tares: "false",
                numberplate_1: "No", numberplate_recognition: "No", numberplate_2: "No", numberplate_3: "No",
                business_partner: "false", type_of_weighing: "single", first_can_axel: "false", second_can_axel: "false",
                goods_type: "Received Goods", print_ticket: "none", reprint: "false", custom_fields: "false",
                user_defined_input1: "N", user_defined_name1: "", user_defined_val1: "", user_defined_rep1: "false",
                user_defined_input2: "N", user_defined_name2: "", user_defined_val2: "", user_defined_rep2: "false",
                user_defined_input3: "N", user_defined_name3: "", user_defined_val3: "", user_defined_rep3: "false",
                user_defined_input4: "N", user_defined_name4: "", user_defined_val4: "", user_defined_rep4: "false",
                user_defined_input5: "N", user_defined_name5: "", user_defined_val5: "", user_defined_rep5: "false",
                user_defined_input6: "N", user_defined_name6: "", user_defined_val6: "", user_defined_rep6: "false",
                user_defined_input7: "N", user_defined_name7: "", user_defined_val7: "", user_defined_rep7: "false",
                user_defined_input8: "N", user_defined_name8: "", user_defined_val8: "", user_defined_rep8: "false",
                user_defined_input9: "N", user_defined_name9: "", user_defined_val9: "", user_defined_rep9: "false",
                user_defined_input10: "N", user_defined_name10: "", user_defined_val10: "", user_defined_rep10: "false",
                user_defined_input11: "N", user_defined_name11: "", user_defined_val11: "", user_defined_rep11: "false",
                user_defined_input12: "N", user_defined_name12: "", user_defined_val12: "", user_defined_rep12: "false",
                user_defined_input13: "N", user_defined_name13: "", user_defined_val13: "", user_defined_rep13: "false",
                user_defined_input14: "N", user_defined_name14: "", user_defined_val14: "", user_defined_rep14: "false",
                user_defined_input15: "N", user_defined_name15: "", user_defined_val15: "", user_defined_rep15: "false",
                user_defined_input16: "N", user_defined_name16: "", user_defined_val16: "", user_defined_rep16: "false",
                user_defined_input17: "N", user_defined_name17: "", user_defined_val17: "", user_defined_rep17: "false",
                user_defined_input18: "N", user_defined_name18: "", user_defined_val18: "", user_defined_rep18: "false",
                user_defined_input19: "N", user_defined_name19: "", user_defined_val19: "", user_defined_rep19: "false",
                user_defined_input20: "N", user_defined_name20: "", user_defined_val20: "", user_defined_rep20: "false",
                export_AS400: "false", silo_verification: "false", use_cameras: "false", display_cameras: "false",
                print_cameras_on_ticket: "false", ticket_header: "false", display_custom_header_img: "", custom_header_text: "",
                ticket_footer: "false", display_custom_footer_img: "", custom_footer_text: "",
            };
            vm.exception = {
                code: "Transaction Deleted",
                description: "",
                jsondata: "",
                comment: "",
                weighbridge_id: "",
                workstation_id: "",
                site_id: "",
                company_id: ""
            }

            vm.Weighbridges = [];
            vm.FormDisplay = false;
            vm.Single = {};
            vm.baseData = Restangular.all(routeName);
            $rootScope.WeighFeedback = "";
            $rootScope.FingerFeedback = "";

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
                    } else
                    {
                        $rootScope.Loaded("Single Site on VerifyCtrl");
                    }
                });
            };
            const GetSites = function () {
                $Functions.Site().then(
                    function (siteList) {
                        if (vm.HeaderSingle.site_id === null)
                        {
                            vm.HeaderSingle.site_id = $rootScope.Params.site_id;
                        }
                        vm.Sites = siteList;
                        let site = vm.Sites.find((site) => site.value == vm.HeaderSingle.site_id);
                        if (site == undefined && vm.Sites.length == 1)
                        {
                            site = vm.Sites[0];
                            $rootScope.Params.site_id = site.value;
                            vm.HeaderSingle.site_id = site.value;
                        }

                        vm.SharedWorkstation = (site && site.shared_workstation === 'Yes') ? 'Yes' : 'No';

                        $navigation.Site(vm.HeaderSingle.site_id);
    
                        if (vm.Sites.length === 1)
                        {
                            vm.HeaderSingle.site_id = vm.Sites[0].value;
                            $rootScope.Params.site_id = vm.Sites[0].value;
                        }
    
                        if (vm.Sites.length === 1 || $rootScope.Params.site_id !== null)
                        {
                            if (vm.SharedWorkstation === 'Yes')
                            {
                                LoadData();
                            }
                            GetWorkstations();
                        }
    
                        $rootScope.Loaded("Single Site on VerifyCtrl");
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
            };
    
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
                            if (vm.SharedWorkstation !== 'Yes')
                            {
                                LoadData();
                            }
                        }
                        $rootScope.Loaded("Single Workstation on VerifyCtrl");
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
            };

            vm.Functions = {
                Users: function(){
                    var deferred = $q.defer();
                    Restangular.all("userprofile").getList($navigation.get()).then(function(data){
                        vm.userprofile = [];
                        $rootScope.FingerFeedback = "";
                        data.forEach(function(mapData){
                            vm.userprofile.push({fingerprint: mapData.fingerprint, id: mapData.firstname,
                                firstname: mapData.firstname, lastname: mapData.lastname});
                            $rootScope.FingerFeedback = $rootScope.FingerFeedback + mapData.fingerprint + ";";
                        });
                        $EMSOservice.Run();
                        var getType = {};

                        if(getType.toString.call(vm.finger) === '[object Function]'){
                            vm.finger();
                        }
//Delete Form
                        vm.finger = $scope.$watch(function(){
                            return $rootScope.FingerFeedback;
                        }, function(current, original){
                            if(current !== original && $rootScope.FingerFeedback.length > 800 && $rootScope.FingerFeedback.indexOf(';') === -1){
                                vm.userprofile.forEach(function(user){
                                    if(user.fingerprint.indexOf(';') == -1){
                                        if(user.fingerprint.substring(1, user.fingerprint.length) == $rootScope.FingerFeedback.substring(1, user.fingerprint.length)){
                                            $rootScope.WeighFeedback = $rootScope.WeighFeedback + user.firstname + ' ' + user.lastname + '\n';
                                            vm.ScannedUser = user.id;
                                            vm.Single.user_id = user.id;
                                            vm.Single.user_name = user.firstname + ' ' + user.lastname;
                                            swal(
                                                    'Congrats',
                                                    'Finger Print Match.' + user.firstname + ' ' + user.lastname,
                                                    'info'
                                                    );
                                        }
                                    }else{
                                        var fingerprints = user.fingerprint.split(";");
                                        fingerprints.forEach(function(current_value){
                                            if(current_value.substring(1, user.fingerprint.length) == $rootScope.FingerFeedback.substring(1, user.fingerprint.length)){
                                                vm.ScannedUser = user.id;
                                                vm.Single.user_id = user.id;
                                                vm.Single.user_name = user.firstname + ' ' + user.lastname;
                                                swal(
                                                        'Congrats',
                                                        'Finger Print Match.' + user.firstname + ' ' + user.lastname,
                                                        'info'
                                                        );
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        deferred.resolve({data: {message: "userprofile success!"}});
                    }, function(response){
                        deferred.reject({data: {message: response}});
                    });
                    return deferred.promise;
                },
                Camera: function(){
                    var deferred = $q.defer();
                    Restangular.all("camera").getList($navigation.get()).then(function(data){
//                        if(vm.Cameras.length > 0){
//                            vm.Cameras.forEach(function(mapData){
//                                angular.isDefined(mapData.CameraTick)
//                                {
//                      Camera              $interval.cancel(mapData.CameraTick);
//                                }
//                            });
//                        }
                        vm.Cameras = data;
                        vm.Cameras.forEach(function(mapData){
                            if(mapData.pn_recog == "true"){
                                vm.pn_recog = mapData.ip_address;
                            }

                            mapData.url = "/weighsoft/backend/cam_pic.php?time=" + Math.floor(Math.random() * 1000000000) + "&pDelay=40000&ip=" + mapData.ip_address;
//                            mapData.CameraTick = $interval(function(){
//                                mapData.url = "/weighsoft/backend/cam_pic.php?time=" + Math.floor(Math.random() * 1000000000) + "&pDelay=40000&ip=" + mapData.ip_address;
//                            }, 2000);
                        });
                        deferred.resolve({data: {message: "Cameras Success!"}});
                    }, function(response){
                        deferred.reject({data: {message: response}});
                    });
                    return deferred.promise;
                },
            };
            vm.Fingerprint = function(){
                $rootScope.FingerFeedback = "StartVerification";
                vm.Functions.Users().then(function(){
                    $EMSOservice.DoVerification();
                    $rootScope.Loaded("Single grade on VerifyCtrl");
                }, function(response){
                    $rootScope.Error(response);
                });
            }

            function LoadData(){
                $rootScope.Start("vm.LoadData in VerifyCtrl");
                vm.formData = [];
                vm.HeaderSingle.status = 'CLOSED';
                vm.baseData.getList(vm.HeaderSingle).then(function(data){
                    //vm.Single = JSON.parse(JSON.stringify(EmptyObject));
                    data.forEach(d => {
                        d.index = data.indexOf(d);
                    });
                    vm.formData = data;
                    $rootScope.Loaded("vm.LoadData in VerifyCtrl");
                }, function(response){
                    $rootScope.Error(response);
                });
            }
            //TODO : Check single Comapny, site
            vm.SelectOnChange = function(type){
                switch(type){
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
                            $rootScope.Loaded("Single Site on VerifyCtrl");
                        }
                    });

                    break;
                case "site":
                    GetSites();

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
                                if (vm.SharedWorkstation !== 'Yes')
                                {
                                    LoadData();
                                }
                            }
                            $rootScope.Loaded("Single Workstation on VerifyCtrl");
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );

                    break;
                    case 'settings':
                        vm.Single.settings_id = vm.selected_settings.id;
                        var fprid = vm.Sites.findIndex((site) => site.value == vm.HeaderSingle.site_id);
                        if(fprid > -1 && vm.Sites[fprid].override_silo != null){
                            vm.Single.SiloOverride = vm.Sites[fprid].override_silo;
                        }

                        vm.Settings.forEach(function(setting){
                            if(vm.selected_settings.id == setting.id){
                                vm.Setting = setting;
                                vm.ReportData.Settings = setting.name;
                                vm.ReportData.Header = setting.custom_header_text;
                                vm.ReportData.HeaderImg = setting.display_custom_header_img;
                                vm.ReportData.Footer = setting.custom_footer_text;
                                vm.ReportData.FooterImg = setting.display_custom_footer_img;
                            }
                        });
                        LoadData();
                        break;
                    case 'weighbridge':
                        console.log('selected', vm.selected_weighbridge);
                        $navigation.Weighbridge(vm.selected_weighbridge.value);
                        break;
                    case 'haulier':
                        if(vm.Hauliers != undefined && vm.Hauliers.length > 0){
                            vm.Hauliers.forEach(function(haul){
                                if(vm.Single.haulier_id == haul.value){
                                    vm.ReportData.Hauliers = haul.report;
                                }
                            });
                        }
                        break;
                    case 'businesspartner':
                        if(vm.BusinessPartners != undefined && vm.BusinessPartners.length > 0){
                            vm.BusinessPartners.forEach(function(buzz){
                                if(vm.Single.businesspartner_id == buzz.value){
                                    vm.ReportData.BusinessPartners = buzz.report;
                                }
                            });
                        }
                        break;
                    case 'product':
                        if(vm.Products != undefined && vm.Products.length > 0){
                            vm.Products.forEach(function(product){
                                if(vm.Single.product_id == product.value){
                                    vm.ReportData.Products = product.report;
                                }
                            });
                        }
                        break;
                }
            };
            vm.getDatetime = null;
            vm.SetReportingData = function(data){
                console.log('VERIFY DATA', data);
                vm.ReportData.Settings = data.Setting.name;
//                vm.ReportData.Header = data.Setting.custom_header_text;
//                vm.ReportData.HeaderImg = data.Setting.display_custom_header_img;
//                vm.ReportData.Footer = data.Setting.custom_footer_text;
//                vm.ReportData.FooterImg = data.Setting.display_custom_footer_img;
                vm.Single.transaction = data.transaction;
                vm.Single.RegNumber = data.RegNumber;
                vm.Single.RegNumber2 = data.RegNumber2;
                vm.Single.RegNumber3 = data.RegNumber3;
                vm.Single.FirstWeight = Math.round(data.FirstWeight);
                vm.Single.SecondWeight = Math.round(data.SecondWeight);
                vm.Single.FirstDate = data.FirstWeight.created_at;
                vm.Single.SecondDate = data.SecondWeight.created_at;
                vm.ReportData.BusinessPartners = vm.selected_businessPartner != undefined ? vm.selected_businessPartner.report : null;
                vm.ReportData.Hauliers = vm.selected_haulier != undefined ? vm.selected_haulier.report : null;
                vm.ReportData.Products = vm.selected_product != undefined ? vm.selected_product.report : null;
                if (data.FirstUser) {
                    vm.Single.FirstUser = data.FirstUser;
                }
                if (data.user_name) {
                    vm.Single.user_name = data.user_name;
                }
            }
            
            vm.save = function(){
                $rootScope.Start("vm.LoadData in VerifyCtrl");
                vm.Single.product_id = vm.selected_product ? vm.selected_product.value : vm.Single.product_id;
                //vm.Single.SiloOverride = vm.SiloOverride;
                var today = new Date();
                vm.getDatetime = (today.getFullYear()) + '-' +
                        ((today.getMonth() + 1) < 10 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1)) + '-' +
                        (today.getDate() < 10 ? '0' + today.getDate() : today.getDate()) + ' ' +
                        (today.getHours() < 10 ? '0' + today.getHours() : today.getHours()) + ':' +
                        (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes()) + ':' +
                        (today.getSeconds() < 10 ? '0' + today.getSeconds() : today.getSeconds());
                var Error = "";
                if(vm.Setting.use_product_list == 'Yes' && (typeof (vm.Single.product_id) === "undefined" || vm.Single.product_id == null)){
                    Error = Error + 'Please select Product. \n';
                }
                if(Error != ""){
                    swal(
                            'Oops...',
                            Error,
                            'error'
                            );
                    $rootScope.Loaded("Single Site on VerifyCtrl");
                    return;
                }

                if(vm.Cameras.length > 0){
                    vm.Cameras.forEach(function(mapData){
                        var elem = document.getElementById(mapData.name);
                        if(elem != null)
                            mapData.base64 = elem.toDataURL().replace("image/png", "image/octet-stream");
                        else
                            mapData.base64 = "";
                        mapData.isnpr = (mapData.pn_recog == "true" ? "Yes" : "No");
                        mapData.weighing_transaction_id = "";
                        mapData.site_id = vm.HeaderSingle.site_id;
                        mapData.company_id = vm.HeaderSingle.company_id;
                        angular.isDefined(mapData.CameraTick)
                        {
                            $interval.cancel(mapData.CameraTick);
                        }
                    });
                }
                console.log('CAMERA ENABLED', vm.Setting.use_cameras);
                if(vm.Setting.use_cameras === 'Yes') {
                    vm.Single.Cameras = vm.Cameras;
                }
                if(!vm.Single.$valid){
                    if(typeof vm.Single.id === 'undefined'){
                        vm.Single.WeightTotal = vm.Single.FirstWeight;
                        vm.Single.company_id = vm.HeaderSingle.company_id;
                        vm.Single.site_id = vm.HeaderSingle.site_id;
                        vm.Single.workstation_id = vm.HeaderSingle.workstation_id;
                        Restangular.all("weighingheaders").post(vm.Single).then(function(data){
                            LoadData();
                        }, function(response){
                            $rootScope.Error(response);
                        });
                    }else{
                        vm.Single.WeightTotal = vm.Single.SecondWeight;
                        vm.Single.company_id = vm.HeaderSingle.company_id;
                        vm.Single.site_id = vm.HeaderSingle.site_id;
                        vm.Single.workstation_id = vm.HeaderSingle.workstation_id;
                        console.log('SAVE SINGLE', vm.Single);
                        vm.Single.save().then(function(data){
                            console.log('SAVE DATA', data);
                            LoadData();
                        }, function(response){
                            $rootScope.Error(response);
                        });
                    }
                    vm.FormDisplay = false;
                }
            };
            vm.cancel = function(){
                $EMSOservice.dispose($rootScope.WeighBridge.port_num);
                vm.ScannedUser = null;
                var getType = {};
                if(getType.toString.call($rootScope.weightwatch) === '[object Function]'){
                    $rootScope.weightwatch();
                }
                if(getType.toString.call(vm.listener) === '[object Function]'){
                    vm.listener();
                }
                if(getType.toString.call(vm.finger) === '[object Function]'){
                    vm.finger();
                }
                vm.FormDisplay = false;
                vm.deleteFormDisplay = false;
            };
            vm.editForm = function(data){
                console.log('Verify Data',data);
                $rootScope.Start("vm.editForm in VerifyCtrl");
                $rootScope.AxelSetups = {
                    Items: [],
                    Selected: null
                }
                $Functions.Weighbridges().then(function(weighbridgeList){
                    console.log(weighbridgeList);
                    vm.Weighbridges = weighbridgeList;
                    $Functions.Product().then(function(products){
                        vm.Products = products;
                        $Functions.BusinessPartner().then(function(businessPartners){
                            vm.BusinessPartners = businessPartners;
                            $Functions.Haulier().then(function(haulier){
                                vm.Hauliers = haulier;
                                $Functions.Settings().then(function(settings){
                                    vm.Settings = settings;
                                    console.log('SETTINGS', vm.Settings);

                                    vm.ScannedUser = null;
                                    $scope.Service = Restangular.one(routeName, data.id);
                                    $scope.Service.customGET("", vm.HeaderSingle).then(function(dat){
                                        vm.FormDisplay = true;
                                        vm.ReadOnly = true;
                                        //vm.siloSaveFlag = (vm.SiloOverride != "Yes");
                                        vm.Single = dat;
                                        vm.Single.NumberplateVerify = "warning";
                                        vm.Single.SiloOverride = "No";
                                        vm.Single.FirstWeight = Math.round(vm.Single.FirstWeight, 0);
                                        var First = vm.Single.weighingLines.find(p => p.Status == "1");
                                        var firstNameFromLine = First !== undefined && First.user_name ? First.user_name : null;
                                        vm.Single.FirstUser = firstNameFromLine || vm.Single.FirstUser || null;
                                        var Verify = vm.Single.weighingLines.find(p => p.Status == "V");
                                        vm.Single.VerifyUser = Verify !== undefined ? Verify.user_name : null;
                                        var Second = vm.Single.weighingLines.find(p => p.Status == "2");
                                        var secondNameFromLine = Second !== undefined && Second.user_name ? Second.user_name : null;
                                        vm.Single.user_name = secondNameFromLine || vm.Single.user_name || null;
                                        if(vm.Settings.tares_enabled === 'true') {
                                            vm.Single.actiontype = 'CLOSED';
                                        } else {
                                            vm.Single.actiontype = 'Verify';
                                        }
                                        vm.selected_settings = vm.Settings.find((settings) => settings.id == vm.Single.settings_id);
                                        vm.selected_weighbridge = vm.Weighbridges.find((weighbridge) => weighbridge.value == vm.Single.weighbridge_id);
                                        vm.selected_product = vm.Products.find((product) => product.value == vm.Single.product_id);
                                        console.log('SELECTED PRODUCT', vm.selected_product)
                                        vm.SelectOnChange('product');
                                        vm.selected_businessPartner = vm.BusinessPartners.find((business) => business.value == vm.Single.businesspartner_id);
                                        vm.SelectOnChange('businesspartner');
                                        vm.selected_haulier = vm.Hauliers.find((haul) => haul.value == vm.Single.haulier_id);
                                        vm.SelectOnChange('haulier');

                                        vm.SelectOnChange('settings');
                                        vm.SelectOnChange('weighbridge');

                                        $rootScope.Loaded("Complete");
                                    }, function(response){
                                        $rootScope.Error(response);
                                    });

                                });
                            });
                        });
                    });
                });




            }

            vm.deleteForm = function(data){
                vm.deleteFormDisplay = true;
                vm.ScannedUser = null;
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
            }

            vm.delete = function(data){
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

                $Functions.Users().then(function(user){
                    vm.exception = {
                        code: "TRANSACTION DELETED",
                        description: "Transaction " + vm.Single.transaction + " deleted by " + user.firstname + " " + user.lastname,
                        jsondata: JSON.stringify({transaction_id: vm.Single.transaction, user_id: user.id}),
                        comment: vm.deleteReason,
                        weighbridge_id: vm.Single.weighbridge_id,
                        workstation_id: vm.Single.workstation_id,
                        company_id: vm.Single.company_id,
                        site_id: vm.Single.site_id,
                    }
                    $Exceptions.set(vm.exception).then(function(){
                        console.log("success");
                    })
                })
            }

            $rootScope.WeighingSystem = {
                On: null,
                Weight: null
            }
            vm.initialize = function(){
                $navigation.clear();
                $Functions.Users().then(function(user){
                    vm.User = user;
                    vm.UserLevel = user.role.id;
                    GetCompanies();

                    $rootScope.AxelDisplay = "hidden";
                    //LoadData();
                });
            };

        });
