"""Build teaser-ready visual assets from local, ignored research data samples.

Expected inputs (not committed):
  tmp/data/mmbody_frame_675_radar.npy
  tmp/data/mmbody_frame_675_mesh.npz
  tmp/data/wicompass_real_world_target_poses.npy
"""

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "tmp" / "data"
OUTPUT = ROOT / "assets" / "derived"

CONNECTIONS = [
    (0, 3), (3, 6), (6, 9), (9, 12), (12, 15),
    (0, 1), (1, 4), (4, 7), (7, 10),
    (0, 2), (2, 5), (5, 8), (8, 11),
    (9, 13), (13, 16), (16, 18), (18, 20),
    (9, 14), (14, 17), (17, 19), (19, 21),
]

# Keep source examples and acquisition targets visually disjoint. The target
# indices are farthest-point samples in normalized SMPL-X joint space, chosen
# from the actual WiCompass real-world target pool rather than invented poses.
INPUT_POSE_INDICES = (0, 92, 145)
TARGET_POSE_INDICES = (139, 31, 163)


def setup_axis(ax):
    ax.set_facecolor((0, 0, 0, 0))
    ax.axis("off")
    ax.set_aspect("equal", adjustable="box")


def draw_skeleton(ax, joints, color="#ff705f", width=3.2, size=22):
    for start, end in CONNECTIONS:
        ax.plot(
            [joints[start, 0], joints[end, 0]],
            [joints[start, 2], joints[end, 2]],
            color=color,
            linewidth=width,
            solid_capstyle="round",
            zorder=5,
        )
    ax.scatter(
        joints[:, 0], joints[:, 2], s=size, color="#edf7f5",
        edgecolor=color, linewidth=1.3, zorder=6,
    )


def write_pose_svg(joints, output_path, color="#58c4dd"):
    """Export the repository's 22-joint SMPL-X skeleton without changing its proportions."""
    width, height, padding = 160, 240, 14
    # The target poses face the radar along x, so y-z is the readable frontal projection.
    projected = joints[:, [1, 2]].astype(float)
    projected[:, 1] *= -1
    minimum = projected.min(axis=0)
    maximum = projected.max(axis=0)
    extent = np.maximum(maximum - minimum, 1e-6)
    scale = min((width - 2 * padding) / extent[0], (height - 2 * padding) / extent[1])
    centered = (projected - (minimum + maximum) / 2) * scale
    centered[:, 0] += width / 2
    centered[:, 1] += height / 2

    bones = "\n".join(
        f'    <line x1="{centered[start, 0]:.2f}" y1="{centered[start, 1]:.2f}" '
        f'x2="{centered[end, 0]:.2f}" y2="{centered[end, 1]:.2f}" />'
        for start, end in CONNECTIONS
    )
    joints_svg = "\n".join(
        f'    <circle cx="{x:.2f}" cy="{y:.2f}" r="2.35" />'
        for x, y in centered
    )
    output_path.write_text(
        f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-label="22-joint SMPL-X pose">
  <g fill="none" stroke="{color}" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round">
{bones}
  </g>
  <g fill="#101010" stroke="#f4f3ee" stroke-width="1.35">
{joints_svg}
  </g>
</svg>
''',
        encoding="utf-8",
    )


def render_real_radar_case():
    radar = np.load(DATA / "mmbody_frame_675_radar.npy")
    joints = np.load(DATA / "mmbody_frame_675_mesh.npz")["joints"][:22]
    pelvis = joints[0]
    xyz = radar[:, :3]
    keep = (
        (np.abs(xyz[:, 0] - pelvis[0]) < 1.05)
        & (np.abs(xyz[:, 1] - pelvis[1]) < 0.75)
        & (np.abs(xyz[:, 2] - pelvis[2]) < 1.35)
    )
    xyz = xyz[keep]

    fig, ax = plt.subplots(figsize=(8, 8), dpi=180)
    fig.patch.set_alpha(0)
    setup_axis(ax)
    depth = xyz[:, 1]
    ax.scatter(
        xyz[:, 0], xyz[:, 2], c=depth, cmap="winter",
        s=7, alpha=0.36, linewidths=0, zorder=2,
    )
    draw_skeleton(ax, joints)
    ax.set_xlim(pelvis[0] - 1.0, pelvis[0] + 1.0)
    ax.set_ylim(pelvis[2] - 1.05, pelvis[2] + 1.45)
    fig.subplots_adjust(0, 0, 1, 1)
    fig.savefig(OUTPUT / "mmbody_real_radar_case.png", transparent=True, bbox_inches="tight", pad_inches=0.01)
    plt.close(fig)


def render_pose_assets():
    poses = np.load(DATA / "wicompass_real_world_target_poses.npy")
    if poses.ndim == 2:
        poses = poses.reshape(-1, 22, 3)

    # These representative cases keep the exact SMPL-X joint geometry used by WiCompass.
    for number, index in enumerate(INPUT_POSE_INDICES, start=1):
        write_pose_svg(poses[index, :22], OUTPUT / f"smplx_pose_{number}.svg")
    for number, index in enumerate(TARGET_POSE_INDICES, start=1):
        write_pose_svg(poses[index, :22], OUTPUT / f"smplx_target_pose_{number}.svg")


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    render_real_radar_case()
    render_pose_assets()
    print(f"Wrote derived assets to {OUTPUT}")


if __name__ == "__main__":
    main()
