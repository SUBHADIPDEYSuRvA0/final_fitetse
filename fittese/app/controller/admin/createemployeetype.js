const Employeetype = require('../../model/Employeetype');

// Get all


// Create
exports.createType = async (req, res) => {
  try {
    await Employeetype.create({ type: req.body.type });
    res.redirect('/admin/employeetype');
  } catch (err) {
    res.status(500).send("Error creating type.");
  }
};

// Update
exports.updateType = async (req, res) => {
  try {
    const { id } = req.params;
    await Employeetype.findByIdAndUpdate(id, { type: req.body.type });
    res.redirect('/admin/employeetype');
  } catch (err) {
    res.status(500).send("Error updating type.");
  }
};

// Delete
exports.deleteType = async (req, res) => {
  try {
    await Employeetype.findByIdAndDelete(req.params.id);
    res.redirect('/admin/employeetype');
  } catch (err) {
    res.status(500).send("Error deleting type.");
  }
};
