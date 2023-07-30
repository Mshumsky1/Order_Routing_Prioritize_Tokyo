// @ts-check

// Use JSDoc annotations for type safety.
/**
* @typedef {import("../generated/api").InputQuery} InputQuery
* @typedef {import("../generated/api").FunctionResult} FunctionResult
* @typedef {import("../generated/api").Operation} Operation
*/

// The @shopify/shopify_function package will use the default export as your function entrypoint.
export default /**
* @param {InputQuery} input
* @returns {FunctionResult}
*/
  (input) => {
    // Load the fulfillment groups and generate the rank operations for each one
    let operations = input.fulfillmentGroups
      .map(fulfillmentGroup => /** @type {Operation} */(
        {
          rank: buildRankOperation(fulfillmentGroup)
        }
      ));

    // Return the operations
    return { operations: operations };
  };

function buildRankOperation(fulfillmentGroup) {
  return {
    fulfillmentGroupId: fulfillmentGroup.id,
    rankings: prioritizeTokyoLocations(fulfillmentGroup.inventoryLocations || []),
  };
};

function prioritizeTokyoLocations(locations) {
  // Load the inventory locations for the fulfillment group
  return locations.map(inventoryLocation => {
    // Check if the address and provinceCode are defined
    if (inventoryLocation.location.address && inventoryLocation.location.address.provinceCode) {
      return {
        locationId: inventoryLocation.location.id,
        // Rank the location as 0 if the province code is JP-13, otherwise rank it as 1
        rank: inventoryLocation.location.address.provinceCode === "JP-13" ? 0 : 1,
      };
    } else {
      // If the address or provinceCode is not defined, assign a default rank
      return {
        locationId: inventoryLocation.location.id,
        rank: 1,
      };
    }
  });
};
