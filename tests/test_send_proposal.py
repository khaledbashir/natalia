from fastapi.testclient import TestClient
from src.server import app

client = TestClient(app)


def test_send_proposal():
    payload = {
        'client_name': 'Test Co',
        'recipient_email': 'client@example.com',
        'screens': [
            {'product_class': 'Ribbon', 'pixel_pitch': 10, 'width_ft': 40, 'height_ft': 6, 'is_outdoor': True}
        ]
    }

    r = client.post('/api/send-proposal', json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data['status'] == 'sent'
    assert 'outbox' in data
