const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

// Sample employees data (replace with real user DB)
const employees = [
  { username: 'admin', password: 'admin123' },
  { username: 'staff1', password: 'staffpass' }
];

// Employee login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = employees.find(emp => emp.username === username && emp.password === password);
  if (user) {
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Patient CRUD APIs
app.post('/patients', (req, res) => {
  const { name, gender, dob, contact_number, address, medical_history } = req.body;
  db.query(
    'INSERT INTO Patients (name, gender, dob, contact_number, address, medical_history) VALUES (?, ?, ?, ?, ?, ?)',
    [name, gender, dob, contact_number, address, medical_history],
    (error, results) => {
      if (error) return res.status(500).json({ error });
      res.json({ id: results.insertId });
    }
  );
});

app.get('/patients', (req, res) => {
  db.query('SELECT * FROM Patients', (error, results) => {
    if (error) return res.status(500).json({ error });
    res.json(results);
  });
});

app.put('/patients/:id', (req, res) => {
  const { address } = req.body;
  db.query(
    'UPDATE Patients SET address = ? WHERE patient_id = ?',
    [address, req.params.id],
    (error, results) => {
      if (error) return res.status(500).json({ error });
      res.json({ updated: results.affectedRows });
    }
  );
});

app.delete('/patients/:id', (req, res) => {
  db.query(
    'DELETE FROM Patients WHERE patient_id = ?',
    [req.params.id],
    (error, results) => {
      if (error) return res.status(500).json({ error });
      res.json({ deleted: results.affectedRows });
    }
  );
});

// Endpoint to get all doctors
app.get('/doctors', (req, res) => {
  db.query('SELECT * FROM Doctors', (error, results) => {
    if (error) return res.status(500).json({ error });
    res.json(results);
  });
});

// Endpoint to get available time slots for a doctor on a date
app.get('/available-slots', (req, res) => {
  const { doctor_id, appointment_date } = req.query;
  if (!doctor_id || !appointment_date) {
    return res.status(400).json({ error: 'doctor_id and appointment_date are required' });
  }

  // Define possible time slots (customize as needed)
  const allSlots = [
    "09:00:00", "09:30:00", "10:00:00", "10:30:00",
    "11:00:00", "11:30:00", "14:00:00", "14:30:00",
    "15:00:00", "15:30:00", "16:00:00", "16:30:00"
  ];

  // Query booked slots for doctor and date
  db.query(
    `SELECT appointment_time FROM Appointments 
     WHERE doctor_id = ? AND appointment_date = ? AND status = 'Scheduled'`,
    [doctor_id, appointment_date],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      const bookedSlots = results.map(r => r.appointment_time);
      const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
      res.json({ availableSlots });
    }
  );
});

// Appointment booking - patient dynamic creation if needed
app.post('/appointments', (req, res) => {
  const { patient_name, contact_number, doctor_id, appointment_date, appointment_time, status } = req.body;

  db.query(
    'SELECT patient_id FROM Patients WHERE name = ? AND contact_number = ?',
    [patient_name, contact_number],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      let patientIdPromise;

      if (results.length > 0) {
        patientIdPromise = Promise.resolve(results[0].patient_id);
      } else {
        patientIdPromise = new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO Patients (name, contact_number) VALUES (?, ?)',
            [patient_name, contact_number],
            (err2, result2) => {
              if (err2) reject(err2);
              else resolve(result2.insertId);
            }
          );
        });
      }

      patientIdPromise
        .then((patient_id) => {
          db.query(
            'INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_date, appointment_time, status],
            (err3, result3) => {
              if (err3) return res.status(500).json({ error: err3.message });
              res.json({ appointmentId: result3.insertId });
            }
          );
        })
        .catch((error) => {
          res.status(500).json({ error: error.message });
        });
    }
  );
});

app.delete('/patients/:id', (req, res) => {
  db.query(
    'DELETE FROM Patients WHERE patient_id = ?',
    [req.params.id],
    (error, results) => {
      if (error) return res.status(500).json({ error });
      res.json({ deleted: results.affectedRows });
    }
  );
});


app.listen(3000, () => console.log('Server running on http://localhost:3000'));
