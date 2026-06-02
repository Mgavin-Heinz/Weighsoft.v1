'use strict';
angular
        .module('xenon.controllers')
        .controller('CompaniesCtrl', function($scope, $rootScope, $state, Restangular, FileUploader){
            $rootScope.Start();
            const vm = this;
            var routeName = 'company';

            vm.baseData = Restangular.all(routeName);

            vm.isEditing = false;

            function loadData(){
                $rootScope.Start();
                vm.baseData.getList().then(function(companyList){
                    vm.companyList = companyList;
                    $rootScope.Loaded();
                }, function(response){
                    $rootScope.Error(response);
                });
            };

            vm.showAddForm = function(){
                vm.isEditing = true;
                vm.companyInfo = {};
                vm.ImageUploaderSet();
            };

            vm.ImageUploaderSet = function () {
                vm.uploadImageAsBase64 = function (file) {
                    const reader = new FileReader();
                    reader.onloadend = function () {
                        const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
                        vm.companyInfo.display_custom_logo_img = base64String;
                        console.log('Base64 Image:', base64String);
                    };
                    reader.readAsDataURL(file);
                };
            };

            vm.removeLogo = function () {
                vm.companyInfo.display_custom_logo_img = "";
            };
            
            vm.showEditForm = function (company) {
                $rootScope.Start();
                Restangular.one(routeName, company.id).get().then(function (companyInfo) {
                    vm.companyInfo = companyInfo;
                    console.log("COMPANYINFO EDIT", companyInfo);
                    vm.isEditing = true;
                    vm.ImageUploaderSet();
                    $rootScope.Loaded();
                }, function (response) {
                    vm.isEditing = false;
                    $rootScope.Error(response);
                });
            };
            
            vm.saveForm = function (formData) {
                if (!formData.$valid) {
                    return;
                }
            
                $rootScope.Start();
                console.log('COMPANY INFO', vm.companyInfo);
            
                var promise;
                if (typeof vm.companyInfo.id === 'undefined') {
                    promise = vm.baseData.post(vm.companyInfo);
                } else {
                    promise = vm.companyInfo.save();
                }
            
                promise.then(function () {
                    vm.isEditing = false;
                    loadData();
                }, function (response) {
                    $rootScope.Error(response);
                });
            };

            vm.deleteCompany = function(company){
                vm.isEditing = false;
                if(!confirm('Are you sure you want to delete the company?')){
                    return;
                }
                $rootScope.Start();
                Restangular.one(routeName, company.id).get().then(function(companyInfo){
                    companyInfo.remove().then(function(){
                        loadData();
                    }, function(response){
                        $rootScope.Error(response);
                    });
                });
            }

            vm.cancel = function () {
                vm.isEditing = false;
            };

            vm.initialize = function(){
                loadData();
            };
        });
