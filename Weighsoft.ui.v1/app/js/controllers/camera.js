'use strict';
angular
        .module('xenon.controllers')
        .controller('CameraCtrl', function($scope, $rootScope, $stateParams, $navigation, $Functions, Restangular, $q){
            $rootScope.Start();
            // if(MyLocalStorage.getItem('user_info').business_partner == 'false'){
            //     $scope.businessPartner = false;
            // }else{
            //     $scope.businessPartner = true;
            // }
            $scope.Params = {
                Company: {},
            };

            var vm = this;
            var routeName = 'camera';
            vm.baseData = Restangular.all(routeName);

            vm.companyList = [];
            vm.siteList = [];
            vm.workstationList = [];
            vm.weighbridgeList = [];

            vm.HeaderSingle = {
                company_id: $stateParams.company_id,
                site_id: $stateParams.site_id,
                workstation_id: $stateParams.workstation_id,
                //weighbridge_id: $stateParams.weighbridge_id,
                company: $stateParams.company,
                site: $stateParams.site,
                workstation: $stateParams.workstation,
                //weighbridge: $stateParams.weighbridge
            };

            function loadData(){
                $navigation.clear();
                vm.isEditing = false;
                    vm.getData('camera');
            };

            vm.showAddForm = function(){
                vm.isEditing = true;
                vm.cameraInfo = {
                    company_id: parseInt(vm.HeaderSingle.company_id),
                    site_id: parseInt(vm.HeaderSingle.site_id),
                    workstation_id: parseInt(vm.HeaderSingle.workstation_id),
                    weighbridge_id: vm.HeaderSingle.weighbridge_id ? parseInt(vm.HeaderSingle.weighbridge_id) : null,
                    auth_type: 'none',
                    username: '',
                    password: ''
                };
                $rootScope.Loaded();
            };

            vm.showEditForm = function(camera){
                $rootScope.Start();
                Restangular.one(routeName, camera.id).get().then(function(cameraInfo){
                    vm.cameraInfo = cameraInfo;
                    vm.isEditing = true;
                    $rootScope.Loaded();
                }, function(response){
                    $rootScope.Error(response);
                });
            };

            vm.saveForm = function(formData){
                if(!formData.$valid){
                    return;
                }
                $rootScope.Start();
                vm.cameraInfo.company_id = vm.HeaderSingle.company_id;
                vm.cameraInfo.site_id = vm.HeaderSingle.site_id;
                vm.cameraInfo.workstation_id = vm.HeaderSingle.workstation_id;
                vm.cameraInfo.weighbridge_id = vm.HeaderSingle.weighbridge_id;
                var promise;
                if(typeof vm.cameraInfo.id === 'undefined'){
                    promise = vm.baseData.post(vm.cameraInfo);
                }else{
                    promise = vm.cameraInfo.save();
                }
                promise.then(function(){
                    loadData();
                    vm.isEditing = false;
                    $rootScope.Loaded();
                }, function(response){
                    $rootScope.Error(response);
                });
            };

            vm.deleteCamera = function(camera){
                vm.isEditing = false;
                if(!confirm('Are you sure you want to delete the camera?')){
                    return;
                }
                $rootScope.Start();
                Restangular.one(routeName, camera.id).get().then(function(cameraInfo){
                    cameraInfo.remove().then(function(){
                        loadData();
                    }, function(response){
                        $rootScope.Error(response);
                    });
                });
            };

            vm.initialize = function() {
                $navigation.clear();
                $Functions.Users().then(function() {
                    vm.getData("company");
                });
            };

            vm.getData = (type) => {
                switch(type){
                    case "company":
                        $Functions.Company().then((companyList) => {
                            vm.HeaderSingle.company_id = $rootScope.Params.company_id;
                            vm.companyList = companyList;
                            if (vm.companyList.length > 0)
                                {
                                    vm.HeaderSingle.company_id = vm.companyList[0].value;
                                    $navigation.Company(vm.HeaderSingle.company_id);
                                    vm.getData("site");
                                }
                                $rootScope.Loaded("Single Company on CameraCtrl");
                            }, function(response){
                                    $rootScope.Error(response);
                                });
                        break;
                    case "site":
                        $Functions.Site().then((siteList) => {
                            vm.siteList = siteList;
                            console.log(vm.sitelist);
                            if (vm.siteList.length > 0)
                            {
                                vm.HeaderSingle.site_id = vm.siteList[0].value;
                                $navigation.Site(vm.HeaderSingle.site_id);
                                vm.getData("workstation");
                            }
                            $rootScope.Loaded("Single Site on CameraCtrl");
                        }, function(response){
                            $rootScope.Error(response);
                        });
                        break;
                    case "workstation":
                        $Functions.Workstation().then((workstationList) => {
                            vm.workstationList = workstationList;
                            if (vm.workstationList.length > 0)
                                {
                                    vm.HeaderSingle.workstation_id = vm.workstationList[0].value;
                                    $navigation.Workstation(vm.HeaderSingle.workstation_id);
                                    vm.getData('weighbridge');
                                }
                            $rootScope.Loaded("Single Workstation on CameraCtrl");
                        }, function(response){
                            $rootScope.Error(response);
                        });
                        break;
                    case "weighbridge":
                        $Functions.Weighbridges().then((weighbridgeList) => {
                            vm.weighbridgeList = weighbridgeList;
                            if(vm.weighbridgeList.length > 0){
                                vm.HeaderSingle.weighbridge_id = vm.weighbridgeList[0].value;
                                $navigation.Weighbridge(vm.HeaderSingle.weighbridge_id);
                                vm.getData('camera');
                            }
                            $rootScope.Loaded("Single Weighbridge on CameraCtrl");
                        }, function(response){
                            $rootScope.Error(response);
                        });
                        break;
                    case 'camera':
                        $Functions.Camera().then(function(cameraList){
                            vm.cameraList = cameraList;
                            console.log('CAMERALIST', vm.cameraList);
                            $rootScope.Loaded("Single Camera on CameraCtrl");
                        }, function(response){
                            $rootScope.Error(response);
                        });
                        break;
                }
            };

            vm.onSelectChange = (type) => {
                switch (type)
                {
                    case "company":
                        $navigation.Company(vm.HeaderSingle.company_id);
                        $navigation.Site(null);
                        vm.getData("site");
                        break;
                    case "site":
                        $navigation.Site(vm.HeaderSingle.site_id);
                        $navigation.Workstation(null);
                        vm.getData("workstation");
                        break;
                    case "workstation":
                        $navigation.Workstation(vm.HeaderSingle.workstation_id);
                        //$navigation.Weighbridge(null);
                        vm.getData("weighbridge");
                        break;
                    case "weighbridge":
                        $navigation.Weighbridge(vm.HeaderSingle.weighbridge_id);
                        vm.getData("camera");
                        console.log('HEADERSINGLE', vm.HeaderSingle);
                        break;
                        
                }
            };

            vm.onAuthTypeChange = function() {
                if (vm.cameraInfo.auth_type === 'none') {
                    vm.cameraInfo.username = '';
                    vm.cameraInfo.password = '';
                }
            };

            vm.previewCamera = function() {
                $rootScope.Start();
                var requestData = {
                    imageUrl: vm.cameraInfo.ip_address,
                    authType: vm.cameraInfo.auth_type,
                    username: vm.cameraInfo.username,
                    password: vm.cameraInfo.password
                };

                Restangular.all('getImageFromIpString').post(requestData).then(function(response) {
                    vm.cameraPreview = response;
                    $rootScope.Loaded();
                }, function(response) {
                    $rootScope.Error(response);
                });
            };

        });
