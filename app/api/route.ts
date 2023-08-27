import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import seedrandom from "seedrandom";

interface Actor {
  id: number;
  name: string;
  directors: string[];
}

const filePath = path.join(process.cwd(), "data.json");
let actors: Actor[] = [];
try {
  const fileData = fs.readFileSync(filePath, "utf8");
  actors = JSON.parse(fileData);
} catch (error) {
  console.log(error);
}

const shuffle = (array: Array<string>, rng: () => number) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export async function GET() {
  const uuid = uuidv4();
  const rng = seedrandom(uuid);

  const directorMap: Record<string, Set<string>> = {};

  actors.forEach((actor) => {
    actor.directors.forEach((director) => {
      if (!directorMap[director]) {
        directorMap[director] = new Set();
      }
      directorMap[director].add(actor.name);
    });
  });

  const eligibleDirectors = Object.keys(directorMap).filter(
    (director) => Array.from(directorMap[director]).length >= 3
  );

  if (eligibleDirectors.length < 6) {
    return new Response(
      JSON.stringify({ message: "Not enough eligible directors" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  shuffle(eligibleDirectors, rng);

  const rowDirectors = eligibleDirectors.slice(0, 3);
  const colDirectors = eligibleDirectors.slice(3, 6);

  const matrix: string[][][] = [];

  for (let rowDir of rowDirectors) {
    const row: string[][] = [];
    for (let colDir of colDirectors) {
      const intersection = Array.from(directorMap[rowDir]).filter((actor) =>
        directorMap[colDir].has(actor)
      );
      if (intersection.length < 3) {
        return new Response(
          JSON.stringify({
            message: "Not enough actor/director intersections for a 3x3 matrix",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      shuffle(intersection, rng);
      row.push(intersection.slice(0, 3)); // Slicing to ensure we get only 3 actors
    }
    matrix.push(row);
  }

  return new Response(
    JSON.stringify({
      directors: { rows: rowDirectors, cols: colDirectors },
      actors: matrix,
      uuid: uuid,
      message: "success",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
