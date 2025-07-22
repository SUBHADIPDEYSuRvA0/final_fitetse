
const User = require("../../model/user");
const bcrypt = require("bcrypt");


exports.employeeLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      const employee = await User.findOne({ email, role: "employee" });
      if (!employee) {
        return res.render('employee/login', { error: "Invalid credentials" });
      }
      if (employee.isStatus === "inactive" || employee.isactive === false) {
        return res.render('employee/login', { error: "Account is blocked" });
      }
      const isMatch = await bcrypt.compare(password, employee.password);
      if (!isMatch) {
        return res.render('employee/login', { error: "Invalid credentials" });
      }
      // Set session for employee
      req.session.user = employee;
      res.redirect('/employee/home');
    } catch (error) {
      res.render('employee/login', { error: "Internal server error" });
    }
};