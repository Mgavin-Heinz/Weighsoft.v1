angular.module('xenon.controllers').filter("TwoOrFourDigits", twoOrFourDigitFilter);
twoOrFourDigitFilter.$inject = ['$filter'];

function twoOrFourDigitFilter($filter){

    return function(input){
        // Ensure that the passed in data is a number
        if(!isNaN(input)) {
            if(input < 10)
                return $filter('number')(input, 4);
            else
                return $filter('number')(input, 2);
        }
        else{
            return input;
        }
    }
};
