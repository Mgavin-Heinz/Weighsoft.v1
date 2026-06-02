angular
  .module("xenon.controllers")
  .controller("ContractTransactionsCtrl", function (
    $scope,
    $rootScope,
    Restangular,
    $stateParams,
    $navigation,
    $Functions,
    $state
  ) {
    var vm = this;

    vm.HeaderSingle = {
      company_id: null,
      site_id: null,
      workstation_id: null
    };

    vm.invoice = {
      productLines: [],
      subTotal: 0,
      vat: 0,
      total: 0,
      balanceDue: 0,
      amountDue: 0,
      businessPartner: null
    };

    vm.ReportData = {
      Hauliers: null,
      BusinessPartners: null,
      Products: null,
      Settings: null,
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
        UserId: null
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
        UserId: null
      },
      Verify: {
        UserName: null,
        UserId: null
      }
    };
    vm.Single = {};
    vm.Setting = {
      company_id: "",
      name: "New Name",
      haulier: "false",
      use_product_list: "false",
      stored_tares: "false",
      numberplate_recognition: "false",
      business_partner: "false",
      type_of_weighing: "single",
      first_can_axel: "false",
      second_can_axel: "false",
      goods_type: "Received Goods",
      print_ticket: "none",
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
      actiontype: "New"
    };

    var routeName = "weighingheaders";
    vm.FormDisplay = false;
    vm.cam = [];

    vm.loadContractTransactions = function (contract_id) {
      $rootScope.Start();
      Restangular.all("contracttransaction")
        .get("", { contract_id: contract_id })
        .then(
          function (contractTrans) {
            vm.contractTransactions = contractTrans;
            console.log("TRANSACTIONS", vm.contractTransaction);
            $rootScope.Loaded();
          },
          function (response) {
            $rootScope.Error(response);
          }
        );
    };

    vm.initialize = function () {
      vm.HeaderSingle.company_id = $rootScope.Params.company_id;
      vm.HeaderSingle.site_id = $rootScope.Params.site_id;
      vm.HeaderSingle.workstation_id = $rootScope.Params.workstation_id;
      vm.ReportData.Company = $rootScope.MasterData.find((company) => company.id === $rootScope.Params.company_id);
      $Functions.Settings().then(
        function (value) {
          vm.Settings = value;
          $rootScope.Loaded("Single settings on ContractTransactionsCtrl2");
        },
        function (response) {
          $rootScope.Error(response);
        }
      );
      vm.loadContractTransactions($stateParams.contract_id);
    };

    vm.SelectOnChange = function (type, e) {
      switch (type)
      {
        case "weighbridge":
          $navigation.Weighbridge(vm.Single.weighbridge_id);
          break;
        case "haulier":
          if (vm.Hauliers != undefined && vm.Hauliers.length > 0)
            vm.Hauliers.forEach(function (haul) {
              if (vm.Single.haulier_id == haul.value)
              {
                vm.ReportData.Hauliers = haul.report;
              }
            });
          break;
        case "businesspartner":
          if (
            vm.BusinessPartners != undefined &&
            vm.BusinessPartners.length > 0
          )
            vm.BusinessPartners.forEach(function (buzz) {
              if (vm.Single.businesspartner_id == buzz.value)
              {
                vm.ReportData.BusinessPartners = buzz.report;
                vm.invoice.businessPartner = buzz;
              }
            });
          break;
        case "product":
          if (vm.Products != undefined && vm.Products.length > 0)
            vm.Products.forEach(function (product) {
              if (vm.Single.product_id == product.value)
              {
                vm.ReportData.Products = product.report;
                buildProductInvoice(product);
              }
            });
          break;
        case "settings":
          vm.Settings.forEach(function (Setting) {
            if (Setting.id == vm.Single.settings_id)
            {
              vm.Setting = Setting;
            }
          });
          if (vm.Settings != undefined && vm.Settings.length > 0)
            vm.Settings.forEach(function (setting) {
              if (vm.Single.settings_id == setting.id)
              {
                vm.ReportData.Settings = "Reprint: " + setting.name;
                vm.ReportData.Header = setting.custom_header_text;
                vm.ReportData.HeaderImg = setting.display_custom_header_img;
                vm.ReportData.Footer = setting.custom_footer_text;
                vm.ReportData.FooterImg = setting.display_custom_footer_img;
              }
            });
          break;
      }
    };

    var buildProductInvoice = function (product) {
      var productLines = [];
      var productPrice =
        vm.Setting.goods_type === "1"
          ? product.purchase_price
          : product.sale_price;
      var unitPrice = parseFloat(productPrice);
      if (vm.Setting.contract_enabled && vm.Single.contractTransaction && vm.Single.contractTransaction.contract)
      {
        if (vm.Single.contractTransaction.contract.price && vm.Single.contractTransaction.contract.price.length > 0)
          unitPrice = parseFloat(vm.Single.contractTransaction.contract.price);
      }
      var netWeight = Math.abs(
        parseFloat(vm.Single.FirstWeight) - parseFloat(vm.Single.SecondWeight)
      );
      var productLine = {
        code: product.code,
        desc: product.name,
        unitPrice: unitPrice,
        qty: { value: netWeight, symbol: 'kg' },
        total: unitPrice * netWeight,
        type: 'P'
      };
      productLines.push(productLine);

      // Handling Charges
      var onePercentOfTotal = unitPrice * netWeight * 0.01;
      var handlingPercentage = vm.Single.handling_charges;
      var handlingCharge = onePercentOfTotal * handlingPercentage;
      var handlingChargeItem = {
        code: null,
        desc: "Handling Charges",
        unitPrice: onePercentOfTotal,
        qty: { value: handlingPercentage, symbol: '%' },
        total: handlingCharge,
        type: 'HC'
      };
      if (vm.Settings.enable_handling === 'true')
      {
        productLines.push(handlingChargeItem);
      }
      // Moisture
      var moisture = vm.Single.moisture_deduction ? parseFloat(vm.Single.moisture_deduction) - vm.Setting.moisture_deduction_level : 0;
      var moistureCharge;
      if (moisture > 0)
      {
        moistureCharge = unitPrice * netWeight * (moisture / 100);
      }
      if (moistureCharge && vm.Settings.enable_moisture === 'true')
        productLines.push({
          code: null,
          desc: "Moisture " + parseFloat(vm.Single.moisture_deduction).toFixed(2) + " %",
          unitPrice: onePercentOfTotal,
          qty: { value: moisture, symbol: '%' },
          total: moistureCharge,
          type: 'MC'
        });

      vm.invoice.productLines = productLines;
      vm.invoice.subTotal =
        productLine.total -
        handlingCharge -
        (moistureCharge ? moistureCharge : 0);
      vm.invoice.vat = product.vat ? roundToTwo(vm.invoice.subTotal * parseFloat(product.vat) / 100) : 0;
      vm.invoice.total = vm.invoice.subTotal + vm.invoice.vat;
      vm.invoice.balanceDue = vm.invoice.amountDue = vm.invoice.total;
    };

    function roundToTwo(num) {
      return +(Math.round(num + "e+2") + "e-2");
    }

    var calculateMoistureDeduction = function () {
      var totalWeight = Math.abs(vm.Single.FirstWeight - vm.Single.SecondWeight);
      vm.ReportData.nett = totalWeight ? totalWeight : 0;
      vm.ReportData.moistureDeduction = 0;
      if (vm.Single.SecondWeight > 0 && vm.Single.moisture_deduction > 0)
      {
        var moisturePercentage = vm.Single.moisture_deduction ? parseFloat(vm.Single.moisture_deduction) - vm.Setting.moisture_deduction_level : 0
        if (moisturePercentage > 0)
        {
          vm.ReportData.moistureDeduction = totalWeight * (moisturePercentage / 100);
        }
      }
      vm.ReportData.nett = totalWeight - vm.ReportData.moistureDeduction - vm.ReportData.handlingCharges;
    };

    vm.ReportData.handlingCharges = 0;
    var calculateHandlingCharges = function () {
      var totalWeight = Math.abs(vm.Single.FirstWeight - vm.Single.SecondWeight);
      vm.ReportData.handlingCharges = 0;
      if (vm.Single.SecondWeight > 0 && vm.Single.handling_charges > 0)
      {
        var handlingPercentage = vm.Single.handling_charges ? parseFloat(vm.Single.handling_charges) : 0
        if (handlingPercentage > 0)
        {
          vm.ReportData.handlingCharges = totalWeight * (handlingPercentage / 100);
        }
      };
      vm.ReportData.nett = totalWeight - vm.ReportData.moistureDeduction - vm.ReportData.handlingCharges;
    };

    vm.deleteTransaction = function (transaction) {
      if (!confirm("Are you sure you want to delete the transaction?"))
      {
        return;
      }
      $rootScope.Start();
      Restangular.one("contracttransaction", transaction.id)
        .get()
        .then(function (transactionInfo) {
          transactionInfo.remove().then(
            function () {
              vm.initialize();
            },
            function (response) {
              $rootScope.Error(response);
            }
          );
        });
    };


    vm.reprintTicket = function (data) {
      $rootScope.Start("vm.reprintTicket in ContractTransactionsCtrl");
      vm.ScannedUser = null;
      $scope.Service = Restangular.one(routeName, data.weighing_header_id);
      $scope.Service.customGET("", vm.HeaderSingle).then(
        function (dat) {
          // if there is a contract then
          if (dat.contract_total_amount && dat.contract_total_amount > 0)
          {
            vm.ReportData.Contract = {
              name: dat.contractTransaction.contract.name,
              promised: dat.contract_total_amount,
              delivered:
                dat.contract_total_amount - dat.contract_remaining_amount,
              remaining: dat.contract_remaining_amount
            };
          }

          vm.HeaderSingle.weighing_header = dat.id;
          Restangular.all("weighingtransactions")
            .getList(vm.HeaderSingle)
            .then(
              function (weighingtransactions) {
                vm.Single.weighingtransactions = weighingtransactions;
                var First = weighingtransactions.findIndex(
                  p => p.Status == "1"
                );
                vm.ReportData.First.Weight = parseInt(
                  weighingtransactions[First].WeightTotal
                );
                vm.ReportData.First.Weight1 =
                  weighingtransactions[First].Weight1;
                vm.ReportData.First.Weight2 =
                  weighingtransactions[First].Weight2;
                vm.ReportData.First.Weight3 =
                  weighingtransactions[First].Weight3;
                vm.ReportData.First.Weight4 =
                  weighingtransactions[First].Weight4;
                vm.ReportData.First.Weight5 =
                  weighingtransactions[First].Weight5;
                vm.ReportData.First.Weight6 =
                  weighingtransactions[First].Weight6;
                vm.ReportData.First.WeightDate =
                  weighingtransactions[First].created_at;
                vm.ReportData.First.UserId =
                  weighingtransactions[First].user_id;
                vm.ReportData.First.UserName =
                  weighingtransactions[First].user_name;
                var Second = weighingtransactions.findIndex(
                  p => p.Status == "2"
                );
                vm.ReportData.Second.Weight =
                  Second === -1
                    ? null
                    : parseInt(weighingtransactions[Second].WeightTotal);
                vm.ReportData.Second.Weight1 =
                  Second === -1
                    ? null
                    : parseInt(weighingtransactions[Second].Weight1);
                vm.ReportData.Second.Weight2 =
                  Second === -1
                    ? null
                    : parseInt(weighingtransactions[Second].Weight2);
                vm.ReportData.Second.Weight3 =
                  Second === -1
                    ? null
                    : parseInt(weighingtransactions[Second].Weight3);
                vm.ReportData.Second.Weight4 =
                  Second === -1
                    ? null
                    : parseInt(weighingtransactions[Second].Weight4);
                vm.ReportData.Second.Weight5 =
                  Second === -1
                    ? null
                    : parseInt(weighingtransactions[Second].Weight5);
                vm.ReportData.Second.Weight6 =
                  Second === -1
                    ? null
                    : parseInt(weighingtransactions[Second].Weight6);
                if (Second !== -1)
                  $rootScope.AxelSetups = JSON.stringify(
                    weighingtransactions[Second].AxelSetups
                  );
                vm.ReportData.Second.WeightDate =
                  Second === -1
                    ? null
                    : weighingtransactions[Second].created_at;
                vm.ReportData.Second.UserId =
                  Second === -1 ? null : weighingtransactions[Second].user_id;
                vm.ReportData.Second.UserName =
                  Second === -1 ? null : weighingtransactions[Second].user_name;
                var Verify = weighingtransactions.findIndex(
                  p => p.Status == "V"
                );
                vm.ReportData.Verify.UserId =
                  Verify === -1 ? null : weighingtransactions[Verify].user_id;
                vm.ReportData.Verify.UserName =
                  Verify === -1 ? null : weighingtransactions[Verify].user_name;
                vm.cam = [];
                weighingtransactions.forEach(wow => {
                  wow.Cameras.forEach(c => vm.cam.push(c));
                });
                calculateMoistureDeduction();
                calculateHandlingCharges();
                vm.cam = [];
                weighingtransactions.forEach(wow => {
                  wow.Cameras.forEach(c => vm.cam.push(c));
                });
              },
              function (response) {
                $rootScope.Error(response);
              }
            );
          vm.FormDisplay = true;
          vm.ReadOnly = true;
          vm.Single = dat;
          vm.Single.FirstWeight = parseInt(vm.Single.FirstWeight);
          vm.Single.SecondWeight = parseInt(vm.Single.SecondWeight);
          angular.forEach(dat.weighingLines, function (weighing) {
            if (weighing.Status === "1")
            {
              vm.Single.FirstDate = weighing.created_at
            } else if (weighing.Status === "2")
            {
              vm.Single.SecondDate = weighing.created_at
            }
          });
          vm.Single.actiontype = "Edit";
          vm.SelectOnChange("settings");
          // vm.SelectOnChange("weighbridges");
          vm.SelectOnChange("weighbridge");
          vm.SelectOnChange("haulier");
          Restangular.all("haulier")
            .getList($navigation.get())
            .then(
              function (data) {
                vm.Hauliers = [];
                data.forEach(function (mapData) {
                  vm.Hauliers.push({
                    value: mapData.id,
                    name: mapData.name + " (" + mapData.code + ")",
                    report: mapData.name + " (" + mapData.code + ")" //mapData.code + '<br>' + mapData.name + '<br>'
                  });
                });
                vm.SelectOnChange("haulier");
              },
              function (response) { }
            );
          Restangular.all("businesspartner")
            .getList($navigation.get())
            .then(
              function (data) {
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
                    vat_nr: mapData.vat_nr
                  });
                });
                vm.SelectOnChange("businesspartner");
              },
              function (response) { }
            );
          Restangular.all("product")
            .getList($navigation.get())
            .then(
              function (data) {
                vm.Products = [];
                data.forEach(function (mapData) {
                  vm.Products.push({
                    value: mapData.id,
                    code: mapData.code,
                    name: mapData.name + " (" + mapData.code + ")",
                    report: mapData.name + " (" + mapData.code + ")",
                    purchase_price: mapData.purchase_price,
                    sale_price: mapData.sale_price,
                    vat: mapData.vat
                  });
                });
                vm.SelectOnChange("product");
              },
              function (response) { }
            );

          //vm.SelectOnChange("settings");
          var getType = {};
          vm.finger = $scope.$watch(
            function () {
              return $rootScope.FingerFeedback;
            },
            function (current, original) {
              if (
                current !== original &&
                $rootScope.FingerFeedback.length > 800 &&
                $rootScope.FingerFeedback.indexOf(";") === -1
              )
              {
                vm.userprofile.forEach(function (user) {
                  if (
                    user.fingerprint.substring(1, user.fingerprint.length) ==
                    $rootScope.FingerFeedback.substring(
                      1,
                      user.fingerprint.length
                    )
                  )
                  {
                    $rootScope.WeighFeedback =
                      $rootScope.WeighFeedback +
                      user.firstname +
                      " " +
                      user.lastname +
                      "\n";
                    vm.ScannedUser = user.id;
                  }
                });
              }
            }
          );
          vm.Single.TotalWeight =
            vm.Single.FirstWeight - vm.Single.SecondWeight;
          vm.ReportData.Company = $rootScope.MasterData.find(company => company.id === $rootScope.Params.company_id);

          $rootScope.Loaded("Complete");
        },
        function (response) {
          $rootScope.Error(response);
        }
      );
    };

    vm.goBackToContracts = function () {
      $state.go("app.contract.list", { id: vm.HeaderSingle.site_id });
    };

    vm.print = function () {
      setTimeout(function () {
        window.print();
      }, 100);
    }
    vm.initialize();
  });
