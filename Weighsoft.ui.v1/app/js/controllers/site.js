'use strict';
angular
        .module('xenon.controllers')
        .controller('SiteCtrl', function($scope, $rootScope, $navigation, $Functions, Restangular, $q){
            $rootScope.Start('SiteCtrl');
            var vm = this;
            var routeName = 'site';

            vm.baseData = Restangular.all(routeName);

            vm.companyList = [];
            vm.siteList = [];

            vm.isEditing = false;
            vm.HeaderSingle = {
                company_id: null,
            };

            vm.MeasureTypes = [
                { value: "kg", text: "Kilograms" },
                { value: "t", text: "Tons" },
                { value: "mt", text: "Metric Tons" },
                { value: "g", text: "Grams" },
            ];
            vm.DeductFlow = [
                { value: "default", text: "Subtract both from Gross" },
                { value: "moisture", text: "Subtract Moisture from Gross, then Handling" },
                { value: "handling", text: "Subtract Handling from Gross, then Moisture" },
            ];
            function loadData(){
                $rootScope.Start();
                $navigation.clear();
                $Functions.Users().then(function(user){

                    var navInfo = $navigation.get();
                    if(navInfo.company_id !== null){
                        vm.HeaderSingle.company_id = navInfo.company_id;
                    }

                    $q.all([
                        $Functions.Company(),
                        vm.baseData.getList({company_id: vm.HeaderSingle.company_id}),
                    ]).then(function(responses){
                        vm.companyList = responses[0];
                        if(vm.companyList.length === 1){
                            vm.HeaderSingle.company_id = vm.companyList[0].value;
                        }
                        if(vm.HeaderSingle.company_id != null)
                            vm.siteList = responses[1];

                        $rootScope.Loaded();
                    }, function(responses){

                        $rootScope.Error(responses);
                    });

                });
            };

            vm.showAddForm = function(){
                if(!vm.HeaderSingle.company_id){
                    return;
                }

                vm.isEditing = true;

                vm.siteInfo = {
                    company_id: parseInt(vm.HeaderSingle.company_id),
                };
            };

            vm.showEditForm = function(site){
                $rootScope.Start();
                Restangular.one(routeName, site.id).get().then(function(siteInfo){
                    vm.siteInfo = siteInfo;
                    vm.isEditing = true;
                    $rootScope.Loaded("All on HeadCtrl");
                }, function(response){
                    vm.isEditing = false;
                    $rootScope.Error(response);
                });
            };

            vm.saveForm = function(){
                $rootScope.Start();

                var promise;
                if(typeof vm.siteInfo.id === 'undefined'){
                    promise = vm.baseData.post(vm.siteInfo);
                }else{
                    promise = vm.siteInfo.save();
                }

                promise.then(function(){
                    vm.isEditing = false;
                    loadData();
                }, function(response){
                    $rootScope.Error(response);
                });
            };
            vm.cancel = function () {
                $rootScope.Start();
                    vm.isEditing = false;
                    loadData();
            };

            vm.deleteSite = function(site){
                vm.isEditing = false;

                if(!confirm('Are you sure you want to delete the site?')){
                    return;
                }

                $rootScope.Start();
                Restangular.one(routeName, site.id).get().then(function(siteInfo){
                    siteInfo.remove().then(function(){
                        $Functions.Users().then(function(user){
                            loadData();
                        });
                    }, function(response){
                        $rootScope.Error(response);
                    });
                });
            };

            vm.changeCompanyID = function(){
                $navigation.Company(vm.HeaderSingle.company_id);
                loadData();
            };

            vm.initialize = function(){
                loadData();
            };
        });
