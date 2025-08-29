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