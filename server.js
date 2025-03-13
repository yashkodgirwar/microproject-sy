const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { jsPDF } = require("jspdf"); // Import jsPDF

// Initialize Express app first
const app = express();
const PORT = process.env.PORT || 3000;

// Add CORS middleware
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bloodlink', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define a User schema
const userSchema = new mongoose.Schema({
    type: String,
    name: String,
    email: String,
    password: String,
    address: String,
    licenseNumber: String
});

// Create a User model
const User = mongoose.model('User', userSchema);

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});



app.post('/register', async (req, res) => {
    try {
        const { type, name, email, password, address, licenseNumber } = req.body;
        
        // Check if user already exists
        const existingUser  = await User.findOne({ email });
        if (existingUser ) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser  = new User({
            type,
            name,
            email,
            password: hashedPassword,
            address,
            licenseNumber
        });

        // Save to database
        await newUser .save();
        res.status(201).json({ message: 'Registration successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
app.get('/hospitals', async (req, res) => {
    try {
        const hospitals = await User.find({ type: "hospital" });
        res.json(hospitals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/bloodbanks', async (req, res) => {
    try {
        const bloodbanks = await User.find({ type: "bloodbank" });
        res.json(bloodbanks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// const billSchema = new mongoose.Schema({
//     hospitalId: mongoose.Schema.Types.ObjectId, // Link to hospital
//     amount: Number,
//     date: { type: Date, default: Date.now }
// });
// const Bill = mongoose.model("Bill", billSchema);



// ✅ Generate Bill for a Hospital
// app.post('/generate-bill', async (req, res) => {
//     try {
//         const { hospitalId, amount } = req.body;

//         const hospital = await User.findById(hospitalId);
//         if (!hospital) {
//             return res.status(404).json({ message: "Hospital not found" });
//         }

//         const newBill = new Bill({ hospitalId, amount });
//         await newBill.save();

//         res.status(201).json({ message: "Bill generated successfully!", bill: newBill });
//     } catch (error) {
//         console.error("Error generating bill:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// // ✅ Get All Bills for a Specific Hospital
// app.get('/billing/:hospitalId', async (req, res) => {
//     try {
//         const hospitalId = req.params.hospitalId;
//         const bills = await Bill.find({ hospitalId });

//         if (bills.length === 0) {
//             return res.status(404).json({ message: "No bills found for this hospital." });
//         }

//         res.json(bills);
//     } catch (error) {
//         console.error("Error fetching billing data:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// // ✅ Generate & Download Bill PDF
// app.get('/download-bill/:billId', async (req, res) => {
//     try {
//         const bill = await Bill.findById(req.params.billId);
//         if (!bill) {
//             return res.status(404).json({ message: "Bill not found" });
//         }

//         const hospital = await User.findById(bill.hospitalId);
//         if (!hospital) {
//             return res.status(404).json({ message: "Hospital not found" });
//         }

//         // Generate PDF using jsPDF
//         const doc = new jsPDF();
//         doc.text("Monthly Billing Statement", 20, 20);
//         doc.text(`Hospital Name: ${hospital.name}`, 20, 30);
//         doc.text(`Address: ${hospital.address}`, 20, 40);
//         doc.text(`Billing Amount: ₹${bill.amount}`, 20, 50);
//         doc.text(`Date: ${new Date(bill.date).toLocaleDateString()}`, 20, 60);

//         const pdfBuffer = doc.output("arraybuffer");

//         res.setHeader("Content-Type", "application/pdf");
//         res.setHeader("Content-Disposition", `attachment; filename=bill_${bill._id}.pdf`);
//         res.send(Buffer.from(pdfBuffer));
//     } catch (error) {
//         console.error("Error generating bill:", error);
//         res.status(500).json({ message: "Error generating bill" });
//     }
// });



// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});