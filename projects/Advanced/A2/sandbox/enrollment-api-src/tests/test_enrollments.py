def test_create_enrollment_returns_201(client):
    student = client.post(
        "/students",
        json={
            "full_name": "Grace Hopper",
            "email": "grace@uni.edu",
            "program": "CS",
        },
    ).json()

    response = client.post(
        "/enrollments",
        json={"student_id": student["id"], "course_code": "CS101", "term": "2026-FALL"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["student_id"] == student["id"]
    assert data["course_code"] == "CS101"
    assert data["term"] == "2026-FALL"


def test_enrollment_unknown_student_returns_404(client):
    response = client.post(
        "/enrollments",
        json={"student_id": 9999, "course_code": "CS101", "term": "2026-FALL"},
    )
    assert response.status_code == 404


def test_list_enrollments_returns_array(client):
    response = client.get("/enrollments")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
