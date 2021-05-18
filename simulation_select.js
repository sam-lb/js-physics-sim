const sims = {
  PROJECTILE_MOTION: 1,
};


function launch(sim) {
  switch(sim) {
    case sims.PROJECTILE_MOTION:
      window.location = "projectile_motion.html";
      break;
  }
}
