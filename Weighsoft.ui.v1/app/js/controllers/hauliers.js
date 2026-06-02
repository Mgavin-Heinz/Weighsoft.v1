'use strict';
angular
        .module('xenon.controllers')
        .controller('HauliersCtrl', function($scope, $navigation, $rootScope, $q, $Functions, Restangular){
            $rootScope.Start();
            var vm = this;
            var routeName = 'haulier';
            var ObjectProperties = {
                company_id: {
                    type: "number", title: "Company", description: ""
                },
                site_id: {
                    type: "number", title: "Site", description: ""
                },
                code: {type: "string", title: "Code", description: ""},
                name: {type: "string", title: "Name", description: ""},
                business_partner_id: {type: "number", title: "Business Partner", description: ""}
            };
            var EmptyObject = {company_id: "", code: "", name: "", actiontype: "New"};
            vm.load = function(){
                vm.hasData = false;
                vm.FormDisplay = false;
                vm.Single = {};
                vm.Companies = [];
                vm.Sites = [];
                vm.BusinessPartners = [];
                vm.HeaderSingle = {
                    company_id: null,
                    site_id: null,
                };
                vm.schema = {
                    type: "object",
                    properties: ObjectProperties
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
                                    vm.getData('Hauliers');
                                }
                                $rootScope.Loaded("Single Site on HauliersCtrl");
                            }, function(response){
                                $rootScope.Error(response);
                            });
                            break;
                        case 'businesspartners':
                            $navigation.Site(vm.HeaderSingle.site_id);
                            return $Functions.BusinessPartner().then(function(BusinessPartners){
                                vm.BusinessPartners = BusinessPartners;
                                $rootScope.Loaded("Business Partners loaded");
                                return BusinessPartners;
                            }, function(response){
                                $rootScope.Error(response);
                                throw response;
                            });
                            break;
                        case 'Hauliers':
                            $navigation.Site(vm.HeaderSingle.site_id);
                            $Functions.Haulier().then(function(Hauliers){
                                vm.formData = Hauliers;
                                vm.hasData = (Hauliers.length > 0);
                                $rootScope.Loaded("Single Site on Hauliers");
                            }, function(response){
                                $rootScope.Error(response);
                            });
                            break;
                    }
                }
                vm.baseData = Restangular.all(routeName);
                vm.LoadData = function(){

                    $navigation.clear();
                    $Functions.Users().then(function(user){
                        vm.User = user;
                        vm.getData('company');
                        if(vm.HeaderSingle.company_id !== null){
                            vm.getData('site');
                        }
                        if(vm.HeaderSingle.site_id !== null){
                            vm.getData('businesspartners');
                            vm.getData('Hauliers');
                        }
                        $navigation.clear();
                        vm.Single = null;
                        vm.FormDisplay = false;
                        $rootScope.Loaded();
                    });
                };
                vm.LoadData();
                vm.Single = null;
                vm.addForm = function(){
                    console.log('[Hauliers] addForm called');
                    console.log('[Hauliers] BusinessPartners count:', vm.BusinessPartners ? vm.BusinessPartners.length : 0);
                    
                    // Hide linked vehicles for add form
                    vm.ShowLinkedVehicles = false;
                    vm.LinkedVehicles = [];
                    
                    // Ensure Business Partners are loaded before building form
                    if (!vm.BusinessPartners || vm.BusinessPartners.length === 0) {
                        console.log('[Hauliers] Business Partners not loaded, loading now...');
                        $rootScope.Start();
                        vm.getData('businesspartners').then(function() {
                            console.log('[Hauliers] Business Partners loaded:', vm.BusinessPartners.length);
                            vm.buildForm();
                            vm.FormDisplay = true;
                            vm.Single = JSON.parse(JSON.stringify(EmptyObject));
                            $rootScope.Loaded();
                        });
                    } else {
                        vm.buildForm();
                        vm.FormDisplay = true;
                        vm.Single = JSON.parse(JSON.stringify(EmptyObject));
                    }
                };
                vm.save = function(data){
                    $rootScope.Start();
                    if(!data.$valid){
                        return;
                    }
                    if(vm.Single.actiontype !== null && vm.Single.actiontype === "New"){
                        vm.Single.company_id = vm.HeaderSingle.company_id;
                        vm.Single.site_id = vm.HeaderSingle.site_id;

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
                };
                vm.cancel = function(){
                    vm.FormDisplay = false;
                };
                vm.editForm = function(data){
                    console.log('[Hauliers] editForm called for:', data.name);
                    console.log('[Hauliers] BusinessPartners count:', vm.BusinessPartners ? vm.BusinessPartners.length : 0);
                    
                    $rootScope.Start();
                    
                    // Ensure Business Partners are loaded before building form
                    var loadBusinessPartnersPromise;
                    if (!vm.BusinessPartners || vm.BusinessPartners.length === 0) {
                        console.log('[Hauliers] Business Partners not loaded, loading now...');
                        loadBusinessPartnersPromise = vm.getData('businesspartners');
                    } else {
                        // Already loaded, create a resolved promise
                        loadBusinessPartnersPromise = $q.when(vm.BusinessPartners);
                    }
                    
                    // Wait for both Business Partners and Haulier data
                    loadBusinessPartnersPromise.then(function() {
                        console.log('[Hauliers] Business Partners ready:', vm.BusinessPartners.length);
                        return Restangular.one(routeName, data.id).get();
                    }).then(function(dat){
                        vm.Single = dat;
                        
                        // Store linked vehicles for display (read-only)
                        vm.LinkedVehicles = dat.linked_vehicles || [];
                        vm.ShowLinkedVehicles = dat.company_smart_hauliers && vm.LinkedVehicles.length > 0;
                        
                        vm.buildForm();  // Rebuild form with loaded Business Partners
                        vm.FormDisplay = true;
                        $rootScope.Loaded();
                    }, function(response){
                        $rootScope.Error(response);
                    });
                };
                vm.delete = function(data){
                    if(window.confirm("Are you sure?")){
                        $rootScope.Start();
                        Restangular.one(routeName, data.id).get().then(function(dat){
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
                    vm.LoadData();
                };
                vm.changeSiteID = function(){
                    $navigation.Site(vm.HeaderSingle.site_id);
                    vm.LoadData();
                };
                vm.buildForm = function(){
                    console.log('[Hauliers] buildForm called');
                    console.log('[Hauliers] Building form with', vm.BusinessPartners.length, 'Business Partners');
                    vm.form = [
                        "code",
                        "name",
                        {
                            "key": "business_partner_id",
                            "type": "select",
                            "titleMap": vm.BusinessPartners
                        },
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
            };
        });
