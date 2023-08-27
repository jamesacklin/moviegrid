import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import seedrandom from "seedrandom";

interface Actor {
  id: number;
  name: string;
  directors: string[];
}

const filePath = path.join(process.cwd(), "data.json");
const fileData: string = fs.readFileSync(filePath, "utf8");
const actors: Actor[] = JSON.parse(fileData);

const shuffle = (array: string[], rng: () => number): string[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const generateRandomMatrix = () => {
  const uuid: string = uuidv4();
  const rng: () => number = seedrandom(uuid);

  let intersections: { [key: string]: string[] } = {};

  actors.forEach((actor: Actor) => {
    actor.directors.forEach((rowDirector: string) => {
      actor.directors.forEach((colDirector: string) => {
        if (rowDirector === colDirector) return;

        const key: string = `${rowDirector}-${colDirector}`;
        if (!intersections[key]) intersections[key] = [];

        intersections[key].push(actor.name);
      });
    });
  });

  // Get unique directors and shuffle them using the seeded RNG
  let uniqueDirectors: string[] = Array.from(
    new Set(actors.flatMap((actor: Actor) => actor.directors))
  );
  shuffle(uniqueDirectors, rng);

  // Select 3 unique directors for rows and columns
  let rowDirectors: string[] = uniqueDirectors.slice(0, 3);
  let colDirectors: string[] = uniqueDirectors.slice(3, 6);

  let matrix: string[][][] = [];

  // Generate the 3x3 matrix
  rowDirectors.forEach((rowDirector: string) => {
    let row: string[][] = [];
    colDirectors.forEach((colDirector: string) => {
      const key: string = `${rowDirector}-${colDirector}`;
      row.push(intersections[key] || []);
    });
    matrix.push(row);
  });

  return {
    uuid,
    rowDirectors,
    colDirectors,
    matrix,
  };
};

export async function GET() {
  const { uuid, rowDirectors, colDirectors, matrix } = generateRandomMatrix();

  return new Response(
    JSON.stringify({
      directors: { rows: [...rowDirectors], cols: [...colDirectors] },
      actors: matrix,
      uuid: uuid,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
