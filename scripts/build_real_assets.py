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


def render_target_pose_strip():
    poses = np.load(DATA / "wicompass_real_world_target_poses.npy")
    if poses.ndim == 2:
        poses = poses.reshape(-1, 22, 3)
    indices = np.linspace(0, len(poses) - 1, min(8, len(poses)), dtype=int)
    fig, axes = plt.subplots(1, len(indices), figsize=(16, 3.2), dpi=160)
    fig.patch.set_alpha(0)
    for ax, index in zip(np.atleast_1d(axes), indices):
        setup_axis(ax)
        joints = poses[index, :22]
        draw_skeleton(ax, joints, color="#61e1df", width=2.5, size=13)
        center = joints.mean(axis=0)
        extent = max(np.ptp(joints[:, 0]), np.ptp(joints[:, 2])) * 0.64
        ax.set_xlim(center[0] - extent, center[0] + extent)
        ax.set_ylim(center[2] - extent, center[2] + extent)
    fig.subplots_adjust(0, 0, 1, 1, wspace=0.08)
    fig.savefig(OUTPUT / "wicompass_target_pose_strip.png", transparent=True, bbox_inches="tight", pad_inches=0.02)
    plt.close(fig)

    selected = poses[indices[3], :22]
    fig, ax = plt.subplots(figsize=(4, 5), dpi=180)
    fig.patch.set_alpha(0)
    setup_axis(ax)
    draw_skeleton(ax, selected, color="#61e1df", width=3.2, size=20)
    center = selected.mean(axis=0)
    extent = max(np.ptp(selected[:, 0]), np.ptp(selected[:, 2])) * 0.6
    ax.set_xlim(center[0] - extent, center[0] + extent)
    ax.set_ylim(center[2] - extent, center[2] + extent)
    fig.subplots_adjust(0, 0, 1, 1)
    fig.savefig(OUTPUT / "wicompass_target_pose.png", transparent=True, bbox_inches="tight", pad_inches=0.01)
    plt.close(fig)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    render_real_radar_case()
    render_target_pose_strip()
    print(f"Wrote derived assets to {OUTPUT}")


if __name__ == "__main__":
    main()
