import { supabase } from '../config/supabase.js';

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return res.status(error.status || 400).json({ message: error.message });
    }

    if (data.session) {
      return res.status(201).json({ message: 'Registration successful', ...data });
    }

    return res.status(201).json({ message: 'Registration successful. Please check your email for a confirmation link.', user: data.user });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(error.status || 400).json({ message: error.message });
    }

    return res.status(200).json({ message: 'Login successful', ...data });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
