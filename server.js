const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Admin Password
const ADMIN_PASSWORD = "admin";

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files from root

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Database Initialization
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            membership_no TEXT UNIQUE,
            title TEXT,
            fullName TEXT,
            guardianName TEXT,
            dob TEXT,
            bloodGroup TEXT,
            gotra TEXT,
            occupation TEXT,
            education TEXT,
            domicile TEXT,
            permanentAddress TEXT,
            officeAddress TEXT,
            houseType TEXT,
            mobileNumber TEXT,
            emailId TEXT,
            familyDetails TEXT,
            transactionId TEXT,
            utrNo TEXT,
            bankAccountName TEXT,
            applicantPhoto TEXT,
            applicantSignature TEXT,
            paymentScreenshot TEXT,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Helper to generate Membership No
function generateMembershipNo() {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM members', (err, row) => {
            if (err) reject(err);
            const count = row.count + 1;
            const year = new Date().getFullYear();
            resolve(`ASS-${year}-${String(count).padStart(4, '0')}`);
        });
    });
}

// API: Submit Form
app.post('/api/submit-form', upload.fields([
    { name: 'applicantPhoto', maxCount: 1 },
    { name: 'applicantSignature', maxCount: 1 },
    { name: 'paymentScreenshot', maxCount: 1 }
]), async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;

        const membershipNo = await generateMembershipNo();

        const applicantPhoto = files['applicantPhoto'] ? files['applicantPhoto'][0].path : null;
        const applicantSignature = files['applicantSignature'] ? files['applicantSignature'][0].path : null;
        const paymentScreenshot = files['paymentScreenshot'] ? files['paymentScreenshot'][0].path : null;

        const sql = `INSERT INTO members (
            membership_no, title, fullName, guardianName, dob, bloodGroup, gotra, occupation, 
            education, domicile, permanentAddress, officeAddress, houseType, mobileNumber, 
            emailId, familyDetails, transactionId, utrNo, bankAccountName, 
            applicantPhoto, applicantSignature, paymentScreenshot
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            membershipNo, data.title, data.fullName, data.guardianName, data.dob, data.bloodGroup, data.gotra, data.occupation,
            data.education, data.domicile, data.permanentAddress, data.officeAddress, data.houseType, data.mobileNumber,
            data.emailId, data.familyDetails, data.transactionId, data.utrNo, data.bankAccountName,
            applicantPhoto, applicantSignature, paymentScreenshot
        ];

        db.run(sql, params, function(err) {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(500).json({ error: "Failed to save data" });
            }
            res.json({ success: true, membershipNo, message: "Application submitted successfully!" });
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Admin Authentication Middleware
function authenticateAdmin(req, res, next) {
    const password = req.headers['authorization'];
    if (password === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// API: Get All Members (Admin Only)
app.get('/api/admin/members', authenticateAdmin, (req, res) => {
    db.all("SELECT * FROM members ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ members: rows });
    });
});

// API: Update Member Status (Admin Only)
app.post('/api/admin/members/:id/status', authenticateAdmin, (req, res) => {
    const { status } = req.body;
    db.run("UPDATE members SET status = ? WHERE id = ?", [status, req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, message: `Status updated to ${status}` });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
