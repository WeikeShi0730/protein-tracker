function formatScaledNumber(value: number) {
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/\.?0+$/, '');
}

export function scaleServingUnit(servingUnit: string, servings: number) {
  if (!Number.isFinite(servings) || servings <= 0) return servingUnit;

  return servingUnit.replace(/\d*\.?\d+/g, (match) => {
    const value = Number.parseFloat(match);
    if (Number.isNaN(value)) return match;
    return formatScaledNumber(value * servings);
  });
}
