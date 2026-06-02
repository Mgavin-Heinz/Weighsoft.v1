"use strict";

angular.module("xenon.controllers").controller("ReportingCtrl", function ($scope, $stateParams, $rootScope, $q, Restangular, $Functions, $navigation, DTOptionsBuilder, $Exceptions, $compile, DTColumnBuilder) {
    var vm = this;
    vm.HeaderSingle = {
        company_id: $stateParams.company_id,
        site_id: $stateParams.site_id,
        workstation_id: $stateParams.workstation_id,
        company: $stateParams.company,
        site: $stateParams.site,
        workstation: $stateParams.workstation
    };
    vm.columnsReady = false;
    vm.Single = {
        jsondata: {
            ReportType: null,
            Groupings: [],
            Filters: [],
            Columns: [],
            Total: [],
            Emails: [],
        },
    };
    vm.Lists = {
        ReportTypeList: [
            { name: "Transaction", value: "transaction" },
            { name: "Exception", value: "exception" },
        ],
        GroupingsList: [
            //{name: 'Company', value: 'company'},
            { name: "Site", value: "site" },
            { name: "Workstation", value: "workstation" },
            { name: "Weighbridge", value: "weighbridge" },
            { name: "Weighing Types", value: "weighingtypes" },
            { name: "Product", value: "product" },
            { name: "Grades", value: "grades" },
            { name: "Business Partner", value: "businesspartner" },
            { name: "Haulier", value: "haulier" },
            { name: "Stockpile Nr", value: "stockpilenr" },
            { name: "Destination", value: "destination" },
            { name: "Exception Type", value: "exceptiontype" },
            { name: "Month", value: "month" },
        ],
        FiltersList: [
            //{name: 'Company', value: 'company'},
            { name: "Site", value: "site" },
            { name: "Workstation", value: "workstation" },
            { name: "Weighbridge", value: "weighbridge" },
            { name: "Weighing Types", value: "weighingtypes" },
            { name: "Product", value: "product" },
            { name: "Grades", value: "grades" },
            { name: "Business Partner", value: "businesspartner" },
            { name: "Haulier", value: "haulier" },
            { name: "Date Range", value: "date" },
        ],
        ColumnsList: [
            { name: "Transaction Date", value: "date" },
            //{name: 'Company', value: 'company'},
            { name: "Site", value: "site" },
            { name: "Workstation", value: "workstation" },
            { name: "Weighbridge", value: "weighbridge" },
            { name: "Weighing Types", value: "weighingtypes" },
            { name: "Product Code", value: "productcode" },
            { name: "Product", value: "product" },
            { name: "Grades", value: "grades" },
            { name: "Business Partner Code", value: "businesspartnercode" },
            { name: "Business Partner", value: "businesspartner" },
            { name: "Haulier Code", value: "hauliercode" },
            { name: "Haulier", value: "haulier" },
            { name: "Stockpile Nr", value: "stockpilenr" },
            { name: "Destination", value: "destination" },
            { name: "Contract", value: "contract" },
            { name: "Custom Fields", value: "customfields" },
            { name: "Count Records", value: "recordcount" },
            { name: "Gross Weight", value: "singletotalweight" },
            { name: "Nett Weight", value: "singlenettweight" },
            { name: "1st Weight User", value: "firstWeightUser" },
            { name: "2nd Weight User", value: "secondWeightUser" },
            { name: "Verifying User", value: "verifyingUser" },
            { name: "1st Weight", value: "single1stweight" },
            { name: "2nd Weight", value: "single2ndweight" },
            { name: "Sum Gross Weight", value: "sumtotalweight" },
            { name: "Sum Nett Weight", value: "sumnettweight" },
            { name: "Sum 1st Weight", value: "sum1stweight" },
            { name: "Sum 2nd Weight", value: "sum2ndweight" },
            { name: "Avg Gross Weight", value: "avgtotalweight" },
            { name: "Avg Nett Weight", value: "avgnettweight" },
            { name: "Avg 1st Weight", value: "avg1stweight" },
            { name: "Avg 2nd Weight", value: "avg2ndweight" },
            { name: "Moisture Weight", value: "singlemoistureweight" },
            { name: "Handling Weight", value: "singlehandlingweight" },
            { name: "Moisture Percentage", value: "singlemoisturepercentage" },
            { name: "Moisture Threshold Percentage", value: "singlemoisturethresholdpercentage" },
            { name: "Handling Percentage", value: "singlehandlingpercentage" },
        ],
        TotalList: [
            { name: "Sum Total Weight Column", value: "totalsum" },
            { name: "Sum 1st Weight Column", value: "1stsum" },
            { name: "Sum 2nd Weight Column", value: "2ndsum" },
            { name: "Avg Total Weight Column", value: "totalavg" },
            { name: "Avg 1st Weight Column", value: "1stavg" },
            { name: "Avg 2nd Weight Column", value: "2ndavg" },
        ],
    };
    vm.Status = "None";
    vm.Filters = {
        site_id: null,
        weighingtypes_id: null,
        product_id: null,
        workstation_id: null,
        businesspartner_id: null,
        haulier_id: null,
        stockpile_nr: null,
        destination: null,
        DateRange: {
            startDate: null,
            endDate: null,
        },
    };
    vm.Selectors = {
        Groupings: false,
        Filters: false,
        Columns: false,
        Totals: false,
        Actions: false,
        Emails: false,
    };
    vm.Table = {
        rows: [],
        cols: [],
        show: false,
        nodata: false,
        dtOptions: DTOptionsBuilder.newOptions().withBootstrap().withButtons(["csv", "colvis"]),
        dtColumns: [],
        dtInstance: {},
    };
    vm.SelectOnChange = function (action) {
        switch (action)
        {
            case "ReportType":
                if (vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.GroupingsList = [
                        //{name: 'Company', value: 'company'},
                        { name: "Site", value: "site" },
                        { name: "Workstation", value: "workstation" },
                        { name: "Weighbridge", value: "weighbridge" },
                        { name: "Weighing Types", value: "weighingtypes" },
                        { name: "Product", value: "product" },
                        { name: "Grades", value: "grades" },
                        { name: "Business Partner", value: "businesspartner" },
                        { name: "Haulier", value: "haulier" },
                        { name: "Stockpile Nr", value: "stockpilenr" },
                        { name: "Destination", value: "destination" },
                        { name: "Month", value: "month" },
                    ];
                } else
                {
                    vm.Lists.GroupingsList = [
                        //{name: 'Company', value: 'company'},
                        { name: "Site", value: "site" },
                        { name: "Workstation", value: "workstation" },
                        { name: "Weighbridge", value: "weighbridge" },
                        { name: "Exception Type", value: "exceptiontype" },
                        { name: "Month", value: "month" },
                    ];
                }
                vm.Selectors.Groupings = true;
                vm.Selectors.Filters = true;
                console.log(action);
                break;
            case "Groupings":
                vm.Lists.FiltersList = [];
                if (vm.Single.jsondata.Groupings.indexOf("Site") != -1 || vm.Single.jsondata.Groupings.length == 0)
                {
                    vm.Lists.FiltersList.push({ name: "Site", value: "site" });
                }
                if (vm.Single.jsondata.Groupings.indexOf("Workstation") != -1 || vm.Single.jsondata.Groupings.length == 0)
                {
                    vm.Lists.FiltersList.push({ name: "Workstation", value: "workstation" });
                }
                if (vm.Single.jsondata.Groupings.indexOf("Weighbridge") != -1 || vm.Single.jsondata.Groupings.length == 0)
                {
                    vm.Lists.FiltersList.push({ name: "Weighbridge", value: "weighbridge" });
                }
                if ((vm.Single.jsondata.Groupings.indexOf("Weighing Types") != -1 || vm.Single.jsondata.Groupings.length == 0) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.FiltersList.push({ name: "Weighing Types", value: "weighingtypes" });
                }
                if ((vm.Single.jsondata.Groupings.indexOf("Product") != -1 || vm.Single.jsondata.Groupings.length == 0) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.FiltersList.push({ name: "Product", value: "product" });
                }
                if ((vm.Single.jsondata.Groupings.indexOf("Grades") != -1 || vm.Single.jsondata.Groupings.length == 0) && vm.Single.jsondata.ReportType.value == "transaction")
                    {
                        vm.Lists.FiltersList.push({ name: "Grades", value: "grades" });
                    }
                if ((vm.Single.jsondata.Groupings.indexOf("Business Partner") != -1 || vm.Single.jsondata.Groupings.length == 0) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.FiltersList.push({ name: "Business Partner", value: "businesspartner" });
                }
                if ((vm.Single.jsondata.Groupings.indexOf("Haulier") != -1 || vm.Single.jsondata.Groupings.length == 0) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.FiltersList.push({ name: "Haulier", value: "haulier" });
                }
                if ((vm.Single.jsondata.Groupings.indexOf("Stockpile Nr") != -1 || vm.Single.jsondata.Groupings.length == 0) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.FiltersList.push({ name: "Stockpile Nr", value: "stockpilenr" });
                }
                if ((vm.Single.jsondata.Groupings.indexOf("Destination") != -1 || vm.Single.jsondata.Groupings.length == 0) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.FiltersList.push({ name: "Destination", value: "destination" });
                }
                if ((vm.Single.jsondata.Groupings.indexOf("Exception Type") != -1 || vm.Single.jsondata.Groupings.length == 0) && vm.Single.jsondata.ReportType.value == "exception")
                {
                    vm.Lists.FiltersList.push({ name: "Exception Code", value: "exceptioncode" });
                    vm.Lists.FiltersList.push({ name: "Exception Description", value: "exceptiondescription" });
                }
                vm.Lists.FiltersList.push({ name: "Date Range", value: "date" });
                console.log(action);
                break;
            case "Filters":
                vm.Lists.ColumnsList = [];
                if (vm.Single.jsondata.Groupings.length == 0 && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.ColumnsList.push({ name: "Transaction Date", value: "date" });
                    vm.Lists.ColumnsList.push({ name: "Transaction No", value: "transaction" });
                    vm.Lists.ColumnsList.push({ name: "Registration No", value: "registration" });
                    vm.Lists.ColumnsList.push(
                        { name: "1st Weight User", value: "firstWeightUser" },
                        { name: "2nd Weight User", value: "secondWeightUser" },
                        { name: "Verifying User", value: "verifyingUser" }
                    );
                    vm.Lists.ColumnsList.push({ name: "Is Deleted?", value: "isDeleted" }, { name: "Delete Reason", value: "deleteReason" }, { name: "User that Deleted", value: "deleteUser" });
                }

                if (vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Site") != -1)
                {
                    vm.Lists.ColumnsList.push({ name: "Site", value: "site" });
                }
                if (vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Workstation") != -1)
                {
                    vm.Lists.ColumnsList.push({ name: "Workstation", value: "workstation" });
                }
                if (vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Weighbridge") != -1)
                {
                    vm.Lists.ColumnsList.push({ name: "Weighbridge", value: "weighbridge" });
                }
                if ((vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Weighing Types") != -1) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.ColumnsList.push({ name: "Weighing Types", value: "weighingtypes" });
                }
                if ((vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Business Partner") != -1) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.ColumnsList.push({ name: "Business Partner", value: "businesspartner" });
                }
                if ((vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Product") != -1) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.ColumnsList.push({ name: "Product", value: "product" });
                }
                if ((vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Grades") != -1) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.ColumnsList.push({ name: "Grades", value: "grades" });
                }
                if (vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.ColumnsList.push({ name: "Stockpile Nr", value: "stockpilenr" });
                    vm.Lists.ColumnsList.push({ name: "Destination", value: "destination" });
                    vm.Lists.ColumnsList.push({ name: "Contract", value: "contract" });
                }
                if ((vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Haulier") != -1) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.ColumnsList.push({ name: "Haulier", value: "haulier" });
                }
                if ((vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Business Partner") != -1) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.ColumnsList.push({ name: "Business Partner Code", value: "businesspartnercode" });
                }
                if ((vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Product") != -1) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.ColumnsList.push({ name: "Product Code", value: "productcode" });
                }
                if ((vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Haulier") != -1) && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.ColumnsList.push({ name: "Haulier Code", value: "hauliercode" });
                }
                if (vm.Single.jsondata.Groupings.indexOf("Month") != -1)
                {
                    vm.Lists.ColumnsList.push({ name: "Month", value: "month" });
                }
                if ((vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Exception Type") != -1) && vm.Single.jsondata.ReportType.value == "exception")
                {
                    vm.Lists.ColumnsList.push({ name: "Exception Code", value: "exceptioncode" });
                }
                if ((vm.Single.jsondata.Groupings.length == 0 || vm.Single.jsondata.Groupings.indexOf("Exception Type") != -1) && vm.Single.jsondata.ReportType.value == "exception")
                {
                    vm.Lists.ColumnsList.push({ name: "Exception Description", value: "exceptiondescription" });
                }
                if (vm.Single.jsondata.Groupings.length == 0 && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.ColumnsList.push({ name: "Gross Weight", value: "singlegrossweight" });
                    vm.Lists.ColumnsList.push({ name: "Nett Weight", value: "singlenettweight" });
                    vm.Lists.ColumnsList.push({ name: "1st Weight", value: "single1stweight" });
                    vm.Lists.ColumnsList.push({ name: "2nd Weight", value: "single2ndweight" });
                    // updated 30 May 2024
                    vm.Lists.ColumnsList.push({ name: "Moisture Weight", value: "singlemoistureweight" });
                    vm.Lists.ColumnsList.push({ name: "Handling Weight", value: "singlehandlingweight" });
                    vm.Lists.ColumnsList.push({ name: "Moisture Percentage", value: "singlemoisturepercentage" });
                    vm.Lists.ColumnsList.push({ name: "Moisture Threshold Percentage", value: "singlemoisturethresholdpercentage" });
                    vm.Lists.ColumnsList.push({ name: "Handling Percentage", value: "singlehandlingpercentage" });
                    vm.Lists.ColumnsList.push({ name: "Unit Price (per Ton)", value: "unitpriceperton" });
                    vm.Lists.ColumnsList.push({ name: "Pricing Excl VAT", value: "pricingexclvat" });
                    vm.Lists.ColumnsList.push({ name: "Pricing VAT", value: "pricingvat" });
                    vm.Lists.ColumnsList.push({ name: "Pricing Incl VAT", value: "pricinginclvat" });
                }
                if (vm.Single.jsondata.Groupings.length == 0 && vm.Single.jsondata.ReportType.value == "exception")
                {
                    vm.Lists.ColumnsList.push({ name: "Exception Data", value: "exceptiondata" });
                    vm.Lists.ColumnsList.push({ name: "Comment", value: "exceptioncomment" });
                }
                if (vm.Single.jsondata.Filters.length > 0 && vm.Single.jsondata.Filters.indexOf("Weighing Types") != -1)
                {
                    vm.Lists.ColumnsList.push({ name: "Custom Fields", value: "customfields" });
                }
                if (vm.Single.jsondata.Groupings.length != 0 && vm.Single.jsondata.ReportType.value == "transaction")
                {
                    vm.Lists.ColumnsList.push({ name: "Sum Gross Weight", value: "sumgrossweight" });
                    vm.Lists.ColumnsList.push({ name: "Sum Nett Weight", value: "sumnettweight" });
                    vm.Lists.ColumnsList.push({ name: "Sum 1st Weight", value: "sum1stweight" });
                    vm.Lists.ColumnsList.push({ name: "Sum 2nd Weight", value: "sum2ndweight" });
                    vm.Lists.ColumnsList.push({ name: "Sum Pricing Excl VAT", value: "sumpricingexclvat" });
                    vm.Lists.ColumnsList.push({ name: "Sum Pricing VAT", value: "sumpricingvat" });
                    vm.Lists.ColumnsList.push({ name: "Sum Pricing Incl VAT", value: "sumpricinginclvat" });
                    vm.Lists.ColumnsList.push({ name: "Avg Gross Weight", value: "avggrossweight" });
                    vm.Lists.ColumnsList.push({ name: "Avg Nett Weight", value: "avgnettweight" });
                    vm.Lists.ColumnsList.push({ name: "Avg 1st Weight", value: "avg1stweight" });
                    vm.Lists.ColumnsList.push({ name: "Avg 2nd Weight", value: "avg2ndweight" });
                }
                if (vm.Single.jsondata.Groupings.length != 0)
                {
                    vm.Lists.ColumnsList.push({ name: "Count Records", value: "countrecords" });
                }
                console.log(action);
                vm.Selectors.Columns = true;
                break;
            case "Columns":
                vm.Lists.TotalList = [];
                if (
                    vm.Single.jsondata.Columns.indexOf("Gross Weight") != -1 ||
                    vm.Single.jsondata.Columns.indexOf("Sum Gross Weight") != -1 ||
                    vm.Single.jsondata.Columns.indexOf("Avg Gross Weight") != -1
                )
                {
                    vm.Lists.TotalList.push({ name: "Sum Gross Weight Column", value: "nettsum" });
                    vm.Lists.TotalList.push({ name: "Avg Gross Weight Column", value: "nettavg" });
                }
                if (
                    vm.Single.jsondata.Columns.indexOf("1st Weight") != -1 ||
                    vm.Single.jsondata.Columns.indexOf("Sum 1st Weight") != -1 ||
                    vm.Single.jsondata.Columns.indexOf("Avg 1st Weight") != -1
                )
                {
                    vm.Lists.TotalList.push({ name: "Sum 1st Weight Column", value: "1stsum" });
                    vm.Lists.TotalList.push({ name: "Avg 1st Weight Column", value: "1stavg" });
                }
                if (
                    vm.Single.jsondata.Columns.indexOf("2nd Weight") != -1 ||
                    vm.Single.jsondata.Columns.indexOf("Sum 2nd Weight") != -1 ||
                    vm.Single.jsondata.Columns.indexOf("Avg 2nd Weight") != -1
                )
                {
                    vm.Lists.TotalList.push({ name: "Sum 2nd Weight Column", value: "2ndsum" });
                    vm.Lists.TotalList.push({ name: "Avg 2nd Weight Column", value: "2ndavg" });
                }
                if (vm.Single.jsondata.Columns.indexOf("Count Records") != -1)
                {
                    vm.Lists.TotalList.push({ name: "Sum Count Records", value: "cntsum" });
                }
                console.log(action);
                vm.Selectors.Totals = true;
                vm.Selectors.Actions = true;
                break;
            case "Totals":
                console.log(action);
                break;
        }
    };
    vm.LoadData = function () {
        $Functions.Reporting().then(function (reportList) {
            vm.Reports = reportList;
            vm.Status = "List";
        });
    };
    vm.showAddForm = function () {
        vm.Single = {
            jsondata: {
                ReportType: null,
                Groupings: [],
                Filters: [],
                Columns: [],
                Total: [],
            },
        };
        vm.Selectors = {
            Groupings: false,
            Filters: false,
            Columns: false,
            Totals: false,
            Actions: false,
        };

        vm.Status = "Form";
    };
    var routeName = "reporting";
    vm.baseData = Restangular.all(routeName);
    vm.changeCompanyID = function () {
        $Functions.Company().then(function (companyList) {
            vm.Companies = companyList;
            if (vm.HeaderSingle.company_id !== null)
            {
                $rootScope.Params.company_id = vm.HeaderSingle.company_id;
                $navigation.Company(vm.HeaderSingle.company_id);
                vm.LoadData();
            } else
            {
                $rootScope.Loaded("Single Site on ReportingCtrl");
            }
        });
    };
    vm.initialize = function () {
        $rootScope.Start();
        $navigation.clear();
        $Functions.Users().then(
            function (user) {
                vm.User = user;
                vm.changeCompanyID();
                $rootScope.Loaded();
            },
            function (error) {
                console.log(error);
                $rootScope.Error(error);
            }
        );
    };
    vm.save = function () {
        vm.Single.company_id = vm.HeaderSingle.company_id;
        vm.Single.jsondata = JSON.stringify(vm.Single.jsondata);
        var promise;
        if (typeof vm.Single.id === "undefined")
        {
            promise = vm.baseData.post(vm.Single);
        } else
        {
            promise = vm.Single.save();
        }
        promise.then(
            function () {
                vm.Status = "None";
                vm.LoadData();
            },
            function (response) {
                $rootScope.Error(response);
            }
        );
    };
    
    vm.email = function () {
        var service = Restangular.all("reportEmail");
        console.log("Email Now Single", vm.Single);
        service.post(vm.Single).then(
            function (retData) {
                console.log("Email Now", retData);
                $rootScope.Loaded();
            },
            function (response) {
                $rootScope.Error(response);
            }
        );
    }
    
    vm.editForm = function (data) {
        $rootScope.Start();
        Restangular.one(routeName, data.id)
            .get()
            .then(
                function (retdata) {
                    console.log('Report data', retdata);
                    vm.Single = retdata;
                    vm.Single.jsondata = JSON.parse(vm.Single.jsondata);
                    vm.SelectOnChange("ReportType");
                    vm.SelectOnChange("Groupings");
                    vm.SelectOnChange("Filters");
                    vm.SelectOnChange("Columns");
                    vm.SelectOnChange("Totals");
                    vm.SelectOnChange("Emails");
                    vm.Status = "Form";
                    $rootScope.Loaded();
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
    };
    vm.changeSiteID = function () {
        $rootScope.Params.site_id = vm.Filters.site_id;
        vm.SiteSelected = true;
        console.log(vm.Filters);
        if (vm.Single.jsondata.Filters.includes("Workstation"))
        {
            $Functions.Workstation().then(function (workstationList) {
                vm.Workstations = workstationList;
                if (vm.Workstations.length === 1)
                {
                    vm.Filters.workstation_id = vm.Workstations[0].value;
                    vm.changeWorkstationID();
                }
            });
        }
        if (vm.Single.jsondata.Filters.includes("Haulier"))
        {
            $Functions.Haulier().then(function (haulierList) {
                vm.Hauliers = haulierList;
            });
        }
        if (vm.Single.jsondata.Filters.includes("Business Partner"))
        {
            $Functions.BusinessPartner().then(function (businesspartnerList) {
                vm.BusinessPartners = businesspartnerList;
            });
        }
    };

    vm.changeWorkstationID = function () {
        $rootScope.Params.workstation_id = vm.Filters.workstation_id;
        vm.WorkstationSelected = true;
        if (vm.Single.jsondata.Filters.includes("Weighbridge"))
        {
            $Functions.Weighbridges().then((weighbridgeList) => {
                vm.Weighbridges = weighbridgeList;
                if (vm.Weighbridges.length === 1)
                {
                    vm.Filters.weighbridge_id = vm.Weighbridges[0].value;
                    console.log(vm.Filters);
                }
            });
        }
    };
    //<editor-fold defaultstate="collapsed" desc="dateOptions">
    vm.dateOptions = {
        locale: {
            separator: "  -  ",
            applyLabel: "Apply",
            fromLabel: "From",
            format: "YYYY-MM-DD", //will give you 2017-01-06
            toLabel: "To",
            cancelLabel: "Cancel",
            customRangeLabel: "Custom range",
        },
        ranges: {
            Today: [moment().startOf("day"), moment().endOf("day")],
            Yesterday: [moment().startOf("day").subtract(1, "days"), moment().endOf("day").subtract(1, "days")],
            "Last 7 Days": [moment().startOf("day").subtract(6, "days"), moment().endOf("day")],
            "Last 30 Days": [moment().startOf("day").subtract(29, "days"), moment().endOf("day")],
            "This Month": [moment().startOf("month"), moment().endOf("month")],
            "Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")],
        },
        eventHandlers: {
            "apply.daterangepicker": function (event, picker) {
                vm.filterData = picker;
            },
        },
    };
    vm.FilterDates = {
        startDate: moment().startOf("day"),
        endDate: moment().endOf("day"),
    };
    vm.dateClear = function () {
        vm.Filters.DateRange = {
            startDate: null,
            endDate: null,
        };

        vm.FilterDates = {
            startDate: moment().startOf("day"),
            endDate: moment().endOf("day"),
        };
    };
    function createdRow(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }
    //</editor-fold>
    vm.runReport = function () {
        vm.Table.show = false;
        vm.Table.nodata = false;
        var service = Restangular.one("reporting/" + vm.Single.id + "/edit");

        vm.Filters.DateRange = {
            startDate: vm.FilterDates.startDate.format(),
            endDate: vm.FilterDates.endDate.format(),
        };

        service.get(vm.Filters).then(
            function (retdata) {
                //<editor-fold defaultstate="collapsed" desc="Angular Way">
                //                    vm.Table.dtColumns = [];
                //                    for(var key in Object.keys(retdata[0])){
                //                        vm.Table.dtColumns.push(DTColumnBuilder.newColumn(Object.keys(retdata[0])[key]).withTitle(Object.keys(retdata[0])[key]));
                //                    }
                //                    vm.Table.dtOptions = DTOptionsBuilder.newOptions()
                //                            .withOption('data', retdata.plain())
                //                            .withBootstrap().withButtons(['csv', 'colvis'])
                //                            .withOption('responsive', true)
                //                            .withOption('stateSave', true)
                //                            .withOption('createdRow', createdRow);
                //                    console.log(vm.Table.dtOptions);
                //                    console.log(vm.Table.dtColumns);
                //angular.element('#ReportTable').attr('datatable', 'ng');
                //$compile(angular.element('#ReportTable'))($scope);
                //</editor-fold>

                if (retdata["data"].length > 0)
                {
                    vm.Table.rows = retdata["data"];
                    vm.Table.cols = [];
                    for (var key in vm.Table.rows[0])
                    {
                        vm.Table.cols.push(key);
                    }

                    vm.Table.show = true;
                    //vm.dtInstance.rerender();
                } else
                {
                    vm.Table.nodata = true;
                }
                $rootScope.Loaded();
            },
            function (response) {
                $rootScope.Error(response);
            }
        );
    };
    vm.runForm = function (data) {
        $rootScope.Start();
        vm.SiteSelected = false;
        vm.Filters = {
            site_id: null,
            weighingtypes_id: null,
            product_id: null,
            workstation_id: null,
            businesspartner_id: null,
            haulier_id: null,
            stockpile_nr: null,
            destination: null,
            DateRange: null,
        };

        vm.dateClear();

        Restangular.one(routeName, data.id)
            .get()
            .then(
                function (retdata) {
                    vm.Single = retdata;
                    vm.Single.jsondata = JSON.parse(vm.Single.jsondata);
                    vm.Status = "Report";
                    $rootScope.Loaded();
                    if (vm.Single.jsondata.Filters.includes("Site"))
                    {
                        $Functions.Site().then(function (siteList) {
                            vm.Sites = siteList;
                            if (vm.Sites.length === 1)
                            {
                                vm.Filters.site_id = vm.Sites[0].value;
                                vm.changeSiteID();
                            }
                        });
                    }
                    if (vm.Single.jsondata.Filters.includes("Product"))
                    {
                        $Functions.Product().then(function (productList) {
                            vm.Products = productList;
                        });
                    }
                    if (vm.Single.jsondata.Filters.includes("Weighing Types"))
                    {
                        $Functions.Settings().then(function (weighingtypesList) {
                            vm.WeighingTypes = weighingtypesList;
                        });
                    }
                    if (!vm.Single.jsondata.Filters.includes("Date Range"))
                    {
                        vm.DateRange = {
                            startDate: null,
                            endDate: null,
                        };
                    }
                },
                function (response) {
                    $rootScope.Error(response);
                }
            );
    };
    vm.delete = function (data) {
        data.remove();
        vm.changeCompanyID();
    };
    vm.cancel = function () {
        vm.Status = "List";
        vm.Table.show = false;
        vm.Table.nodata = false;
    };
});
