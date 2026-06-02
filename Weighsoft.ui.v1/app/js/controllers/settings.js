"use strict";
angular.module("xenon.controllers").controller("SettingsCtrl",
    function ($scope, $rootScope, $stateParams, $navigation, $Functions, $Names, Restangular, $q, FileUploader) {
        $rootScope.Start("init on SettingsCtrl");
        $scope.Params = {
            Company: {},
        };

        const vm = this;
        vm.handlingAlias = "Handling";
        vm.companyList = [];
        vm.siteList = [];
        vm.workstationList = [];
        const routeName = "settings";
        // <editor-fold default-state="collapsed" desc="EmptyObject">
        const EmptyObject = {
            company_id: "",
            name: "New Name",
            haulier: "false",
            stored_tares: "false",
            numberplate_recognition: "false",
            business_partner: "false",
            type_of_weighing: "single",
            first_can_axel: "false",
            second_can_axel: "false",
            goods_type: "Received Goods",
            print_ticket: "none",
            ticket_template: "normal",
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
        // </editor-fold>

        vm.HeaderSingle = {
            company_id: $stateParams.company_id,
            site_id: $stateParams.site_id,
            workstation_id: $stateParams.workstation_id,
            company: $stateParams.company,
            site: $stateParams.site,
            workstation: $stateParams.workstation
        };
        vm.OptionTypes = [
            { value: "N", text: "None" },
            { value: "TO", text: "Text Optional" },
            { value: "TC", text: "Text Compulsory" },
            { value: "SO", text: "List Optional" },
            { value: "SC", text: "List Compulsory" },
            { value: "P", text: "Percentage" },
        ];
        vm.Companies = [];
        vm.Single = null;

        function loadData() {
            $rootScope.Start();
            vm.isEditing = false;
            $Functions.Settings().then(
                function (data) {
                    vm.formData = data;
                    vm.hasData = true;
                    vm.formData = vm.formData.map((setting) => {
                        setting.company = vm.companyList.find((company) => company.value === setting.company_id) ?? { registered_name: "" };
                        // setting.Site = vm.siteList.find((site) => site.value === setting.site_id);
                        // setting.Workstation = vm.workstationList.find((workstation) => workstation.value === setting.workstation_id);
                        return setting;
                    });
                    vm.FormDisplay = false;
                    $rootScope.Loaded();
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
        }
        vm.base64Image = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18b521b1512%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18b521b1512%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2274.421875%22%20y%3D%22104.5%22%3E200x200%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
            
        vm.ImageUploaderSet = function () {
            // #region Images
            var headerUploader = $scope.headerUploader = new FileUploader({
                url: __env.base + '/api/updateImage?token=' + $rootScope.token,
                formData: [{ id: vm.Single.id, option: 'header' }],
                headers: { Authorization: "Bearer " + $rootScope.token },
                autoUpload: true,
                removeAfterUpload: true,
                queueLimit: 1,

                //,timeout: 2000
            });
            headerUploader.onSuccessItem = function (fileItem, response, status, headers) {
                console.info('onSuccessItem', fileItem, response, status, headers);
                vm.Single.display_custom_header_img = response.message;
            };
            headerUploader.onErrorItem = function (fileItem, response, status, headers) {
                console.info('onErrorItem', fileItem, response, status, headers);
            };
            headerUploader.onTimeoutItem = function (fileItem) {
                console.info('onTimeoutItem', fileItem);
            };
            headerUploader.onCompleteAll = function () {
                console.info('onCompleteAll');
            };
            var footerUploader = $scope.footerUploader = new FileUploader({
                url: __env.base + '/api/updateImage?token=' + $rootScope.token,
                formData: [{ id: vm.Single.id, option: 'footer' }],
                headers: { Authorization: "Bearer " + $rootScope.token },
                autoUpload: true,
                removeAfterUpload: true,
                queueLimit: 1,

                //,timeout: 2000
            });
            footerUploader.onSuccessItem = function (fileItem, response, status, headers) {
                console.info('onSuccessItem', fileItem, response, status, headers);
                vm.Single.display_custom_footer_img = response.message;
            };
            footerUploader.onErrorItem = function (fileItem, response, status, headers) {
                console.info('onErrorItem', fileItem, response, status, headers);
            };
            footerUploader.onTimeoutItem = function (fileItem) {
                console.info('onTimeoutItem', fileItem);
            };
            footerUploader.onCompleteAll = function () {
                console.info('onCompleteAll');
            };
            // #endregion

        }

        vm.removeTicketHeaderImage = function () {
            if (vm.Single) {
                vm.Single.display_custom_header_img = "";
            }
        };

        vm.removeTicketFooterImage = function () {
            if (vm.Single) {
                vm.Single.display_custom_footer_img = "";
            }
        };

        vm.load = function() {
            $navigation.clear();
            //var navInfo = $navigation.get();
            $Functions.Users().then(function() {
                vm.getData("company");
            });
        };

        vm.editForm = function (data) {
            $rootScope.Start();
            Restangular.one(routeName, data.id)
                .get()
                .then(
                    function (dat) {
                        vm.Single = dat;
                        vm.ImageUploaderSet();
                        vm.FormDisplay = true;
                        $rootScope.Loaded();
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
        };

        vm.addForm = function () {
            vm.FormDisplay = true;
            vm.Single = JSON.parse(JSON.stringify(EmptyObject));
        };

        vm.cancel = function () {
            vm.FormDisplay = false;
        };

        vm.save = function () {
            $rootScope.Start("vm.save on SettingsCtrl");
            vm.Single.company_id = vm.HeaderSingle.company_id ?? vm.Single.company_id;
            vm.Single.site_id = vm.HeaderSingle.site_id ?? vm.Single.site_id;
            vm.Single.workstation_id = vm.HeaderSingle.workstation_id ?? vm.Single.workstation_id;
            vm.Single.ticket_template = vm.Single.ticket_template || "normal";
            
            console.log(vm.Single.tares_enabled);
            console.log(vm.Single.type_of_weighing);
            let Error = "";
            if (vm.Single.tares_enabled === "true" && vm.Single.type_of_weighing === '1')
            {
                console.log('check?');
                Error = Error + "Can't do tares with single weighing. \n";
            }
            if (Error != "")
            {
                swal("Oops...", Error, "error");
                $rootScope.Loaded("Settings on SettingsCtrll");
                return;
            }

            if (vm.Single.actiontype !== null && vm.Single.actiontype === "New")
            {
                Restangular.all(routeName)
                    .post(vm.Single)
                    .then(
                        () => loadData(),
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
            } else
            {
                vm.Single.save().then(
                    function () {
                        loadData();
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
            }
        };

        vm.delete = function (data) {
            $rootScope.Start("vm.save on SettingsCtrl");
            //vm.Single.company_id = $scope.Params.Company;
            Restangular.one(routeName, data.id)
                .remove()
                .then(
                    function () {
                        loadData();
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
        };

        vm.getData = (type) => {
            switch (type)
            {
                case "company":
                    $Functions.Company().then((companyList) => {
                        vm.HeaderSingle.company_id = $rootScope.Params.company_id;
                        vm.companyList = companyList;
                        if (vm.companyList.length > 0)
                        {
                            vm.HeaderSingle.company_id = vm.companyList[0].value;
                            $navigation.Company(vm.HeaderSingle.company_id);
                            vm.getData("site");
                        } else
                        {
                            vm.getData("workstation");
                            loadData();
                        }

                        $rootScope.Loaded("Loaded Companies on SettingsCtrl");
                    });
                    break;
                case "site":
                    $Functions.Site().then(
                        (siteList) => {
                            vm.HeaderSingle.site_id = $rootScope.Params.site_id;
                            vm.siteList = siteList;
                            console.log(vm.sitelist);
                            if (vm.siteList.length > 0)
                            {
                                vm.HeaderSingle.site_id = vm.siteList[0].value;
                                $navigation.Site(vm.HeaderSingle.site_id);
                                vm.getData("workstation");
                            } else
                            {
                                loadData();
                            }

                            $rootScope.Loaded("Loaded Sites on SettingsCtrl");
                        },
                        (response) => $rootScope.Error(response)
                    );
                    break;
                case "workstation":
                    $Functions.Workstation().then((workstationList) => {
                        vm.HeaderSingle.workstation_id = $rootScope.Params.workstation_id;
                        vm.workstationList = workstationList;

                        if (vm.workstationList.length > 0)
                        {
                            vm.HeaderSingle.workstation_id = vm.workstationList[0].value;
                            $navigation.Workstation(vm.HeaderSingle.workstation_id);
                        }

                        if (vm.HeaderSingle.workstation_id)
                        {
                            loadData();
                        }

                        $rootScope.Loaded("Loaded Workstations on SettingsCtrl");
                    });
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
                    loadData();
            }
        };
    });
