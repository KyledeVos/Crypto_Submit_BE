/**
 * Simple String check for undefined or empty. Does NOT perform full validation and should not be used as such
 * @param stringValue string to be validated
 * @returns boolean for valid or not
 */
export const simpleStringValidator = (stringValue: string):boolean => {
    if(!stringValue || stringValue === undefined || typeof stringValue !== "string" || stringValue.trim() === ""){
        return false
    }
    return true;
}

/**
 * Simple integer check for undefined or not valid int. Does NOT perform full validation and should not be used as such
 * @param integerValue int to be validated
 * @param negativeAllowed -> default false - trigger only positive checks
 * @returns boolean for valid or not
 */
export const simpleIntegerValidator = (integerValue: number, onlyPositive: boolean = false ):boolean => {
    if(!integerValue || integerValue === undefined || typeof integerValue !== "number"){
        return false
    }else if(Number.isNaN(integerValue) || !Number.isInteger(integerValue)){
        return false
    }else if(onlyPositive === true && integerValue < 0){
        return false
    }
    return true;
}