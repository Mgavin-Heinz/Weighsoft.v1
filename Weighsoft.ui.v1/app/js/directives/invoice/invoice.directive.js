angular.module('xenon.controllers').directive("invoicePrint", InvoicePrint);

function InvoicePrint(){
    return {
        restrict: 'E',
        templateUrl: appHelper.templatePath("print/invoice.tpl"),
        scope: {
            invoice: '=',
            reportData: '=',
            single: '=',
            setting: '='
        },
        link: function(scope, el, attr){
            scope.todayDate = new Date();
        }
    }
}