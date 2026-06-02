angular.module('xenon.controllers').directive("ticketPrint", TicketPrint);

function TicketPrint(){
    return {
        restrict: 'E',
        template: '<div ng-include="getTemplateUrl()"></div>',
        scope: {
            site: '=',
            setting: '=',
            reportData: '=',
            weighingHeader: '=',
            axelSetups: '=',
            cameras: '='
        },
        link: function (scope) {
            scope.getTemplateUrl = function () {
                if (scope.setting && scope.setting.ticket_template === 'thermal') {
                    return appHelper.templatePath("print/receipt.tpl");
                }

                return appHelper.templatePath("print/ticket.tpl");
            };
        }
    };
}