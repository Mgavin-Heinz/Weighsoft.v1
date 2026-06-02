"use strict";
angular.module("xenon.controllers").controller("ReprintPrintCtrl", function ($scope, $rootScope, $state, $stateParams, Restangular, $q, $navigation, $Functions) {
    var vm = this;
    
    // Expose controller as System for template compatibility
    $scope.System = vm;
    var routeName = "weighingheaders";
    
    vm.Site = {};
    
    // Add formatNumber function to vm.Site
    vm.Site.formatNumber = function (i) {
        const decimals = Number.isInteger(vm?.Site?.decimals) && vm.Site.decimals >= 0
            ? vm.Site.decimals
            : 2;
    
        // Handle missing/invalid input
        if (i === undefined || (typeof i !== "number" && typeof i !== "string")) {
            return decimals > 0 ? (0).toFixed(decimals) : "0";
        }
    
        // Parse strings to number
        const n = typeof i === "string" ? parseFloat(i) : i;
    
        if (!Number.isFinite(n)) {
            return decimals > 0 ? (0).toFixed(decimals) : "0";
        }
    
        return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
    };
    vm.Single = {};
    vm.Setting = {};
    vm.ReportData = {
        Hauliers: null,
        BusinessPartners: null,
        Products: null,
        Settings: null,
        palletCharges: 0,
        First: {
            Weight: null,
            Weight1: null,
            Weight2: null,
            Weight3: null,
            Weight4: null,
            Weight5: null,
            Weight6: null,
            WeightDate: null,
            UserName: null,
            UserId: null,
        },
        Second: {
            Weight: null,
            Weight1: null,
            Weight2: null,
            Weight3: null,
            Weight4: null,
            Weight5: null,
            Weight6: null,
            WeightDate: null,
            UserName: null,
            UserId: null,
        },
        Verify: {
            UserName: null,
            UserId: null,
        },
    };
    vm.invoice = {
        productLines: [],
        subTotal: 0,
        vat: 0,
        total: 0,
        balanceDue: 0,
        amountDue: 0,
        businessPartner: null,
    };
    vm.cam = [];
    vm.Cameras = [];
    vm.FormDisplay = false;
    vm.ScannedUser = null;
    vm.FingerPrintVerify = "No"; // Default; hydrate from site settings
    vm.userprofile = [];
    vm.selected_pallet = null;
    vm.NumberplateClass = "";
    vm.NumberplateVerify = "warning";
    
    vm.HeaderSingle = {
        company_id: $stateParams.company_id,
        site_id: $stateParams.site_id,
        workstation_id: $stateParams.workstation_id,
        weighing_header: $stateParams.id
    };
    
    $rootScope.FingerFeedback = "";
    
    // Initialize basic data structures
    vm.Companies = [];
    vm.Sites = [];
    vm.Workstations = [];
    vm.Hauliers = [];
    vm.BusinessPartners = [];
    vm.Products = [];
    vm.Settings = [];
    vm.Pallets = [];
    vm.selected_pallet = null;
    
    vm.load = function () {
        if (!$stateParams.id) {
            $state.go('app.reprint_list');
            return;
        }
        
        // Set up navigation parameters first
        $navigation.clear();
        $navigation.Company($stateParams.company_id);
        $navigation.Site($stateParams.site_id);
        $navigation.Workstation($stateParams.workstation_id);

        // Determine fingerprint requirement from Site configuration
        $Functions.Site().then(
            function (siteList) {
                var site = siteList.find(function (s) { return s.value == $stateParams.site_id || s.id == $stateParams.site_id; });
                if (site && typeof site.finger_active !== "undefined") {
                    vm.FingerPrintVerify = (site.finger_active === true || site.finger_active === 'Yes') ? 'Yes' : 'No';
                } else {
                    vm.FingerPrintVerify = 'No';
                }
            },
            function () {
                vm.FingerPrintVerify = 'No';
            }
        );
        
        // Load user data
        $Functions.Users().then(function (user) {
            vm.User = user;
            
            // Set up company/site/workstation data
            vm.HeaderSingle.company_id = $stateParams.company_id;
            vm.HeaderSingle.site_id = $stateParams.site_id;
            vm.HeaderSingle.workstation_id = $stateParams.workstation_id;
            
            // Load the transaction data for printing with timeout
            var Service = Restangular.one(routeName, $stateParams.id)
                .withHttpConfig({ timeout: 30000 }); // 30 second timeout
            Service.customGET("", vm.HeaderSingle).then(
                function (data) {
                vm.Single = data;
                vm.Single.printcamera = 'No'; // Default value
                vm.Single.actiontype = "Reprint"; // Set actiontype for proper template display
                
                // Preserve original weights from main transaction data
                var originalFirstWeight = parseFloat(vm.Single.FirstWeight) || 0;
                var originalSecondWeight = parseFloat(vm.Single.SecondWeight) || 0;
                
                // Initialize weights with original values or defaults
                vm.Single.FirstWeight = originalFirstWeight;
                vm.Single.SecondWeight = originalSecondWeight;
                vm.Single.FirstDate = vm.Single.FirstDate || null;
                vm.Single.SecondDate = vm.Single.SecondDate || null;
                
                console.log("Initial weights from transaction data:", {
                    FirstWeight: originalFirstWeight,
                    SecondWeight: originalSecondWeight,
                    rawFirstWeight: data.FirstWeight,
                    rawSecondWeight: data.SecondWeight
                });
                
                // CRITICAL DEBUG: Log what the template will receive
                console.log("Template will receive weighingHeader as:", {
                    "vm.Single object": vm.Single,
                    "FirstWeight available": vm.Single.FirstWeight,
                    "SecondWeight available": vm.Single.SecondWeight
                });
                
                // Enable form display
                vm.FormDisplay = true;
                vm.ReadOnly = true;
                
                // Handle contract data if present
                if (data.contractTransaction != null) {
                    if (data.contract_total_amount && data.contract_total_amount > 0) {
                        vm.ReportData.Contract = {
                            name: data.contractTransaction.contract.name,
                            promised: data.contract_total_amount,
                            delivered: data.contract_total_amount - data.contract_remaining_amount,
                            remaining: data.contract_remaining_amount,
                        };
                    }
                }
                
                // Load weighing transactions for detailed report data
                Restangular.all("weighingtransactions")
                    .getList(vm.HeaderSingle)
                    .then(
                        function (weighingtransactions) {
                            vm.Single.weighingtransactions = weighingtransactions;
                            
                            // Process First Weighing (Status "1")
                            var First = weighingtransactions.findIndex((p) => p.Status == "1");
                            if (First !== -1) {
                                var firstTransaction = weighingtransactions[First];
                                // Try different possible weight field names
                                var transactionWeight = parseFloat(firstTransaction.WeightTotal || firstTransaction.weight || firstTransaction.Weight || 0);
                                
                                vm.ReportData.First.Weight = transactionWeight;
                                vm.ReportData.First.Weight1 = parseFloat(firstTransaction.Weight1 || 0);
                                vm.ReportData.First.Weight2 = parseFloat(firstTransaction.Weight2 || 0);
                                vm.ReportData.First.Weight3 = parseFloat(firstTransaction.Weight3 || 0);
                                vm.ReportData.First.Weight4 = parseFloat(firstTransaction.Weight4 || 0);
                                vm.ReportData.First.Weight5 = parseFloat(firstTransaction.Weight5 || 0);
                                vm.ReportData.First.Weight6 = parseFloat(firstTransaction.Weight6 || 0);
                                vm.ReportData.First.WeightDate = firstTransaction.created_at;
                                vm.ReportData.First.UserId = firstTransaction.user_id;
                                vm.ReportData.First.UserName = firstTransaction.user_name;
                                
                                // Only update FirstWeight if transaction has valid weight data
                                if (transactionWeight > 0 || vm.Single.FirstWeight === 0) {
                                    vm.Single.FirstWeight = transactionWeight;
                                }
                                vm.Single.FirstDate = firstTransaction.created_at;
                                vm.Single.FirstUser = firstTransaction.user_name || vm.Single.FirstUser;
                                vm.Single.Weight1 = vm.ReportData.First.Weight1;
                                vm.Single.Weight2 = vm.ReportData.First.Weight2;
                                vm.Single.Weight3 = vm.ReportData.First.Weight3;
                                vm.Single.Weight4 = vm.ReportData.First.Weight4;
                                vm.Single.Weight5 = vm.ReportData.First.Weight5;
                                vm.Single.Weight6 = vm.ReportData.First.Weight6;
                                
                                console.log("First weighing transaction processed:", {
                                    transactionWeight: transactionWeight,
                                    finalFirstWeight: vm.Single.FirstWeight,
                                    rawTransaction: firstTransaction
                                });
                            }
                            
                            // Process Second Weighing (Status "2")
                            var Second = weighingtransactions.findIndex((p) => p.Status == "2");
                            if (Second !== -1) {
                                var secondTransaction = weighingtransactions[Second];
                                // Try different possible weight field names
                                var transactionWeight = parseFloat(secondTransaction.WeightTotal || secondTransaction.weight || secondTransaction.Weight || 0);
                                
                                vm.ReportData.Second.Weight = transactionWeight;
                                vm.ReportData.Second.Weight1 = parseFloat(secondTransaction.Weight1 || 0);
                                vm.ReportData.Second.Weight2 = parseFloat(secondTransaction.Weight2 || 0);
                                vm.ReportData.Second.Weight3 = parseFloat(secondTransaction.Weight3 || 0);
                                vm.ReportData.Second.Weight4 = parseFloat(secondTransaction.Weight4 || 0);
                                vm.ReportData.Second.Weight5 = parseFloat(secondTransaction.Weight5 || 0);
                                vm.ReportData.Second.Weight6 = parseFloat(secondTransaction.Weight6 || 0);
                                vm.ReportData.Second.WeightDate = secondTransaction.created_at;
                                vm.ReportData.Second.UserId = secondTransaction.user_id;
                                vm.ReportData.Second.UserName = secondTransaction.user_name;
                                
                                // Only update SecondWeight if transaction has valid weight data
                                if (transactionWeight > 0 || vm.Single.SecondWeight === 0) {
                                    vm.Single.SecondWeight = transactionWeight;
                                }
                                vm.Single.SecondDate = secondTransaction.created_at;
                                vm.Single.user_name = secondTransaction.user_name || vm.Single.user_name;
                                vm.Single.weight = vm.Single.SecondWeight; // Total weight for template
                                
                                // Set axel setups
                                if (secondTransaction.AxelSetups) {
                                    $rootScope.AxelSetups = secondTransaction.AxelSetups;
                                }
                                
                                console.log("Second weighing transaction processed:", {
                                    transactionWeight: transactionWeight,
                                    finalSecondWeight: vm.Single.SecondWeight,
                                    rawTransaction: secondTransaction
                                });
                            }
                            
                            // Process Verification (Status "V")
                            var Verify = weighingtransactions.findIndex((p) => p.Status == "V");
                            if (Verify !== -1) {
                                vm.ReportData.Verify.UserId = weighingtransactions[Verify].user_id;
                                vm.ReportData.Verify.UserName = weighingtransactions[Verify].user_name;
                                vm.Single.VerifyUser = weighingtransactions[Verify].user_name;
                            }
                            
                            // Set deduction values from transaction data (DO NOT CALCULATE WEIGHTS YET)
                            vm.ReportData.moistureDeduction = data.moistureWeight || 0;
                            vm.ReportData.handlingCharges = data.handlingWeight || 0;
                            vm.ReportData.palletCharges = data.palletWeight || 0;
                            
                            // Set the individual transaction moisture/handling values for display
                            vm.Single.moisture_deduction = data.moisture_deduction || 0;
                            vm.Single.handling_charges = data.handling_charges || 0;
                            vm.Single.handlingAlias = data.handlingAlias || "Handling";
                            vm.Single.pallet_charges = data.pallet_charges || 0;
                            vm.Single.pallet_count = data.pallet_count || 0;
                            
                            // Set custom fields from transaction data (Custom1-Custom20)
                            for (let i = 1; i <= 20; i++) {
                                const customField = `Custom${i}`;
                                vm.Single[customField] = data[customField] || "";
                            }
                            
                            // Set additional transaction fields
                            vm.Single.RegNumber = data.RegNumber || "";
                            vm.Single.RegNumber2 = data.RegNumber2 || "";
                            vm.Single.RegNumber3 = data.RegNumber3 || "";
                            vm.Single.grades = data.grades || "";
                            
                            // CRITICAL FIX: Ensure weights are properly set for printing
                            console.log("FINAL Weight Debug - Pre-Print Check:", {
                                "Main Transaction FirstWeight": originalFirstWeight,
                                "Main Transaction SecondWeight": originalSecondWeight,
                                "Final vm.Single.FirstWeight": vm.Single.FirstWeight,
                                "Final vm.Single.SecondWeight": vm.Single.SecondWeight,
                                "Gross Weight Calculated": grossWeight,
                                "Final Nett Weight": finalNett,
                                "Has First Transaction": First !== -1,
                                "Has Second Transaction": Second !== -1,
                                "Site Decimals": vm.Site?.decimals,
                                "Format Function Available": typeof vm.Site?.formatNumber === 'function',
                                "Sample Format Test": vm.Site?.formatNumber ? vm.Site.formatNumber(vm.Single.SecondWeight) : 'No function'
                            });
                            
                            // CRITICAL FIX: Always ensure weights are set correctly for template
                            // The template expects weighingHeader.FirstWeight and weighingHeader.SecondWeight
                            // Since weighing-header="System.Single", vm.Single becomes weighingHeader in template
                            
                            // Priority order: original transaction data > weighing transactions > fallback to 0
                            var finalFirstWeight = originalFirstWeight;
                            var finalSecondWeight = originalSecondWeight;
                            
                            // Only use transaction weights if original weights are 0 or missing
                            if ((finalFirstWeight === 0 || !finalFirstWeight) && First !== -1) {
                                var firstTransWeight = parseFloat(weighingtransactions[First].WeightTotal || weighingtransactions[First].weight || weighingtransactions[First].Weight || 0);
                                if (firstTransWeight > 0) finalFirstWeight = firstTransWeight;
                            }
                            
                            if ((finalSecondWeight === 0 || !finalSecondWeight) && Second !== -1) {
                                var secondTransWeight = parseFloat(weighingtransactions[Second].WeightTotal || weighingtransactions[Second].weight || weighingtransactions[Second].Weight || 0);
                                if (secondTransWeight > 0) finalSecondWeight = secondTransWeight;
                            }
                            
                            // Ensure weights are always set for the template
                            vm.Single.FirstWeight = finalFirstWeight;
                            vm.Single.SecondWeight = finalSecondWeight;
                            
                            // ✅ NOW CALCULATE NET WEIGHT WITH CORRECT WEIGHTS!
                            var grossWeight = Math.abs(vm.Single.FirstWeight - vm.Single.SecondWeight);
                            vm.Single.GrossWeight = grossWeight;
                            
                            // Calculate final nett weight including all deductions
                            var finalNett = grossWeight - vm.ReportData.moistureDeduction - vm.ReportData.handlingCharges - vm.ReportData.palletCharges;
                            vm.Single.NettWeight = finalNett;
                            vm.ReportData.nett = finalNett;
                            
                            console.log("TEMPLATE READY: Final weights and net calculation:", {
                                "Template FirstWeight": vm.Single.FirstWeight,
                                "Template SecondWeight": vm.Single.SecondWeight,
                                "Calculated Gross Weight": grossWeight,
                                "Deductions": {
                                    moisture: vm.ReportData.moistureDeduction,
                                    handling: vm.ReportData.handlingCharges,
                                    pallet: vm.ReportData.palletCharges
                                },
                                "Final Net Weight": finalNett,
                                "Original from DB": {FirstWeight: originalFirstWeight, SecondWeight: originalSecondWeight},
                                "Transaction Processing": {hasFirst: First !== -1, hasSecond: Second !== -1}
                            });
                            
                            // Force scope update to ensure template gets the data (safely)
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                            
                            // Load camera data from transactions
                            vm.cam = [];
                            if (vm.Setting.use_cameras === "Yes" && vm.Setting.print_cameras_on_ticket === "Yes") {
                                weighingtransactions.forEach((transaction) => {
                                    if (transaction.Cameras && transaction.Cameras.length > 0) {
                                        transaction.Cameras.forEach((c) => {
                                            c.ip_address = "data:image/png;base64," + c.base64;
                                            c.name = c.name || "Camera " + c.id;
                                            vm.cam.push(c);
                                        });
                                    }
                                });
                                console.log("Transaction cameras loaded:", vm.cam.length);
                            }
                        },
                        function (response) {
                            $rootScope.Error(response);
                        }
                    );
                
                // Call SelectOnChange methods to populate related data
                vm.SelectOnChange("settings");
                vm.SelectOnChange("haulier");
                vm.SelectOnChange("businesspartner");
                vm.SelectOnChange("product");
                
                // Load related data
                loadRelatedData();
                
                // Initialize fingerprint verification
                vm.Functions.Users().then(
                    function () {
                        $rootScope.Loaded("Transaction loaded for reprint");
                    },
                    function (response) {
                        $rootScope.Error(response);
                    }
                );
                },
                function (response) {
                    console.error("ReprintPrint: Transaction loading failed:", response);
                    $rootScope.Error(response);
                    $rootScope.Loaded && $rootScope.Loaded("ReprintPrint load failed");
                    
                    // Show user-friendly error message based on error type
                    if (response.status === 404) {
                        swal("Error", "Transaction not found. It may have been deleted.", "error", function() {
                            $state.go('app.reprint_list');
                        });
                    } else if (response.status === 403) {
                        swal("Error", "Access denied. You don't have permission to view this transaction.", "error", function() {
                            $state.go('app.reprint_list');
                        });
                    } else if (response.status === 0 || response.status === -1) {
                        swal("Error", "Network connection error. Please check your connection and try again.", "error", function() {
                            $state.go('app.reprint_list');
                        });
                    } else {
                        swal("Error", "Failed to load transaction. Please try again later.", "error", function() {
                            $state.go('app.reprint_list');
                        });
                    }
                }
            );
        });
    };
    
    function loadRelatedData() {
        // Load settings, hauliers, business partners, and products with timeouts
        var timeoutConfig = { timeout: 15000 }; // 15 second timeout
        
        $Functions.Settings().then(function (settings) {
            vm.Settings = settings;
            vm.Settings.forEach(function (Setting) {
                if (Setting.id == vm.Single.settings_id) {
                    vm.Setting = Setting;
                    vm.ReportData.Settings = "Reprint: " + vm.Setting.name;
                    vm.ReportData.Header = vm.Setting.custom_header_text;
                    vm.ReportData.HeaderImg = vm.Setting.display_custom_header_img;
                    vm.ReportData.Footer = vm.Setting.custom_footer_text;
                    vm.ReportData.FooterImg = vm.Setting.display_custom_footer_img;
                    vm.ReportData.MeasureTypes = vm.Setting.measure_type;
                    
                    // Configure all settings features
                    vm.Setting.enable_moisture = vm.Setting.enable_moisture || "false";
                    vm.Setting.enable_handling = vm.Setting.enable_handling || "false";
                    vm.Setting.pallet_enabled = vm.Setting.pallet_enabled || "false";
                    // If no pallet is linked to this transaction, hide pallet UI regardless of settings
                    if (!vm.Single.pallet_id) { vm.Setting.pallet_enabled = "false"; }
                    
                    // Custom fields configuration
                    vm.Setting.custom_fields = vm.Setting.custom_fields || "false";
                    
                    // Camera configuration  
                    vm.Setting.use_cameras = vm.Setting.use_cameras || "false";
                    vm.Setting.display_cameras = vm.Setting.display_cameras || "false";
                    vm.Setting.print_cameras_on_ticket = vm.Setting.print_cameras_on_ticket || "false";
                    
                    // Numberplate configuration
                    vm.Setting.numberplate_1 = vm.Setting.numberplate_1 || "No";
                    vm.Setting.numberplate_2 = vm.Setting.numberplate_2 || "No";
                    vm.Setting.numberplate_3 = vm.Setting.numberplate_3 || "No";
                    vm.Setting.numberplate_recognition = vm.Setting.numberplate_recognition || "No";
                    
                    // Header/Footer configuration
                    vm.Setting.ticket_header = vm.Setting.ticket_header || "false";
                    vm.Setting.ticket_footer = vm.Setting.ticket_footer || "false";
                    
                    // Business configuration
                    vm.Setting.haulier = vm.Setting.haulier || "false";
                    vm.Setting.business_partner = vm.Setting.business_partner || "false";
                    vm.Setting.use_product_list = vm.Setting.use_product_list || "false";
                    
                    console.log("Settings loaded:", {
                        enable_moisture: vm.Setting.enable_moisture,
                        enable_handling: vm.Setting.enable_handling,
                        pallet_enabled: vm.Setting.pallet_enabled,
                        use_cameras: vm.Setting.use_cameras,
                        numberplate_1: vm.Setting.numberplate_1,
                        custom_fields: vm.Setting.custom_fields
                    });
                }
            });
        }).catch(function(error) {
            console.error("Failed to load settings:", error);
            vm.Settings = [];
            vm.Setting = {}; // Set default empty setting
        });
        
        // Load hauliers
        Restangular.all("haulier")
            .withHttpConfig(timeoutConfig)
            .getList($navigation.get())
            .then(function (data) {
                vm.Hauliers = [];
                data.forEach(function (mapData) {
                    vm.Hauliers.push({
                        value: mapData.id,
                        name: mapData.name + " (" + mapData.code + ")",
                        report: mapData.name + " (" + mapData.code + ")",
                    });
                });
                vm.Hauliers.forEach(function (haul) {
                    if (vm.Single.haulier_id == haul.value) {
                        vm.ReportData.Hauliers = haul.report;
                    }
                });
            })
            .catch(function(error) {
                console.error("Failed to load hauliers:", error);
                vm.Hauliers = [];
            });
        
        // Load business partners
        Restangular.all("businesspartner")
            .withHttpConfig(timeoutConfig)
            .getList($navigation.get())
            .then(function (data) {
                vm.BusinessPartners = [];
                data.forEach(function (mapData) {
                    vm.BusinessPartners.push({
                        value: mapData.id,
                        name: mapData.name + " (" + mapData.code + ")",
                        report: mapData.name + " (" + mapData.code + ")",
                        city: mapData.city,
                        code: mapData.code,
                        postal_code: mapData.postal_code,
                        street: mapData.street,
                        suburb: mapData.suburb,
                        vat_nr: mapData.vat_nr,
                    });
                });
                vm.BusinessPartners.forEach(function (partner) {
                    if (vm.Single.businesspartner_id == partner.value) {
                        vm.ReportData.BusinessPartners = partner.report;
                        vm.invoice.businessPartner = partner;
                    }
                });
            })
            .catch(function(error) {
                console.error("Failed to load business partners:", error);
                vm.BusinessPartners = [];
            });
        
        // Load products
        Restangular.all("product")
            .withHttpConfig(timeoutConfig)
            .getList($navigation.get())
            .then(function (data) {
                vm.Products = [];
                data.forEach(function (mapData) {
                    vm.Products.push({
                        value: mapData.id,
                        code: mapData.code,
                        name: mapData.name + " (" + mapData.code + ")",
                        report: mapData.name + " (" + mapData.code + ")",
                        purchase_price: mapData.purchase_price,
                        sale_price: mapData.sale_price,
                        vat: mapData.vat,
                    });
                });
                vm.Products.forEach(function (product) {
                    if (vm.Single.product_id == product.value) {
                        vm.ReportData.Products = product.report;
                        var rawPrice = (vm.Setting.goods_type === "1") ? product.purchase_price : product.sale_price;
                        var parsedPrice = parseFloat(rawPrice);
                        var parsedVat = parseFloat(product.vat);
                        var netWeight = parseFloat(vm.Single.NettWeight || vm.ReportData.nett || 0);
                        var safeNetWeight = isNaN(netWeight) ? 0 : netWeight;
                        var exclVat = isNaN(parsedPrice) ? 0 : (parsedPrice * safeNetWeight);
                        var safeVatRate = isNaN(parsedVat) ? 0 : parsedVat;
                        var vatAmount = exclVat * (safeVatRate / 100);
                        vm.ReportData.productPrice = isNaN(parsedPrice) ? null : parsedPrice;
                        vm.ReportData.productPriceLabel = (vm.Setting.goods_type === "1") ? "Purchase Price" : "Unit price";
                        vm.ReportData.productVat = safeVatRate;
                        vm.ReportData.pricingExclVat = exclVat;
                        vm.ReportData.pricingVat = vatAmount;
                        vm.ReportData.pricingFinal = exclVat + vatAmount;
                        buildProductInvoice(product);
                    }
                });
            })
            .catch(function(error) {
                console.error("Failed to load products:", error);
                vm.Products = [];
            });
        
        // Load pallets if pallet_enabled
        if (vm.Setting.pallet_enabled === "true") {
            Restangular.all("pallet")
                .withHttpConfig(timeoutConfig)
                .getList($navigation.get())
                .then(function (data) {
                    vm.Pallets = [];
                    data.forEach(function (mapData) {
                        vm.Pallets.push({
                            value: mapData.id,
                            pallet_id: mapData.id,
                            pallet_name: mapData.pallet_name,
                            amount: mapData.amount,
                            report: mapData.pallet_name,
                        });
                    });
                    
                    // Find and set the selected pallet
                    if (vm.Single.pallet_id) {
                        vm.selected_pallet = vm.Pallets.find((pallet) => pallet.pallet_id == vm.Single.pallet_id);
                        if (vm.selected_pallet) {
                            vm.ReportData.palletName = vm.selected_pallet.pallet_name;
                            vm.ReportData.palletAmount = vm.selected_pallet.amount;
                            console.log("Pallet found:", vm.selected_pallet);
                        }
                    }
                })
                .catch(function(error) {
                    console.error("Failed to load pallets:", error);
                    vm.Pallets = [];
                });
        }
        
        // Load cameras if camera usage is enabled
        if (vm.Setting.use_cameras === "Yes" && vm.Setting.print_cameras_on_ticket === "Yes") {
            Restangular.all("camera")
                .withHttpConfig(timeoutConfig)
                .getList($navigation.get())
                .then(function (data) {
                    if (data && data.length > 0) {
                        vm.Cameras = data.filter(camera => camera.camera_active === 'true');
                        
                        // Set camera print setting from transaction or default
                        vm.Single.printcamera = vm.Single.printcamera || (vm.Setting.print_cameras_on_ticket === 'Yes' ? 'Yes' : 'No');
                        
                        console.log("Cameras loaded:", vm.Cameras.length);
                    }
                })
                .catch(function(error) {
                    console.error("Failed to load cameras:", error);
                    vm.Cameras = [];
                });
        }
        
        // Load company and site data
        if ($rootScope.MasterData && $rootScope.Params) {
            vm.ReportData.Company = $rootScope.MasterData.find((company) => company.id === $rootScope.Params.company_id);
            if (vm.ReportData.Company && vm.ReportData.Company.sites) {
                vm.ReportData.Site = vm.ReportData.Company.sites.find((site) => site.id === $rootScope.Params.site_id);
                if (vm.ReportData.Site) {
                    vm.Site = vm.ReportData.Site; // Set vm.Site for formatNumber function
                    vm.Site.decimals = vm.ReportData.Site.decimals || 2; // Default to 2 decimals
                    // Re-apply the formatNumber function with the correct decimals
                    vm.Site.formatNumber = function (i) {
                        const decimals = Number.isInteger(vm?.Site?.decimals) && vm.Site.decimals >= 0
                            ? vm.Site.decimals
                            : 2;
                    
                        // Handle missing/invalid input
                        if (i === undefined || (typeof i !== "number" && typeof i !== "string")) {
                            return decimals > 0 ? (0).toFixed(decimals) : "0";
                        }
                    
                        // Parse strings to number
                        const n = typeof i === "string" ? parseFloat(i) : i;
                    
                        if (!Number.isFinite(n)) {
                            return decimals > 0 ? (0).toFixed(decimals) : "0";
                        }
                    
                        return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
                    };
                }
            }
        } else {
            // Fallback if no global data available
            vm.Site.decimals = 2;
        }
    }
    
    var buildProductInvoice = function (product) {
        var productLines = [];
        var productPrice = vm.Setting.goods_type === "1" ? product.purchase_price : product.sale_price;
        var unitPrice = parseFloat(productPrice);
        
        if (vm.Setting.contract_enabled && vm.Single.contract_transaction && vm.Single.contract_transaction.contract) {
            if (vm.Single.contract_transaction.contract.price && vm.Single.contract_transaction.contract.price.length > 0) {
                unitPrice = parseFloat(vm.Single.contract_transaction.contract.price);
            }
        }
        
        var netWeight = vm.Single.NettWeight || vm.ReportData.nett || 0;
        var productLine = {
            code: product.code,
            desc: product.name,
            unitPrice: unitPrice,
            qty: { value: netWeight, symbol: vm.Setting.measure_type || vm.ReportData.MeasureTypes },
            total: unitPrice * netWeight,
            type: "P",
        };
        productLines.push(productLine);
        
        vm.invoice.productLines = productLines;
        vm.invoice.subTotal = unitPrice * netWeight;
        vm.invoice.vat = product.vat ? roundToTwo((vm.invoice.subTotal * parseFloat(product.vat)) / 100) : 0;
        vm.invoice.total = vm.invoice.subTotal + vm.invoice.vat;
        vm.invoice.balanceDue = vm.invoice.amountDue = vm.invoice.total;
    };
    
    function roundToTwo(num) {
        return +(Math.round(num + "e+2") + "e-2");
    }
    
    vm.SelectOnChange = function (type) {
        switch (type) {
            case "settings":
                if (vm.Settings && vm.Settings.length > 0) {
                    vm.Settings.forEach(function (Setting) {
                        if (Setting.id == vm.Single.settings_id) {
                            vm.Setting = Setting;
                            vm.ReportData.Settings = "Reprint: " + vm.Setting.name;
                            vm.ReportData.Header = vm.Setting.custom_header_text;
                            vm.ReportData.HeaderImg = vm.Setting.display_custom_header_img;
                            vm.ReportData.Footer = vm.Setting.custom_footer_text;
                            vm.ReportData.FooterImg = vm.Setting.display_custom_footer_img;
                            vm.ReportData.MeasureTypes = vm.Setting.measure_type;
                            
                            // Ensure deduction features are properly enabled
                            vm.Setting.enable_moisture = vm.Setting.enable_moisture || "false";
                            vm.Setting.enable_handling = vm.Setting.enable_handling || "false";
                            vm.Setting.pallet_enabled = vm.Setting.pallet_enabled || "false";
                            if (!vm.Single.pallet_id) { vm.Setting.pallet_enabled = "false"; }
                            
                            // Configure all settings features for SelectOnChange
                            vm.Setting.custom_fields = vm.Setting.custom_fields || "false";
                            vm.Setting.use_cameras = vm.Setting.use_cameras || "false";
                            vm.Setting.display_cameras = vm.Setting.display_cameras || "false";
                            vm.Setting.print_cameras_on_ticket = vm.Setting.print_cameras_on_ticket || "false";
                            vm.Setting.numberplate_1 = vm.Setting.numberplate_1 || "No";
                            vm.Setting.numberplate_2 = vm.Setting.numberplate_2 || "No";
                            vm.Setting.numberplate_3 = vm.Setting.numberplate_3 || "No";
                            vm.Setting.ticket_header = vm.Setting.ticket_header || "false";
                            vm.Setting.ticket_footer = vm.Setting.ticket_footer || "false";
                            vm.Setting.haulier = vm.Setting.haulier || "false";
                            vm.Setting.business_partner = vm.Setting.business_partner || "false";
                            vm.Setting.use_product_list = vm.Setting.use_product_list || "false";
                        }
                    });
                }
                break;
            case "haulier":
                if (vm.Hauliers && vm.Hauliers.length > 0) {
                    vm.Hauliers.forEach(function (haul) {
                        if (vm.Single.haulier_id == haul.value) {
                            vm.ReportData.Hauliers = haul.report;
                        }
                    });
                }
                break;
            case "businesspartner":
                if (vm.BusinessPartners && vm.BusinessPartners.length > 0) {
                    vm.BusinessPartners.forEach(function (buzz) {
                        if (vm.Single.businesspartner_id == buzz.value) {
                            vm.ReportData.BusinessPartners = buzz.report;
                            vm.invoice.businessPartner = buzz;
                        }
                    });
                }
                break;
            case "product":
                if (vm.Products && vm.Products.length > 0) {
                    vm.Products.forEach(function (product) {
                        if (vm.Single.product_id == product.value) {
                            vm.ReportData.Products = product.report;
                            buildProductInvoice(product);
                            var rawPrice = (vm.Setting.goods_type === "1") ? product.purchase_price : product.sale_price;
                            var parsedPrice = parseFloat(rawPrice);
                            var parsedVat = parseFloat(product.vat);
                            var netWeight = parseFloat(vm.Single.NettWeight || vm.ReportData.nett || 0);
                            var safeNetWeight = isNaN(netWeight) ? 0 : netWeight;
                            var exclVat = isNaN(parsedPrice) ? 0 : (parsedPrice * safeNetWeight);
                            var safeVatRate = isNaN(parsedVat) ? 0 : parsedVat;
                            var vatAmount = exclVat * (safeVatRate / 100);
                            vm.ReportData.productPrice = isNaN(parsedPrice) ? null : parsedPrice;
                            vm.ReportData.productPriceLabel = (vm.Setting.goods_type === "1") ? "Purchase Price" : "Unit price";
                            vm.ReportData.productVat = safeVatRate;
                            vm.ReportData.pricingExclVat = exclVat;
                            vm.ReportData.pricingVat = vatAmount;
                            vm.ReportData.pricingFinal = exclVat + vatAmount;
                        }
                    });
                }
                break;
        }
    };
    
    vm.Functions = {
        Users: function () {
            var deferred = $q.defer();
            Restangular.all("userprofile")
                .getList($navigation.get())
                .then(
                    function (data) {
                        vm.userprofile = [];
                        $rootScope.FingerFeedback = "";
                        data.forEach(function (mapData) {
                            vm.userprofile.push({
                                fingerprint: mapData.fingerprint,
                                id: mapData.firstname,
                                firstname: mapData.firstname,
                                lastname: mapData.lastname,
                            });
                            $rootScope.FingerFeedback = $rootScope.FingerFeedback + mapData.fingerprint + ";";
                        });
                        
                        // Set up fingerprint watcher
                        vm.finger = $scope.$watch(
                            function () {
                                return $rootScope.FingerFeedback;
                            },
                            function (current, original) {
                                if (current !== original && $rootScope.FingerFeedback.length > 800 && $rootScope.FingerFeedback.indexOf(";") === -1) {
                                    vm.userprofile.forEach(function (user) {
                                        if (user.fingerprint.substring(1, user.fingerprint.length) == $rootScope.FingerFeedback.substring(1, user.fingerprint.length)) {
                                            vm.ScannedUser = user.firstname + " " + user.lastname;
                                            swal("Success", "Fingerprint Match: " + user.firstname + " " + user.lastname, "success");
                                        }
                                    });
                                }
                            }
                        );
                        deferred.resolve({ data: { message: "userprofile success!" } });
                    },
                    function (response) {
                        deferred.reject({ data: { message: response } });
                    }
                );
            return deferred.promise;
        }
    };
    
    vm.Fingerprint = function () {
        $rootScope.FingerFeedback = "StartVerification";
        vm.Functions.Users().then(
            function (value) {
                $rootScope.Loaded("Fingerprint verification started");
            },
            function (response) {
                $rootScope.Error(response);
            }
        );
    };
    
    vm.print = function () {
        if (vm.FingerPrintVerify === 'Yes' && (vm.ScannedUser === null || vm.ScannedUser === '')) {
            swal("Print Authorization", "Please scan your fingerprint to authorize this reprint.", "error");
            return;
        }
        
        vm.FormDisplay = true;
        setTimeout(function () {
            window.print();
            setTimeout(function () {
                // CRITICAL FIX: Reset FormDisplay to false and force UI refresh after printing
                vm.FormDisplay = false;
                // Reset fingerprint scan state to allow re-printing
                if (vm.FingerPrintVerify === 'Yes') {
                    vm.ScannedUser = null;
                    $rootScope.FingerFeedback = "";
                }
                // Force scope update to refresh buttons
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }, 500); // Increased timeout to ensure print dialog completes
        }, 100);
    };
    
    vm.save = function () {
        if (vm.FingerPrintVerify === 'Yes' && (vm.ScannedUser === null || vm.ScannedUser === '')) {
            swal("Print Authorization", "Please scan your fingerprint to authorize this reprint.", "error");
            return;
        }
        
        setTimeout(function () {
            window.print();
            setTimeout(function () {
                // CRITICAL FIX: Reset FormDisplay and fingerprint state after printing
                vm.FormDisplay = false;
                // Reset fingerprint scan state to allow re-printing
                if (vm.FingerPrintVerify === 'Yes') {
                    vm.ScannedUser = null;
                    $rootScope.FingerFeedback = "";
                }
                // Force scope update to refresh buttons
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }, 500); // Increased timeout to ensure print dialog completes
        }, 100);
    };
    
    vm.cancel = function () {
        var getType = {};
        if (getType.toString.call(vm.finger) === "[object Function]") {
            vm.finger();
        }
        $state.go('app.reprint_list');
    };
    
    vm.backToList = function () {
        var getType = {};
        if (getType.toString.call(vm.finger) === "[object Function]") {
            vm.finger();
        }
        $state.go('app.reprint_list');
    };
    
    // Clean up watchers when leaving the controller
    $scope.$on('$destroy', function() {
        if (vm.finger && typeof vm.finger === 'function') {
            vm.finger();
        }
    });
});
