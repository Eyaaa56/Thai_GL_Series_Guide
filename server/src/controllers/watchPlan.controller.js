const WatchPlan = require("../models/watchPlan.model");
const Series = require("../models/series.model");

const populatePlan = (query) => query.populate("items.series", "title posterUrl episodeCount releaseYear");

const getPlans = async (req, res, next) => {
  try {
    const plans = await populatePlan(WatchPlan.find({ user: req.user._id }).sort({ updatedAt: -1 }));
    res.json(plans);
  } catch (error) { next(error); }
};

const createPlan = async (req, res, next) => {
  try {
    const plan = await WatchPlan.create({ user: req.user._id, title: req.body.title, description: req.body.description });
    res.status(201).json(plan);
  } catch (error) { next(error); }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await WatchPlan.findOne({ _id: req.params.planId, user: req.user._id });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    ["title", "description"].forEach((field) => { if (req.body[field] !== undefined) plan[field] = req.body[field]; });
    await plan.save();
    res.json(plan);
  } catch (error) { next(error); }
};

const deletePlan = async (req, res, next) => {
  try {
    const plan = await WatchPlan.findOneAndDelete({ _id: req.params.planId, user: req.user._id });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.status(204).end();
  } catch (error) { next(error); }
};

const addPlanItem = async (req, res, next) => {
  try {
    const plan = await WatchPlan.findOne({ _id: req.params.planId, user: req.user._id });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    const series = await Series.findById(req.body.seriesId);
    if (!series) return res.status(404).json({ message: "Series not found" });
    if (plan.items.some((item) => item.series.equals(series._id))) return res.status(409).json({ message: "This series is already in the plan" });
    const episodeCount = Number(req.body.episodeCount || series.episodeCount);
    if (!Number.isInteger(episodeCount) || episodeCount < 1) return res.status(400).json({ message: "episodeCount must be at least 1" });
    plan.items.push({ series: series._id, episodeCount, note: req.body.note || "" });
    await plan.save();
    const populated = await populatePlan(WatchPlan.findById(plan._id));
    res.status(201).json(populated);
  } catch (error) { next(error); }
};

const toggleEpisode = (completedEpisodes, episode, completed) => {
  const watched = new Set(completedEpisodes);
  if (completed) watched.add(episode); else watched.delete(episode);
  return [...watched].sort((a, b) => a - b);
};

const setEpisode = async (req, res, next) => {
  try {
    const plan = await WatchPlan.findOne({ _id: req.params.planId, user: req.user._id });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    const item = plan.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Plan item not found" });
    const episode = Number(req.params.episode);
    if (!Number.isInteger(episode) || episode < 1 || episode > item.episodeCount) return res.status(400).json({ message: "Episode is outside this series range" });
    item.completedEpisodes = toggleEpisode(item.completedEpisodes, episode, req.body.completed !== false);
    await plan.save();
    const populated = await populatePlan(WatchPlan.findById(plan._id));
    res.json(populated);
  } catch (error) { next(error); }
};

const removePlanItem = async (req, res, next) => {
  try {
    const plan = await WatchPlan.findOne({ _id: req.params.planId, user: req.user._id });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    const item = plan.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Plan item not found" });
    item.deleteOne();
    await plan.save();
    res.json(plan);
  } catch (error) { next(error); }
};

module.exports = { getPlans, createPlan, updatePlan, deletePlan, addPlanItem, setEpisode, removePlanItem, toggleEpisode };
