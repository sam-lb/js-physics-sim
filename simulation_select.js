const sims = {
  PROJECTILE_MOTION: 1,
  SPRING: 2,

};


function launch(sim) {
  switch(sim) {
    case sims.PROJECTILE_MOTION:
      window.location = "projectile_motion.html";
      break;
    case sims.SPRING:
      break;
  }
}
