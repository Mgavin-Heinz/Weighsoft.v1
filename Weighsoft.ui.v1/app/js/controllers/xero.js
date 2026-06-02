'use strict';
angular
    .module('xenon.controllers')
    .controller('XeroCtrl', function ($scope, $rootScope, $navigation, $Functions, Restangular, $q) {
        $rootScope.Start('XeroCtrl');
        var vm = this;

        vm.companyList = [];
        vm.HeaderSingle = {
            company_id: null,
        };

        vm.xeroSettings = {};
        vm.invoiceQueue = [];
        vm.syncLog = [];
        vm.syncing = false;
        vm.syncingInvoiceStatuses = false;
        vm.savingSettings = false;

        vm.syncFrequencyOptions = [
            { value: 15, text: 'Every 15 minutes' },
            { value: 30, text: 'Every 30 minutes' },
            { value: 60, text: 'Every hour' },
            { value: 120, text: 'Every 2 hours' },
            { value: 360, text: 'Every 6 hours' },
            { value: 720, text: 'Every 12 hours' },
            { value: 1440, text: 'Every 24 hours' },
        ];

        vm.invoiceActionOptions = [
            { value: 'draft', text: 'Draft' },
            { value: 'approved', text: 'Approved' },
            { value: 'approved_emailed', text: 'Approved and Emailed' },
        ];

        vm.syncDirectionOptions = [
            { value: 'off', text: 'Off' },
            { value: 'xero_to_weighsoft', text: 'Xero \u2192 WeighSoft' },
            { value: 'weighsoft_to_xero', text: 'WeighSoft \u2192 Xero' },
            { value: 'bidirectional', text: 'Bidirectional' },
        ];

        vm.initialize = function () {
            $rootScope.Start();
            $navigation.clear();
            $Functions.Users().then(function () {
                var navInfo = $navigation.get();
                if (navInfo.company_id !== null) {
                    vm.HeaderSingle.company_id = navInfo.company_id;
                }

                $Functions.Company().then(function (companies) {
                    vm.companyList = companies;
                    if (vm.companyList.length === 1) {
                        vm.HeaderSingle.company_id = vm.companyList[0].value;
                    }
                    if (vm.HeaderSingle.company_id != null) {
                        vm.loadXeroData();
                    } else {
                        $rootScope.Loaded();
                    }
                }, function (response) {
                    $rootScope.Error(response);
                });
            });
        };

        vm.changeCompanyID = function () {
            $navigation.Company(vm.HeaderSingle.company_id);
            if (vm.HeaderSingle.company_id) {
                vm.loadXeroData();
            }
        };

        vm.loadXeroData = function () {
            $rootScope.Start();
            var companyId = vm.HeaderSingle.company_id;

            $q.all([
                Restangular.one('xero/settings', companyId).get(),
                Restangular.one('xero/invoices', companyId).get(),
                Restangular.one('xero/sync-log', companyId).get(),
            ]).then(function (responses) {
                vm.xeroSettings = responses[0];
                vm.invoiceQueue = responses[1] || [];
                vm.syncLog = responses[2] || [];
                $rootScope.Loaded();
            }, function (response) {
                $rootScope.Error(response);
            });
        };

        vm.saveSettings = function () {
            vm.savingSettings = true;
            var companyId = vm.HeaderSingle.company_id;
            Restangular.one('xero/settings', companyId).customPUT({
                xero_enabled: vm.xeroSettings.xero_enabled,
                sync_customers: vm.xeroSettings.sync_customers,
                sync_products: vm.xeroSettings.sync_products,
                auto_create_invoices: vm.xeroSettings.auto_create_invoices,
                invoice_action: vm.xeroSettings.invoice_action,
                sync_frequency_minutes: vm.xeroSettings.sync_frequency_minutes,
                currency_code: vm.xeroSettings.currency_code,
            }).then(function (response) {
                vm.xeroSettings = response;
                vm.savingSettings = false;
                toastr.success('Settings saved successfully.');
            }, function (response) {
                vm.savingSettings = false;
                toastr.error('Failed to save settings.');
            });
        };

        vm.connectToXero = function () {
            var companyId = vm.HeaderSingle.company_id;
            Restangular.one('xero/connect', companyId).get().then(function (response) {
                var popup = window.open(response.auth_url, 'XeroAuth', 'width=600,height=700');
                var pollTimer = setInterval(function () {
                    if (popup.closed) {
                        clearInterval(pollTimer);
                        vm.loadXeroData();
                    }
                }, 1000);
            }, function (response) {
                toastr.error('Failed to start Xero connection.');
            });
        };

        vm.disconnectFromXero = function () {
            swal({
                title: 'Disconnect from Xero?',
                text: 'This will remove the Xero connection for this company. You can reconnect later.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Disconnect',
                cancelButtonText: 'Cancel',
            }, function (isConfirm) {
                if (isConfirm) {
                    var companyId = vm.HeaderSingle.company_id;
                    Restangular.one('xero/disconnect', companyId).remove().then(function () {
                        toastr.success('Disconnected from Xero.');
                        vm.loadXeroData();
                    }, function () {
                        toastr.error('Failed to disconnect from Xero.');
                    });
                }
            });
        };

        vm.syncAll = function () {
            vm.syncing = true;
            var companyId = vm.HeaderSingle.company_id;
            Restangular.one('xero/sync', companyId).post().then(function (response) {
                vm.syncing = false;
                toastr.success('Sync complete. Customers: ' + (response.customers.pulled + response.customers.pushed) + ', Items: ' + (response.items.pulled + response.items.pushed));
                vm.loadXeroData();
            }, function () {
                vm.syncing = false;
                toastr.error('Sync failed. Check logs for details.');
            });
        };

        vm.syncCustomers = function () {
            vm.syncing = true;
            var companyId = vm.HeaderSingle.company_id;
            Restangular.one('xero/sync/' + companyId + '/customers').post().then(function (response) {
                vm.syncing = false;
                toastr.success('Customer sync complete. Pulled: ' + response.pulled + ', Pushed: ' + response.pushed);
                vm.loadXeroData();
            }, function () {
                vm.syncing = false;
                toastr.error('Customer sync failed.');
            });
        };

        vm.syncItems = function () {
            vm.syncing = true;
            var companyId = vm.HeaderSingle.company_id;
            Restangular.one('xero/sync/' + companyId + '/items').post().then(function (response) {
                vm.syncing = false;
                toastr.success('Item sync complete. Pulled: ' + response.pulled + ', Pushed: ' + response.pushed);
                vm.loadXeroData();
            }, function () {
                vm.syncing = false;
                toastr.error('Item sync failed.');
            });
        };

        vm.retryInvoice = function (queueItem) {
            Restangular.one('xero/invoices', queueItem.id).customPOST({}, 'retry').then(function () {
                toastr.success('Invoice retry queued.');
                vm.loadXeroData();
            }, function () {
                toastr.error('Failed to retry invoice.');
            });
        };

        vm.syncInvoiceStatuses = function () {
            vm.syncingInvoiceStatuses = true;
            var companyId = vm.HeaderSingle.company_id;
            Restangular.one('xero/invoices', companyId).customPOST({}, 'sync-status').then(function (response) {
                vm.syncingInvoiceStatuses = false;
                toastr.success('Invoice status sync complete. Synced: ' + response.synced + ', Failed: ' + response.failed);
                vm.loadXeroData();
            }, function (response) {
                vm.syncingInvoiceStatuses = false;
                toastr.error((response && response.data && response.data.error) ? response.data.error : 'Invoice status sync failed.');
            });
        };

        vm.canVoidInvoice = function (queueItem) {
            return queueItem && queueItem.xero_status === 'AUTHORISED';
        };

        vm.canDeleteInvoice = function (queueItem) {
            return queueItem && (queueItem.xero_status === 'DRAFT' || queueItem.xero_status === 'SUBMITTED');
        };

        vm.voidInvoice = function (queueItem) {
            swal({
                title: 'Void invoice?',
                text: 'This will void invoice ' + (queueItem.xero_invoice_number || queueItem.xero_invoice_id) + ' in Xero.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Void Invoice',
                cancelButtonText: 'Cancel',
            }, function (isConfirm) {
                if (!isConfirm) {
                    return;
                }

                Restangular.one('xero/invoices', queueItem.id).customPOST({}, 'void').then(function () {
                    toastr.success('Invoice voided successfully.');
                    vm.loadXeroData();
                }, function (response) {
                    toastr.error((response && response.data && response.data.error) ? response.data.error : 'Failed to void invoice.');
                    vm.loadXeroData();
                });
            });
        };

        vm.deleteInvoice = function (queueItem) {
            swal({
                title: 'Delete invoice?',
                text: 'This will delete invoice ' + (queueItem.xero_invoice_number || queueItem.xero_invoice_id) + ' in Xero.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Delete Invoice',
                cancelButtonText: 'Cancel',
            }, function (isConfirm) {
                if (!isConfirm) {
                    return;
                }

                Restangular.one('xero/invoices', queueItem.id).customPOST({}, 'delete').then(function () {
                    toastr.success('Invoice deleted successfully.');
                    vm.loadXeroData();
                }, function (response) {
                    toastr.error((response && response.data && response.data.error) ? response.data.error : 'Failed to delete invoice.');
                });
            });
        };
    });
