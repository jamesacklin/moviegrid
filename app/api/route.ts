import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import seedrandom from "seedrandom";

// Define the structure for Actor data
interface Actor {
  id: number;
  name: string;
  directors: string[];
}

// Read the actor data from a JSON file
const filePath = path.join(process.cwd(), "data.json");
let actors: Actor[] = [];
try {
  const fileData = fs.readFileSync(filePath, "utf8");
  actors = JSON.parse(fileData);
} catch (error) {
  console.log(error);
}

// Shuffle an array in a predictable manner
const shuffle = (array: Array<string>, rng: () => number) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export async function GET() {
  // Generate a unique identifier
  const uuid = uuidv4();
  // Create a random number generator based on the UUID
  const rng = seedrandom(uuid);

  // Map to store directors and their associated actors
  const directorMap: Record<string, Set<string>> = {};
  // Set to store actors that have been used already
  const usedActors: Set<string> = new Set();

  // Populate directorMap with actors for each director
  actors.forEach((actor) => {
    actor.directors.forEach((director) => {
      if (!directorMap[director]) {
        directorMap[director] = new Set();
      }
      directorMap[director].add(actor.name);
    });
  });

  // Identify directors who have worked with at least 3 actors
  const eligibleDirectors = Object.keys(directorMap).filter(
    (director) => Array.from(directorMap[director]).length >= 3
  );

  // Check if there are at least 6 eligible directors
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

  // Randomly shuffle the list of eligible directors
  shuffle(eligibleDirectors, rng);

  // Select 3 directors for rows and 3 for columns
  const rowDirectors = eligibleDirectors.slice(0, 3);
  const colDirectors = eligibleDirectors.slice(3, 6);

  // Initialize the 3x3 matrix to store actor intersections
  const matrix: string[][][] = [];

  for (let rowDir of rowDirectors) {
    const row: string[][] = [];
    for (let colDir of colDirectors) {
      let intersection = Array.from(directorMap[rowDir]).filter((actor) =>
        directorMap[colDir].has(actor)
      );
      // Remove already used actors
      intersection = intersection.filter((actor) => !usedActors.has(actor));

      // Ensure at least one actor intersection exists
      if (intersection.length < 1) {
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

      // Randomly shuffle the intersection and pick one actor
      shuffle(intersection, rng);
      const chosenActor = intersection[0];
      usedActors.add(chosenActor);

      // Add the chosen actor to the row
      row.push([chosenActor]);
    }
    // Add the completed row to the matrix
    matrix.push(row);
  }

  // Return the generated data
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
