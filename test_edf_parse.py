from charge_calculator import parse_file, calculate_charge

def test_parse_edf_basic():
    cycles = parse_file('222-23-40.edf')
    assert len(cycles) >= 1
    c1 = cycles[0]
    assert 'steps' in c1 and len(c1['steps']) >= 1
    first_step = c1['steps'][0]
    assert len(first_step['dp']) > 0
    # charge should integrate current * dt (constant current approximate for first 10 points)
    q = calculate_charge(first_step['dp'][:10])
    assert q != 0
