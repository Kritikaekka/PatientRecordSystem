const backendUrl = 'https://patientrecordsystem-1.onrender.com';

// Fetch and display patients
function loadPatients() {
  fetch(`${backendUrl}/patients`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#patientsTable tbody');
      tbody.innerHTML = '';
      data.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${p.patient_id}</td>
          <td>${p.name}</td>
          <td>${p.gender}</td>
          <td>${p.dob}</td>
          <td>${p.contact_number}</td>
          <td>${p.address}</td>
          <td>${p.medical_history}</td>
          <td><button onclick="deletePatient(${p.patient_id})">Delete</button></td>
        `;
        tbody.appendChild(row);
      });
    });
}

// Handle new patient form submission
document.getElementById('patientForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const patientData = {
    name: document.getElementById('name').value,
    gender: document.getElementById('gender').value,
    dob: document.getElementById('dob').value,
    contact_number: document.getElementById('contact_number').value,
    address: document.getElementById('address').value,
    medical_history: document.getElementById('medical_history').value,
  };

  fetch(`${backendUrl}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  })
    .then(res => res.json())
    .then(() => {
      this.reset();
      loadPatients();
    });
});

// Delete patient
function deletePatient(id) {
  fetch(`${backendUrl}/patients/${id}`, {
    method: 'DELETE',
  }).then(() => loadPatients());
}

// Initial load
loadPatients();

function deletePatient(id) {
  fetch(`${backendUrl}/patients/${id}`, {
    method: 'DELETE'
  })
  .then(res => res.json())
  .then(data => {
    // optionally check 'data.deleted' and reload the table
    loadPatients(); // refresh the list after deletion
  });
}

