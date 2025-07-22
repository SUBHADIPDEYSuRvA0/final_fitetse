const SibApiV3Sdk = require('sib-api-v3-sdk');
const User = require("../../model/user");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// Load Brevo API Key from environment
const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.error("❌ Missing Brevo API key (EMPLOYEE_API_KEY) in .env");
  throw new Error("Missing Brevo API Key");
}

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = apiKey;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sender = {
  email: 'verification@cozyhomestays.com',
  name: 'fITSE EMPLOYEE',
};

// Generate 4-character alias from name
function generateAlias(name) {
  return name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 4);
}

exports.addEmployee = async (req, res) => {
  try {
    const { name, email, phone, employeetype, password } = req.body;

    // Debug: log input
    console.log("[addEmployee] Received:", { name, email, phone, employeetype });

    if (!name || !email || !phone || !employeetype || !password) {
      return res.status(400).json({ 
        message: "Missing required fields. Please provide name, email, phone, employee type, and password." 
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const alias = generateAlias(name);
    const callingid = crypto.randomBytes(3).toString("hex"); // 6-character hex
    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new User({
      name: alias,
      email,
      phone,
      password: hashedPassword,
      callingid,
      role: "employee",
      employeetype,
      isactive: true,
    });

    await newEmployee.save();

    const userEmailContent = {
      sender,
      to: [{ email }],
      subject: "Your Employee Login Credentials",
      htmlContent: `
        <div style="background-color: #0b3d2e; color: white; font-family: Arial, sans-serif; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto;">
          <h1 style="color: bisque; text-align: center; font-size: 36px; font-weight: bold; margin-bottom: 10px;">FITETSE</h1>
          <h2 style="text-align: center; font-size: 24px; margin-bottom: 30px;">Welcome to the Team!</h2>
          <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 16px;">We’re excited to have you onboard! Below are your login credentials:</p>
          <div style="background-color: rgba(255,255,255,0.1); padding: 20px; border-radius: 6px; margin: 20px 0;">
            <ul style="list-style-type: none; padding: 0; font-size: 16px;">
              <li><strong>Alias:</strong> ${alias}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Calling ID:</strong> ${callingid}</li>
              <li><strong>Password:</strong> ${password}</li>
            </ul>
          </div>
          <p style="font-size: 16px;">Please log in as soon as possible and change your password for security purposes.</p>
          <p style="font-size: 16px; margin-top: 40px;">Thank you,<br><strong>HR Team</strong></p>
        </div>
      `
    };

    await apiInstance.sendTransacEmail(userEmailContent);

    res.redirect("/admin/addemployee");

  } catch (error) {
    console.error("❌ Error adding employee or sending email:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Toggle employee status
exports.toggleEmployeeStatus = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send("User not found");

    user.isStatus = user.isStatus === "active" ? "inactive" : "active";
    await user.save();

    res.redirect("/admin/addemployee");
  } catch (err) {
    console.error("❌ Error toggling status:", err.message);
    res.status(500).send("Internal Server Error");
  }
};
