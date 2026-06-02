'use strict';
angular
        .module('xenon.controllers')
        .controller('BusinessPartnersCtrl', function($scope, $rootScope, $navigation, $Functions, Restangular, $q, DTOptionsBuilder){
            $rootScope.Start();
            var vm = this;
            vm.siteList = [];
            var routeName = 'businesspartner';
            var ObjectProperties = {
                company_id: {
                    type: "string", title: "Company", description: ""
                },
                site_id: {
                    type: "string", title: "Site", description: ""
                },
                code: {type: "string", title: "Code", description: ""},
                name: {type: "string", title: "Name", description: ""},
                vat_nr: {type: "string", title: "VAT No", description: ""},
                street: {type: "string", title: "Street", description: ""},
                suburb: {type: "string", title: "Suburb", description: ""},
                city: {type: "string", title: "City", description: ""},
                postal_code: {type: "string", title: "Postal Code", description: ""}
            };
            var EmptyObject = {company_id: "", site_id: "", code: "", name: "", actiontype: "New"};
            vm.dtOptions = DTOptionsBuilder.newOptions().withButtons(['csv', 'colvis']);

            vm.load = function(){
                vm.hasData = false;
                vm.FormDisplay = false;
                vm.Single = {};
                vm.Companies = [];
                vm.Sites = [];
                vm.HeaderSingle = {
                    company_id: null,
                    site_id: null,
                };
                vm.schema = {
                    type: "object",
                    properties: ObjectProperties
                };
                vm.baseData = Restangular.all(routeName);
                vm.changeFilter = function(type){
                    switch(type){
                        case 'company':
                            vm.siteList = [];
                            vm.workstationList = [];
                            vm.weighbridgeList = [];
                            vm.cameraList = [];
                            vm.getData('site');
                            break;
                        case 'site':
                            vm.workstationList = [];
                            vm.weighbridgeList = [];
                            vm.cameraList = [];
                            vm.getData('BusinessPartner');
                            break;
                    }
                };

                vm.getData = function(type){
                    switch(type){
                        case "company":
                            $Functions.Company().then(function(companyList){
                                vm.Companies = companyList;
                            });
                            break;
                        case "site":
                            $navigation.Company(vm.HeaderSingle.company_id);
                            $Functions.Site().then(function(siteList){
                                vm.Sites = siteList;
                                if(vm.Sites.length == 1){
                                    vm.HeaderSingle.site_id = vm.Sites[0].value;
                                    vm.getData('BusinessPartner');
                                }
                                $rootScope.Loaded("Single Site on BusinessPartnerCtrl");
                            }, function(response){
                                $rootScope.Error(response);
                            });
                            break;
                        case 'BusinessPartner':
                            $navigation.Site(vm.HeaderSingle.site_id);
                            $Functions.BusinessPartner().then(function(BusinessPartners){
                                vm.formData = BusinessPartners;
                                vm.hasData = (BusinessPartners.length > 0);
                                $rootScope.Loaded("Single Site on BusinessPartnerCtrl");
                            }, function(response){
                                $rootScope.Error(response);
                            });
                            break;
                    }
                }
                vm.LoadData = function(){
                    $navigation.clear();
                    if(vm.HeaderSingle.site_id !== null){
                        vm.getData('BusinessPartner');
                    }
                    $navigation.clear();
                    vm.Single = null;
                    vm.FormDisplay = false;
                    $rootScope.Loaded();

                };
                $navigation.clear();
                $Functions.Users().then(function(user){
                    vm.User = user;
                    vm.getData('company');
                    if($rootScope.Params.company_id !== null)
                        vm.getData('site');
                    vm.LoadData();
                });
                vm.Single = null;
                vm.addForm = function(){
                    if(!vm.HeaderSingle.company_id || !vm.HeaderSingle.site_id){
                        return;
                    }

                    vm.FormDisplay = true;
                    vm.ShowLinkedHauliers = false; // Hide for add form
                    vm.LinkedHauliers = [];

                    EmptyObject.company_id = parseInt(vm.HeaderSingle.company_id);
                    EmptyObject.site_id = parseInt(vm.HeaderSingle.site_id);

                    vm.Single = JSON.parse(JSON.stringify(EmptyObject));
                };
                vm.save = function(data){
                    $rootScope.Start();
                    if(data.$valid){
                        if(vm.Single.actiontype !== null && vm.Single.actiontype === "New"){
                            vm.baseData.post(vm.Single).then(function(){
                                vm.LoadData();
                            }, function(response){
                                $rootScope.Error(response);
                            });
                        }else{
                            vm.Single.save().then(function(){
                                vm.LoadData();
                            }, function(response){
                                $rootScope.Error(response);
                            });
                        }
                    }
                };
                vm.cancel = function(){
                    vm.FormDisplay = false;
                };
                vm.editForm = function(data){
                    $rootScope.Start();
                    Restangular.one(routeName, data.value).get().then(function(dat){
                        vm.Single = dat;
                        vm.FormDisplay = true;
                        
                        // Store linked hauliers for display (read-only)
                        vm.LinkedHauliers = dat.linked_hauliers || [];
                        vm.ShowLinkedHauliers = dat.company_smart_hauliers && vm.LinkedHauliers.length > 0;
                        
                        $rootScope.Loaded();
                    }, function(response){
                        $rootScope.Error(response);
                    });
                };
                vm.delete = function(data){
                    if(window.confirm("Are you sure?")){
                        $rootScope.Start();
                        Restangular.one(routeName, data.value).get().then(function(dat){
                            dat.remove().then(function(){
                                vm.LoadData();
                            }, function(response){
                                $rootScope.Error(response);
                            });
                        });
                    }
                    vm.FormDisplay = false;
                };

                vm.changeCompanyID = function(){
                    $navigation.Company(vm.HeaderSingle.company_id);
                    vm.getData('site');
                };

                vm.changeSiteID = function(){
                    $navigation.Site(vm.HeaderSingle.site_id);
                   vm.getData('BusinessPartner');
                };

                vm.form = [
                    "code",
                    "name",
                    "vat_nr",
                    "street",
                    "suburb",
                    "city",
                    "postal_code",
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
            };
        });
