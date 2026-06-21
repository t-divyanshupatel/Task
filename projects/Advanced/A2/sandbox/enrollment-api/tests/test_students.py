def test_register_student_returns_201(client):
    response = client.post(
        "/students",
        json={
            "full_name": "Ada Lovelace",
            "email": "ada@uni.edu",
            "program": "CS",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Ada Lovelace"
    assert data["email"] == "ada@uni.edu"
    assert data["program"] == "CS"
    assert "id" in data
    assert "registered_at" in data


def test_duplicate_email_returns_409(client):
    payload = {
        "full_name": "Ada Lovelace",
        "email": "duplicate@uni.edu",
        "program": "CS",
    }
    assert client.post("/students", json=payload).status_code == 201
    assert client.post("/students", json=payload).status_code == 409


def test_list_students_returns_array(client):
    response = client.get("/students")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
