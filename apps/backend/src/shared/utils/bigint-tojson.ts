/**
 * Ensures that BigInt values are properly serialized to JSON.
 *
 * In modern browsers, the BigInt type is not serialized to JSON by default.
 * This causes issues when sending BigInt values over the network, as the JSON
 * serialization process will omit them.
 *
 * To work around this limitation, we define a custom toJSON() method for
 * BigInt values. This method simply returns the string representation of the
 * BigInt value.
 *
 * @param this - The BigInt value to serialize.
 * @returns The string representation of the BigInt value.
 */

Object.defineProperty(BigInt.prototype, 'toJSON', {
  value: function toJSON(this: bigint) {
    return Number(this.toString());
  },
});
