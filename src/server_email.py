import os
import json
from pathlib import Path

def send_proposal_to_outbox(recipient_email: str, files: list, metadata: dict = None):
    outbox = Path('outbox')
    outbox.mkdir(exist_ok=True)
    ts = __import__('datetime').datetime.utcnow().strftime('%Y%m%d%H%M%S')
    name = outbox / f'email_{recipient_email.replace("@","_at_")}_{ts}.json'
    payload = {
        'to': recipient_email,
        'files': files,
        'metadata': metadata or {},
        'timestamp': ts,
    }
    with name.open('w') as f:
        json.dump(payload, f, indent=2)
    return str(name)
