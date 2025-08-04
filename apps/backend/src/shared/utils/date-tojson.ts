/**
 * Ensures that Date values are properly serialized to JSON.
 *
 * In modern browsers, the Date type is not serialized to JSON by default.
 * This causes issues when sending Date values over the network, as the JSON
 * serialization process will omit them.
 *
 * To work around this limitation, we define a custom toJSON() method for
 * Date values. This method simply returns the ISO representation of the
 * Date value, taking into account the Brazilian timezone.
 *
 * @param this - The Date value to serialize.
 * @returns The ISO representation of the Date value.
 */
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const timeZone = 'America/Sao_Paulo';

Object.defineProperty(Date.prototype, 'toJSON', {
  value: function toJSON(this: Date) {
    const zonedTime = toZonedTime(this, timeZone);
    return format(zonedTime, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
  },
});
