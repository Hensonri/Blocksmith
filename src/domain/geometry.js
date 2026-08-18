import { ellipseAxesForCircumference } from "./profiles.js";

function smoothStep(value) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function ringScale(t, taperFraction) {
  const tapered = 1 - taperFraction * t;
  const shoulder = t <= 0.74 ? 0 : 0.055 * smoothStep((t - 0.74) / 0.26);
  return Math.max(0.72, tapered - shoulder);
}

export function createOpenCrownMesh({
  circumferenceMm,
  profileRatio,
  crownHeightMm,
  taperPct = 5,
  radialSegments = 96,
  heightSegments = 28,
  scale = 1,
}) {
  const { lengthMm, widthMm } = ellipseAxesForCircumference(
    Number(circumferenceMm) * scale,
    profileRatio,
  );
  const baseA = lengthMm / 2;
  const baseB = widthMm / 2;
  const height = Number(crownHeightMm) * scale;
  const taper = Math.min(0.18, Math.max(0, Number(taperPct) / 100));
  const vertices = [];
  const faces = [];

  for (let row = 0; row <= heightSegments; row += 1) {
    const t = row / heightSegments;
    const sectionScale = ringScale(t, taper);
    for (let column = 0; column < radialSegments; column += 1) {
      const theta = (column / radialSegments) * Math.PI * 2;
      vertices.push([
        baseA * sectionScale * Math.cos(theta),
        baseB * sectionScale * Math.sin(theta),
        height * t,
      ]);
    }
  }

  for (let row = 0; row < heightSegments; row += 1) {
    const lowerOffset = row * radialSegments;
    const upperOffset = (row + 1) * radialSegments;
    for (let column = 0; column < radialSegments; column += 1) {
      const next = (column + 1) % radialSegments;
      const lowerCurrent = lowerOffset + column;
      const lowerNext = lowerOffset + next;
      const upperCurrent = upperOffset + column;
      const upperNext = upperOffset + next;
      faces.push([lowerCurrent, lowerNext, upperCurrent]);
      faces.push([lowerNext, upperNext, upperCurrent]);
    }
  }

  const bottomCenter = vertices.push([0, 0, 0]) - 1;
  const topCenter = vertices.push([0, 0, height]) - 1;
  const topOffset = heightSegments * radialSegments;

  for (let column = 0; column < radialSegments; column += 1) {
    const next = (column + 1) % radialSegments;
    faces.push([bottomCenter, next, column]);
    faces.push([topCenter, topOffset + column, topOffset + next]);
  }

  return {
    vertices,
    faces,
    metadata: {
      kind: "standard-open-crown",
      lengthMm,
      widthMm,
      heightMm: height,
      scale,
      taperPct: Number(taperPct),
    },
  };
}

export function meshBounds(mesh) {
  const bounds = {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
  };
  mesh.vertices.forEach((vertex) => {
    vertex.forEach((value, axis) => {
      bounds.min[axis] = Math.min(bounds.min[axis], value);
      bounds.max[axis] = Math.max(bounds.max[axis], value);
    });
  });
  return {
    ...bounds,
    size: bounds.max.map((value, axis) => value - bounds.min[axis]),
  };
}

export function validateMesh(mesh) {
  const errors = [];
  const edgeCounts = new Map();

  if (!mesh.vertices.length || !mesh.faces.length) {
    errors.push("Mesh contains no geometry.");
  }

  mesh.vertices.forEach((vertex, index) => {
    if (vertex.length !== 3 || vertex.some((value) => !Number.isFinite(value))) {
      errors.push(`Vertex ${index} is invalid.`);
    }
  });

  mesh.faces.forEach((face, faceIndex) => {
    if (face.length !== 3 || face.some((index) => !Number.isInteger(index) || index < 0 || index >= mesh.vertices.length)) {
      errors.push(`Face ${faceIndex} references an invalid vertex.`);
      return;
    }
    const edges = [[face[0], face[1]], [face[1], face[2]], [face[2], face[0]]];
    edges.forEach(([left, right]) => {
      const key = left < right ? `${left}:${right}` : `${right}:${left}`;
      edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1);
    });
  });

  const nonManifoldEdges = [...edgeCounts.values()].filter((count) => count !== 2).length;
  if (nonManifoldEdges) {
    errors.push(`${nonManifoldEdges} mesh edges are not shared by exactly two faces.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    nonManifoldEdges,
    vertexCount: mesh.vertices.length,
    triangleCount: mesh.faces.length,
    bounds: meshBounds(mesh),
  };
}

