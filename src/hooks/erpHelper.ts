export function openErpQuoteUrl(
  erpQuoteUrl: string,
  erpPurchaseOrderId: number
) {
  return window.open(
    `${erpQuoteUrl?.replace("{customId}", erpPurchaseOrderId.toString())}`,
    "_blank"
  );
}
