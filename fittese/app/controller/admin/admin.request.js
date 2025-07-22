const SibApiV3Sdk = require('sib-api-v3-sdk');
const User = require("../../model/user");
const Slot = require("../../model/slots");
const crypto = require("crypto");

SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sender = {
  email: 'verification@cozyhomestays.com',
  name: 'educate',
};

exports.createUserAndBookSlot = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      democall,
      address,
      description,
      question,
      slotId,
      selectedDate // optional, if you want to save or show it
    } = req.body;

    // console.log(req.body);

    // Generate alias, password, and callingid
    const alias = name.split(' ').map((word) => word.charAt(0).toUpperCase()).join('');
    const password = crypto.randomBytes(4).toString("hex");
    const callingid = crypto.randomBytes(3).toString("hex");

    // Prepare test answers object from question
    const test = question || {};

    // Create new user
    const newUser = new User({
      name: alias,
      email,
      phone,
      address,
      description,
      password,
      callingid,
      democall: slotId,
      isactive: true,
      test,
      // You can store selectedDate if needed, just add it to the schema first
      // selectedDate: selectedDate
    });

    await newUser.save();

    // Fetch the selected slot and update its status
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).send("Selected slot not found.");
    }

    slot.status = "booked";
    await slot.save();

    // Define the domain and generate the join link
    const domain = process.env.DOMAIN_NAME ;
  

    // Prepare the email content for the admin
  const adminEmailContent = {
  sender,
  to: [{ email: 'subhadip5069@gmail.com' }],
  subject: "New User Demo Call Booked",
  htmlContent: `
    <div style="background-color: #f2f2f7; padding: 40px 0; font-family: 'Segoe UI', sans-serif;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); padding: 30px;">
        <h2 style="text-align: center; color: #333333;">📞 FITETSE - Demo Call Booked</h2>
        <p style="color: #555; font-size: 16px;">A new user has booked a demo call. Here are the details:</p>
        <div style="margin-top: 20px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Date:</strong> ${slot.start}</p>
          <p><strong>Alias:</strong> ${alias}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Calling ID:</strong> ${callingid}</p>
          <p><strong>Slot ID:</strong> ${democall}</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${domain}/join/${process.env.EMAIL_USER}/${callingid}" style="background-color: #0066ff; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Join Now</a>
        </div>
      </div>
    </div>
  `,
};


    // Prepare the email content for the user
   const userEmailContent = {
  sender,
  to: [{ email }],
  subject: "Your Demo Call Booking is Confirmed",
  htmlContent: `
    <div style="background-color: #f2f2f7; padding: 40px 0; font-family: 'Segoe UI', sans-serif;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); padding: 30px;">
        <h2 style="text-align: center; color: #28a745;">✅ Demo Call Confirmed</h2>
        <p style="color: #555; font-size: 16px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #555;">Thank you for booking a demo call with FITETSE. Here are your call details:</p>
        <div style="margin-top: 20px;">
          <p><strong>Calling ID:</strong> ${callingid}</p>
        </div>
        <p style="color: #888;">We will reach out to you shortly. Please be ready at the scheduled time.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${domain}/join/${email}/${callingid}" style="background-color: #28a745; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Join Now</a>
        </div>
      </div>
    </div>
  `,
};


    // Send the emails
    await Promise.all([
      apiInstance.sendTransacEmail(adminEmailContent),
      apiInstance.sendTransacEmail(userEmailContent),
    ]);

    // Redirect to thank you page
    res.redirect("/thank-you");

  } catch (error) {
    console.error("Error creating user or sending email:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
};
