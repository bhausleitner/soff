export function openErpQuoteUrl(
  erpQuoteUrl: string,
  erpPurchaseOrderId: number
) {
  return window.open(
    `${erpQuoteUrl?.replace("{customId}", erpPurchaseOrderId.toString())}`,
    "_blank"
  );
}

export function openErpContactUrl(erpContactUrl: string, erpContactId: number) {
  return window.open(
    `${erpContactUrl?.replace("{customId}", erpContactId.toString())}`,
    "_blank"
  );
}
