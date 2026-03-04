router.get("/team/:teamCode", async (req, res) => {
  try {
    const team = await Team.findOne({
      teamCode: req.params.teamCode
    });

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    res.json(team);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});