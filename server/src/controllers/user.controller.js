const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Series = require("../models/series.model");

const publicUser = (user) => ({ id: user._id, displayName: user.displayName, email: user.email, role: user.role, avatarUrl: user.avatarUrl, initials: user.initials, theme: user.theme, favorites: user.favorites, watchlist: user.watchlist, createdAt: user.createdAt });
const createToken = (user) => jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });

const register = async (req, res, next) => {
  try {
    const { displayName, email, password } = req.body;
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "JWT_SECRET is not configured" });
    if (!password || password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters" });
    const normalizedEmail = email?.toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: "Email is already registered" });
    const user = await User.create({ displayName, email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "JWT_SECRET is not configured" });
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+passwordHash");
    if (!user || !password || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password" });
    res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
};

const getMe = (req, res) => res.json(publicUser(req.user));

const updateMe = async (req, res, next) => {
  try {
    ["displayName", "avatarUrl", "theme"].forEach((field) => { if (req.body[field] !== undefined) req.user[field] = req.body[field]; });
    await req.user.save();
    res.json(publicUser(req.user));
  } catch (error) { next(error); }
};

const toggleCollection = (field) => async (req, res, next) => {
  try {
    if (!(await Series.exists({ _id: req.params.seriesId }))) return res.status(404).json({ message: "Series not found" });
    const exists = req.user[field].some((seriesId) => seriesId.equals(req.params.seriesId));
    req.user[field] = exists ? req.user[field].filter((seriesId) => !seriesId.equals(req.params.seriesId)) : [...req.user[field], req.params.seriesId];
    await req.user.save();
    res.json({ [field]: req.user[field], saved: !exists });
  } catch (error) { next(error); }
};

module.exports = { register, login, getMe, updateMe, toggleFavorite: toggleCollection("favorites"), toggleWatchlist: toggleCollection("watchlist") };
