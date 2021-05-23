const sims = {
  PROJECTILE_MOTION: 1,
  SPRING: 2,
  ROPE: 3,
};


function launch(sim) {
  switch(sim) {
    case sims.PROJECTILE_MOTION:
      window.location = "projectile_motion.html";
      break;
    case sims.SPRING:
      break;
    case sims.ROPE:
      window.location = "rope.html";
      break;
  }
}
