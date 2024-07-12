const crypto = require('crypto');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://${req.headers.host}/reset/${token}`;
    await emailService.sendEmail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
             <p>Please click on the following link, or paste this into your browser to complete the process:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
    });

    logger.info(`Password reset email sent to ${user.email}`);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    if (await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: 'New password must be different from the old password' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
    logger.info(`Password has been reset for user: ${user.email}`);
  } catch (error) {
    logger.error('Error resetting password:', error);
    res.status(500).json({ message: error.message });
  }
};
