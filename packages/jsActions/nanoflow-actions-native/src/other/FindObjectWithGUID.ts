// This file was generated by Mendix Studio Pro.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the import list
// - the code between BEGIN USER CODE and END USER CODE
// - the code between BEGIN EXTRA CODE and END EXTRA CODE
// Other code you write will be lost the next time you deploy the project.

// BEGIN EXTRA CODE
// END EXTRA CODE

/**
 * @param {MxObject[]} list
 * @param {string} objectGUID
 * @returns {Promise.<MxObject>}
 */
export async function FindObjectWithGUID(
    list: mendix.lib.MxObject[],
    objectGUID: string
): Promise<mendix.lib.MxObject | undefined> {
    // BEGIN USER CODE

    console.log("Found list: " + list);
    return list.find(element => element.getGuid() === objectGUID);

    // END USER CODE
}
