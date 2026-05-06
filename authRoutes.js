const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // To generate reset token
const nodemailer = require("nodemailer"); // To send reset emails
const { Pool } = require("pg");

const router = express.Router();

// this code is used for changing password from hash to plan text here is sql entry 
// UPDATE users SET password = 'new_hashed_password_here' WHERE email = 'you@example.com'

// // const newPassword = 'yourNewPassword';
// // bcrypt.hash(newPassword, 10).then(console.log); // this will log the new hash
// bcrypt.hash(newPassword,10).then(console.log);//this will log the new hash function to the server then it will convert into hash function.

const pool = new Pool({
  host: "dpg-d751rqadbo4c73954s0g-a.singapore-postgres.render.com",
  user: "database_h3vo_user",
  port: 5432,
  password: "KZpmmayzsDgVmoBkMP082AigcOXpoMKD",// Set your actual DB password
  database: "database_h3vo",
  ssl: {
    rejectUnauthorized: false,// Required for many cloud-hosted PostgreSQL providers
  },
//******CONVERT THE PLAIN TEXT TO HASH FUNCTION*********************
// const password = "****************"; // plain text password
// const saltRounds = 10; // cost factor (same as $2a$10$)

// async function hashPassword() {
//   const hash = await bcrypt.hash(password, saltRounds);
//   console.log("Hashed Password:", hash);
// }

// hashPassword();
//**************************************and change in database*************

// Use a strong secret key in production
const EMAIL_USER = "souldevil098@gmail.com"; // Your email for sending
const EMAIL_PASS = "vexo tfvb tshy rajp"; // Your email password

const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail as the email provider
  auth: {
    user: EMAIL_USER, // Your Gmail
    pass: EMAIL_PASS,  // Use the app password here
  },
});
// Email transport configuration
// const sendOTPEmail = async (toEmail, otp) => {
//   const mailOptions = {
//     from: EMAIL_USER, // Always use your email here
//     to: "souldevil098@gmail.com", // Recipient's email
//     subject: "Your OTP for Verification",
//     text: `Your Signup Otp is : ${otp}. It is valid for 10 minutes.`,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully:", info.response);
//     return { success: true, message: "OTP sent successfully" };
//   } catch (error) {
//     console.error("Error sending OTP email:", error);
//     return { success: false, message: "Failed to send OTP" };
//   }
// };

// Example usage
// const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
// sendOTPEmail("recipient@example.com", otp) // Replace with recipient's email
//   .then((response) => console.log(response))
//   .catch((error) => console.error(error));




// Signup Route

/* With hashed password protection router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});*/
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Insert the user with plain text password
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, password]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route 

//  With hashed password protection 
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.rows[0].id }, EMAIL_PASS, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user.rows[0].id, name: user.rows[0].name });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// router.post("/auth/logins", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Query the database for the user by email
//     const user = await pool.query("SELECT * FROM users WHERE email = $1", [
//       email,
//     ]);

//     // Check if the user exists
//     if (user.rows.length === 0) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     // Compare the plain text password directly
//     if (user.rows[0].password !== password) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Generate a token
//     const token = jwt.sign({ userId: user.rows[0].id }, EMAIL_PASS, {
//       expiresIn: "1h",
//     });

//     // Send response
//     res.json({ token, userId: user.rows[0].id, name: user.rows[0].name });
//   } catch (error) {
//     console.error("Error during login:", error.message);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// *****************************************************************************
router.post("/auth/verify-otp", async (req, res) => {
  const { email, otp, name, password } = req.body;
  const storedOtp = otpStore.get(email);

  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  try {
    // const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [name, email, password]
    );

    const token = jwt.sign({ userId: result.rows[0].id }, "your_secret_key", { expiresIn: "1h" });
    otpStore.delete(email);

    res.json({ message: "Signup successful!", token });
  } catch (error) {
    res.status(500).json({ message: "Error registering user.", error });
  }
});
router.post("/auth/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = generateOtp();
  otpStore.set(email, otp);

  const mailOptions = {
    from: "your_official_email@gmail.com",
    to: email,
    subject: "Your OTP for Signup",
    text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully." });
    setTimeout(() => otpStore.delete(email), 300000); // Remove OTP after 5 min
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP.", error });
  }
});


// Forgot Password Route
// Forgot Password Route with OTP generation
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a 6-digit OTP and expiration time
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
    const otpExpires = Date.now() + 3600000; // OTP valid for 1 hour

    // Update user with OTP and expiration
    await pool.query(
      "UPDATE users SET otp = $1, otp_expiration = $2 WHERE email = $3",
      [otp, otpExpires, email]
    );

    // Send OTP via email
    const mailOptions = {
      from: "souldevil098@gmail.com",
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It is valid for 1 hour.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending OTP email:", err);
        return res.status(500).json({ message: "Error sending OTP email" });
      }
      res.json({ message: "OTP sent successfully to your email" });
    });
  } catch (error) {
    console.error("Error in forgot-password route:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset Password Route
// Verify OTP and Reset Password Route
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Check if user exists and if the OTP is valid
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND otp = $2 AND otp_expiration > $3",
      [email, otp, Date.now()]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and remove the OTP
    await pool.query(
      "UPDATE users SET password = $1, otp = NULL, otp_expiration = NULL WHERE email = $2",
      [hashedPassword, email]
    );

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error during password reset:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// In your authRoutes.js or similar
router.post('/user-login', async (req, res) => {
  const { mobile_number, dob } = req.body;

  try {
    const result = await db.query(
      'SELECT * FROM user_credentials WHERE mobile_number = $1 AND dob = $2',
      [mobile_number, dob]
    );

    if (result.rows.length > 0) {
      // Login successful
      res.status(200).json({ message: 'Login successful' });
    } else {
      // Invalid credentials
      res.status(401).json({ message: 'Invalid mobile number or password' });
    }
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});




// Middleware to protect routes


// Verify OTP and Reset Password
router.post("/verify-otp", async (req, res) => {
  const { otp, newPassword, email } = req.body;

  try {
    // Find the user with the email and check if OTP matches and is still valid
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND otp = $2 AND otp_expiration > $3",
      [email, otp, Date.now()]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password
    // const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the OTP and expiration fields
    await pool.query(
      "UPDATE users SET password = $1, otp = NULL, otp_expiration = NULL WHERE email = $2",
      [password, email]
    );

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error during OTP verification:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
