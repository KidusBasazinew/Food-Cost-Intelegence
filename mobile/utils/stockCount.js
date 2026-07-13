export function calculateVariance(systemQuantity, physicalQuantity) {
  const varianceQuantity =
    Math.round((physicalQuantity - systemQuantity) * 100) / 100;
  const variancePercentage =
    systemQuantity > 0
      ? Math.round((varianceQuantity / systemQuantity) * 1000) / 10
      : 0;
  return { varianceQuantity, variancePercentage };
}
