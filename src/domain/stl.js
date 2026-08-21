function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalize(vector) {
  const magnitude = Math.hypot(...vector) || 1;
  return vector.map((value) => value / magnitude);
}

function number(value) {
  return Number(value).toFixed(6).replace(/\.0+$/, "");
}

export function meshToAsciiStl(mesh, solidName = "blocksmith_open_crown") {
  const lines = [`solid ${solidName}`];
  mesh.faces.forEach((face) => {
    const [a, b, c] = face.map((index) => mesh.vertices[index]);
    const normal = normalize(cross(subtract(b, a), subtract(c, a)));
    lines.push(`  facet normal ${normal.map(number).join(" ")}`);
    lines.push("    outer loop");
    [a, b, c].forEach((vertex) => lines.push(`      vertex ${vertex.map(number).join(" ")}`));
    lines.push("    endloop");
    lines.push("  endfacet");
  });
  lines.push(`endsolid ${solidName}`);
  return `${lines.join("\n")}\n`;
}

export function downloadText(filename, text, type = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

