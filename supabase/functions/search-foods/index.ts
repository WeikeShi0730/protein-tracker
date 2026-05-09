type FdcFoodNutrient = {
  nutrientId?: number;
  nutrientName?: string;
  nutrientNumber?: string;
  unitName?: string;
  value?: number;
};

type FdcFood = {
  fdcId: number;
  description?: string;
  brandOwner?: string;
  brandName?: string;
  dataType?: string;
  foodCategory?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients?: FdcFoodNutrient[];
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEIGHT_UNITS = new Set([
  'g',
  'gr',
  'gm',
  'gms',
  'gram',
  'grams',
  'grm',
  'grms',
  'oz',
  'ozs',
  'onz',
  'oza',
  'ozav',
  'ounce',
  'ounces',
  'lb',
  'lbd',
  'lbs',
  'pound',
  'pounds',
  'kg',
  'kgs',
  'kilogram',
  'kilograms',
  'milligram',
  'milligrams',
  'mg',
]);

function nutrientValue(food: FdcFood, nutrientIds: number[], names: string[]) {
  const nutrients = food.foodNutrients ?? [];
  const match = nutrients.find((nutrient) => {
    const nutrientName = nutrient.nutrientName?.toLowerCase() ?? '';
    return (
      nutrientIds.includes(nutrient.nutrientId ?? -1) ||
      names.some((name) => nutrientName === name || nutrientName.includes(name))
    );
  });

  return typeof match?.value === 'number' ? match.value : null;
}

function isWeightServing(food: FdcFood) {
  const unit = food.servingSizeUnit?.trim().toLowerCase();
  return !!unit && WEIGHT_UNITS.has(unit);
}

function householdServing(food: FdcFood) {
  return food.householdServingFullText?.trim() || null;
}

function isWeightOnlyText(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[.,]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');

  if (!normalized) return false;

  const weightTokenPattern = Array.from(WEIGHT_UNITS).sort((a, b) => b.length - a.length).join('|');
  const numberPattern = String.raw`(?:\d+(?:\.\d+)?|\d+\/\d+|\d+\s+\d+\/\d+)`;
  const singleWeightPattern = new RegExp(String.raw`^${numberPattern}\s*(?:${weightTokenPattern})$`);
  const combinedWeightPattern = new RegExp(
    String.raw`^(?:${numberPattern}\s*(?:${weightTokenPattern})\s*)+$`
  );

  return singleWeightPattern.test(normalized) || combinedWeightPattern.test(normalized);
}

function isWeightOnlyServing(food: FdcFood) {
  const household = householdServing(food);
  return isWeightServing(food) && (!household || isWeightOnlyText(household));
}

function servingMultiplier(food: FdcFood) {
  if (isWeightOnlyServing(food)) return 1;

  const size = food.servingSize;
  if (size && size > 0) return size / 100;

  return 1;
}

function servingUnit(food: FdcFood) {
  const household = householdServing(food);
  if (isWeightOnlyServing(food)) return '100g';
  if (household) return household;
  if (food.servingSize && food.servingSizeUnit) return `${food.servingSize}${food.servingSizeUnit}`;
  return '100g';
}

function normalizeFood(food: FdcFood) {
  const caloriesPer100 = nutrientValue(food, [1008], ['energy']);
  const proteinPer100 = nutrientValue(food, [1003], ['protein']);

  if (caloriesPer100 === null || proteinPer100 === null) return null;

  const multiplier = servingMultiplier(food);
  const brand = food.brandOwner ?? food.brandName ?? null;
  const name = [brand, food.description].filter(Boolean).join(' - ');

  return {
    id: `usda-${food.fdcId}`,
    source: 'USDA',
    sourceId: String(food.fdcId),
    name: name || food.description || 'USDA food',
    brand,
    category: food.foodCategory || food.dataType || 'Online',
    serving_unit: servingUnit(food),
    calories_per_serving: Math.round(caloriesPer100 * multiplier),
    protein_per_serving: Math.round(proteinPer100 * multiplier * 10) / 10,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('USDA_FDC_API_KEY');
    if (!apiKey) {
      return Response.json(
        { error: 'USDA_FDC_API_KEY is not configured.' },
        { status: 500, headers: corsHeaders }
      );
    }

    const { query } = await req.json();
    const trimmed = typeof query === 'string' ? query.trim() : '';

    if (trimmed.length < 2) {
      return Response.json({ foods: [] }, { headers: corsHeaders });
    }

    const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search');
    url.searchParams.set('api_key', apiKey);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: trimmed,
        pageSize: 12,
        dataType: ['Foundation', 'SR Legacy', 'Survey (FNDDS)', 'Branded'],
      }),
    });

    if (!response.ok) {
      return Response.json(
        { error: `USDA search failed with status ${response.status}.` },
        { status: response.status, headers: corsHeaders }
      );
    }

    const payload = await response.json();
    const foods = (payload.foods ?? [])
      .map(normalizeFood)
      .filter(Boolean)
      .slice(0, 8);

    return Response.json({ foods }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Online food search failed.' },
      { status: 500, headers: corsHeaders }
    );
  }
});
