/**
 * The one switch that opens or closes the public storefront.
 *
 *   false = SUNSET. The product page and the delivery form show the "orders are closed" page and no
 *           new orders can be placed. The admin, login and existing order links keep working.
 *   true  = the storefront takes orders as normal.
 *
 * To reopen the shop, change this to true and push.
 */
export const STOREFRONT_OPEN = false;
