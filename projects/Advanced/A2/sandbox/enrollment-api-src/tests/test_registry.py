def test_registry_summary_counts(client):
    student = client.post(
        "/students",
        json={
            "full_name": "Alan Turing",
            "email": "alan@uni.edu",
            "program": "Math",
        },
    ).json()
    client.post(
        "/enrollments",
        json={
            "student_id": student["id"],
            "course_code": "MATH201",
            "term": "2026-FALL",
        },
    )

    response = client.get("/registry/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["student_count"] == 1
    assert data["enrollment_count"] == 1
