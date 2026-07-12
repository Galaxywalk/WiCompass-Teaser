export function bindPlaybackControls({ player, stage, voiceover, play, restart, mute, fullscreen, scrubber }) {
  play.addEventListener("click", player.toggle);
  restart.addEventListener("click", player.restart);
  mute.addEventListener("click", (event) => {
    voiceover.muted = !voiceover.muted;
    event.currentTarget.textContent = voiceover.muted ? "MUTE" : "VOL";
  });
  fullscreen.addEventListener("click", () => stage.requestFullscreen?.());
  scrubber.addEventListener("input", (event) => player.seek(event.target.value, true));

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      player.toggle();
    }
    if (event.code === "ArrowRight") player.seek(player.currentTime + 5, true);
    if (event.code === "ArrowLeft") player.seek(player.currentTime - 5, true);
    if (event.key.toLowerCase() === "f") stage.requestFullscreen?.();
  });
}
