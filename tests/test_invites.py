from src.database import SessionLocal, init_db, Organization, create_invite, consume_invite


def test_invite_lifecycle():
    # Ensure DB initialized
    init_db()
    db = SessionLocal()

    # Create an organization
    org = Organization(name='TestOrg')
    db.add(org)
    db.commit()
    db.refresh(org)

    # Create invite
    invite = create_invite(db, 'test@example.com', org.id, role='member', ttl_days=1)
    assert invite.token is not None
    assert invite.email == 'test@example.com'

    # Consume invite
    got = consume_invite(db, invite.token)
    assert got is not None
    assert got.email == 'test@example.com'

    # Clean up
    db.delete(got)
    db.delete(org)
    db.commit()
    db.close()
