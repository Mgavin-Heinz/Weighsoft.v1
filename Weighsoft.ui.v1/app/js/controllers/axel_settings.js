'use strict';
angular
        .module('xenon.controllers')
        .controller('AxelSettingsCtrl', function($scope, $rootScope, $navigation, Restangular, $q, DTOptionsBuilder){
            $rootScope.Start("init on AxelSettingsCtrl");
            var vm = this;
            var routeName = 'axletypes';
            vm.HeaderSingle = {
                company_id: null,
            };
            vm.Companies = [];
            var SystemAxelProperties = {
                company_id: {
                    type: "number", title: "Company", description: ""
                },
                Single_Steering: {type: "number", title: "Single Steering", description: ""},
                Double_Steering: {type: "number", title: "Double Steering", description: ""},
                Triple_Steering: {type: "number", title: "Triple Steering", description: ""},
                Single_Non_Steering: {type: "string", title: "Single Non Steering", description: ""},
                Double_Non_Steering: {type: "string", title: "Double Non Steering", description: ""},
                Triple_Non_Steering: {type: "string", title: "Triple Non Steering", description: ""},
                Double_Single_Non_Steering: {type: "string", title: "Double_Single Non Steering", description: ""},
                Double_Double_Non_Steering: {type: "string", title: "Double_Double Non Steering", description: ""},
                Double_Triple_Non_Steering: {type: "string", title: "Double_Triple Non Steering", description: ""},
                Custom_1: {type: "number", title: "Single Steering", description: ""},
                Custom_2: {type: "number", title: "Single Steering", description: ""},
                Custom_3: {type: "number", title: "Single Steering", description: ""}
            };
            var ObjectProperties = {
                company_id: {
                    type: "number", title: "Company", description: ""
                },
                steering: {type: "string", title: "Steering Axel", description: "", enum: ["", "Single_Steering",
                        "Double_Steering", "Triple_Steering", "Single_Non_Steering", "Double_Non_Steering", "Triple_Non_Steering", "Custom_1",
                        "Custom_2", "Custom_3"]},
                axel_1: {type: "string", title: "1st Axel", description: "", enum: ["", "Single_Steering",
                        "Double_Steering", "Triple_Steering", "Single_Non_Steering", "Double_Non_Steering", "Triple_Non_Steering", "Custom_1",
                        "Custom_2", "Custom_3"]},
                axel_2: {type: "string", title: "1st Axel", description: "", enum: ["", "Single_Steering",
                        "Double_Steering", "Triple_Steering", "Single_Non_Steering", "Double_Non_Steering", "Triple_Non_Steering", "Custom_1",
                        "Custom_2", "Custom_3"]},
                axel_3: {type: "string", title: "1st Axel", description: "", enum: ["", "Single_Steering",
                        "Double_Steering", "Triple_Steering", "Single_Non_Steering", "Double_Non_Steering", "Triple_Non_Steering", "Custom_1",
                        "Custom_2", "Custom_3"]},
                axel_4: {type: "string", title: "1st Axel", description: "", enum: ["", "Single_Steering",
                        "Double_Steering", "Triple_Steering", "Single_Non_Steering", "Double_Non_Steering", "Triple_Non_Steering", "Custom_1",
                        "Custom_2", "Custom_3"]}
            };
            var EmptySystemAxelObject = {company_id: "", Single_Steering: 0, Double_Steering: 0, Triple_Steering: 0,
                Single_Non_Steering: 0, Double_Non_Steering: 0, Triple_Non_Steering: 0, Custom_1: 0,
                Custom_2: 0, Custom_3: 0 , actiontype: "New"};
            var EmptyAxelObject = {company_id: "", name: "",
                steering: "", steering_max: 0,
                axel_1: "", axel_1_max: 0,
                axel_2: "", axel_2_max: 0,
                axel_3: "", axel_3_max: 0,
                axel_4: "", axel_4_max: 0,
                vehicle_max: 0, axel_sum: 0,
                actiontype: "New"};
            vm.SelectOnChange = function(type){
                if(type === 'company'){
                    EmptyAxelObject.company_id = vm.HeaderSingle.company_id;
                    vm.LoadData();
                    vm.LoadSetupData();
                }
            };
            vm.SysAxelSchema = {
                type: "object",
                properties: SystemAxelProperties
            };
            vm.AxelSchema = {
                type: "object",
                properties: ObjectProperties
            };
            vm.load = function(){
                vm.Functions = {
                    Company: function(){
                        var deferred = $q.defer();
                        Restangular.all("company").getList(EmptyAxelObject).then(function(data){
                            data.forEach(function(mapData){
                                vm.Companies.push({
                                    value: mapData.id,
                                    name: mapData.registered_name + ' (' + mapData.code + ')'
                                });
                            });
                            deferred.resolve({data: {message: "Company Success!"}});
                        }, function(response){
                            deferred.reject({data: {message: response}});
                        });
                        return deferred.promise;
                    },
                    All: function(){

                        $navigation.clear();

                        var navInfo = $navigation.get();

                        if(navInfo.company_id !== null){
                            vm.HeaderSingle.company_id = navInfo.company_id;
                        }
                        ;

                        $rootScope.Start("All on SettingsCtrl");
                        vm.Functions.Company().then(function(value){
                            $rootScope.Loaded("All on SettingsCtrl");
                        }, function(response){
                            $rootScope.Error(response);
                        });
                    },
                    Single: function(type){
                        $rootScope.Start();
                        if(type === 'company'){
                            vm.Functions.Company().then(function(value){
                                $rootScope.Loaded();
                            }, function(response){
                                $rootScope.Error(response);
                            });
                        }
                    }
                };
                vm.Functions.All();
                vm.baseData = Restangular.all(routeName);
                vm.setupBaseData = Restangular.all("axelsetup");
                vm.LoadData = function(){
                    $rootScope.Start("vm.LoadData on AxelSettingsCtrl");
                    vm.hasData = true;
                    vm.FormDisplay = true;
                    vm.baseData.getList(EmptyAxelObject).then(function(data){
                        if(data[0] === undefined){
                            vm.SysAxelSingle = JSON.parse(JSON.stringify(EmptySystemAxelObject));
                        }else{
                            vm.SysAxelSingle = data[0];
                            vm.SysAxelSingle.Single_Steering = parseInt(vm.SysAxelSingle.Single_Steering);
                            vm.SysAxelSingle.Double_Steering = parseInt(vm.SysAxelSingle.Double_Steering);
                            vm.SysAxelSingle.Triple_Steering = parseInt(vm.SysAxelSingle.Triple_Steering);
                            vm.SysAxelSingle.Single_Non_Steering = parseInt(vm.SysAxelSingle.Single_Non_Steering);
                            vm.SysAxelSingle.Double_Non_Steering = parseInt(vm.SysAxelSingle.Double_Non_Steering);
                            vm.SysAxelSingle.Triple_Non_Steering = parseInt(vm.SysAxelSingle.Triple_Non_Steering);
                            vm.SysAxelSingle.Double_Single_Non_Steering = parseInt(vm.SysAxelSingle.Double_Single_Non_Steering);
                            vm.SysAxelSingle.Double_Double_Non_Steering = parseInt(vm.SysAxelSingle.Double_Double_Non_Steering);
                            vm.SysAxelSingle.Double_Triple_Non_Steering = parseInt(vm.SysAxelSingle.Double_Triple_Non_Steering);
                            vm.SysAxelSingle.Custom_1 = parseInt(vm.SysAxelSingle.Custom_1);
                            vm.SysAxelSingle.Custom_2 = parseInt(vm.SysAxelSingle.Custom_2);
                            vm.SysAxelSingle.Custom_3 = parseInt(vm.SysAxelSingle.Custom_3);

                            vm.SysAxelSingle.actiontype = 'Edit';
                        }
                        $rootScope.Loaded("vm.LoadData on SettingsCtrl");
                    }, function(response){
                        $rootScope.Error(response);
                    });
                };
                vm.LoadSetupData = function(){
                    $rootScope.Start("vm.LoadData on AxelSettingsCtrl");
                    vm.setupBaseData.getList(EmptyAxelObject).then(function(data){
                        if(data[0] === undefined){
                            vm.SysSetupData = [];
                        }else{
                            vm.SysSetupData = data;
                        }
                        vm.Forms.SetupTypes = false;
                        vm.Forms.SetupAdd = false;
                        vm.Forms.SetupList = true;
                        $rootScope.Loaded("vm.LoadData on SettingsCtrl");
                    }, function(response){
                        $rootScope.Error(response);
                    });
                };
                //vm.LoadSetupData();
                vm.SysAxelSingle = null;
                vm.LoadingAxle = null;
                vm.Forms = {
                    SetupTypes: false,
                    SetupAdd: false,
                    SetupList: true
                };
                
                vm.dtOptions = DTOptionsBuilder.fromFnPromise(function(){
                    return rWarehouse.query().$promise;
                }).withOption('responsive', true);
;
                vm.AxelSetupOptions = {
                    DeleteSetups: function(data){
                        data.remove().then(function(){
                            vm.LoadSetupData("vm.save on SettingsCtrl");
                        }, function(response){
                            $rootScope.Error(response);
                        });
                    },
                    UpdateSetups: function(data){
                        vm.LoadingAxle = data;
                        vm.Forms.SetupTypes = false;
                        vm.Forms.SetupAdd = true;
                        vm.Forms.SetupList = false;
                        vm.LoadingAxle.save().then(function(){
                            vm.LoadSetupData("vm.save on SettingsCtrl");
                        }, function(response){
                            $rootScope.Error(response);
                        });
                    },
                    SaveSetups: function(data){
                        $rootScope.Start("vm.save on SettingsCtrl");
                        if(vm.LoadingAxle.actiontype !== null && vm.LoadingAxle.actiontype === "New"){
                            vm.setupBaseData.post(vm.LoadingAxle).then(function(){
                                vm.LoadSetupData("vm.save on SettingsCtrl");
                            }, function(response){
                                $rootScope.Error(response);
                            });
                        }else{
                            vm.LoadingAxle.save().then(function(){
                                vm.LoadSetupData("vm.save on SettingsCtrl");
                            }, function(response){
                                $rootScope.Error(response);
                            });
                        }

                    }
                }
                vm.DisplayForms = function(val){
                    switch(val){
                        case 'Setups':
                            vm.Forms.SetupTypes = false;
                            vm.Forms.SetupAdd = false;
                            vm.Forms.SetupList = true;
                            break;
                        case 'Add':
                            vm.LoadingAxle = JSON.parse(JSON.stringify(EmptyAxelObject));
                            vm.Forms.SetupTypes = false;
                            vm.Forms.SetupAdd = true;
                            vm.Forms.SetupList = false;
                            break;
                        case 'Types':
                            vm.Forms.SetupTypes = true;
                            vm.Forms.SetupAdd = false;
                            vm.Forms.SetupList = false;
                            break;
                        case 'SaveNew':
                            vm.AxelSetupOptions.SaveSetups(vm.LoadingAxle);
                            break;
                        case 'Cancel':
                            vm.Forms.SetupTypes = false;
                            vm.Forms.SetupAdd = false;
                            vm.Forms.SetupList = true;
                            break;
                    }
                }
                vm.next = function(data){

                }

                vm.LoadingChange = function(num){
                    switch(num){
                        case 1:
                            vm.LoadingAxle.steering_max = eval("vm.SysAxelSingle." + vm.LoadingAxle.steering);
                            break;
                        case 2:
                            vm.LoadingAxle.axel_1_max = eval("vm.SysAxelSingle." + vm.LoadingAxle.axel_1);
                            break;
                        case 3:
                            vm.LoadingAxle.axel_2_max = eval("vm.SysAxelSingle." + vm.LoadingAxle.axel_2);
                            break;
                        case 4:
                            vm.LoadingAxle.axel_3_max = eval("vm.SysAxelSingle." + vm.LoadingAxle.axel_3);
                            break;
                        case 5:
                            vm.LoadingAxle.axel_4_max = eval("vm.SysAxelSingle." + vm.LoadingAxle.axel_4);
                            break;
                    }
                    vm.LoadingAxle.axel_sum = parseInt(vm.LoadingAxle.steering_max) + parseInt(vm.LoadingAxle.axel_1_max) +
                            parseInt(vm.LoadingAxle.axel_2_max) + parseInt(vm.LoadingAxle.axel_3_max) + parseInt(vm.LoadingAxle.axel_4_max);
                }
                vm.save = function(data){
                    $rootScope.Start("vm.save on SettingsCtrl");
                    if(data.$valid){
                        if(vm.SysAxelSingle.actiontype !== null && vm.SysAxelSingle.actiontype === "New"){
                            vm.SysAxelSingle.company_id = vm.HeaderSingle.company_id;
                            vm.baseData.post(vm.SysAxelSingle).then(function(){
                                vm.LoadData("vm.save on SettingsCtrl");
                            }, function(response){
                                $rootScope.Error(response);
                            });
                        }else{
                            vm.SysAxelSingle.save().then(function(){
                                vm.LoadData();
                            }, function(response){
                                $rootScope.Error(response);
                            });
                        }
                    }
                };

                vm.changeCompanyID = function(){
                    $navigation.Company(vm.HeaderSingle.company_id);
                    EmptyAxelObject.company_id = vm.HeaderSingle.company_id;
                    vm.LoadData();
                    vm.LoadSetupData();
                }
            };
            vm.SysAxelform = [
                {
                    "type": "section",
                    "htmlClass": "row",
                    "items": [
                        {type: 'submit', icon: 'glyphicon glyphicon-save', "htmlClass": "col-xs-6", style: 'btn-black', title: 'Save'},
                        {type: 'button', icon: 'glyphicon glyphicon-icon-exclamation-sign', "htmlClass": "col-xs-6", style: 'btn-danger pull-right', title: 'Cancel', onClick: function(){
                                vm.cancel();
                            }}
                    ]
                }
            ];
        });
