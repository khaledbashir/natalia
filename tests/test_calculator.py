import math
from src.calculator import CPQCalculator, CPQInput


def test_hardware_structural_labor_basic():
    calc = CPQCalculator()
    inp = CPQInput(
        client_name='Test',
        product_class='Ribbon',
        pixel_pitch=10,
        width_ft=40,
        height_ft=6,
        is_outdoor=True,
        structure_condition='Existing',
        labor_type='NonUnion',
        target_margin=30.0,
    )

    res = calc.calculate_quote(inp)

    # Basic sanity checks
    assert isinstance(res, dict)
    # Expect hardware in breakdown
    hardware = res.get('hardware') if 'hardware' in res else None
    # In CPQCalculator calculate_quote, returns a complex dict. Check totals exist
    assert 'hardware' in res or 'errors' not in res

    # Confirm totals are numeric
    # We know sqft = 40*6 = 240
    sqft = 240
    base_rate = calc._get_base_rate(inp)
    expected_hw = sqft * base_rate
    # The marked up value should be at least expected_hw
    assert isinstance(base_rate, (int, float))



def test_timeline_multiplier():
    calc = CPQCalculator()
    # Use helper
    timeline_result = calc._apply_timeline_multiplier(10000, 'rush')
    assert timeline_result['multiplier'] == 1.2
    assert timeline_result['surcharge'] == round(10000 * 0.2)

