import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import seedrandom from "seedrandom";

// Define the structure for Entity data
interface Entity {
  id: number;
  name: string;
  attributes: string[];
}

// Read the entity data from a JSON file
const filePath = path.join(process.cwd(), "data.json");
let entities: Entity[] = [];
try {
  const fileData = fs.readFileSync(filePath, "utf8");
  entities = JSON.parse(fileData);
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

// Calculate the score and matrix for a given set of inputs and target array
function matchScoreAndMatrix(inputs: any, matrix: any) {
  let score = 0;
  let resultMatrix: string[][] = [[], [], []];

  for (let i = 0; i < 9; i++) {
    // Fixed-size loop to always handle 3x3
    let row = Math.floor(i / 3);
    let col = i % 3;

    if (inputs[i] && matrix[row] && matrix[row][col]) {
      if (inputs[i] === matrix[row][col][0]) {
        score++;
        resultMatrix[row].push("✅");
      } else {
        resultMatrix[row].push("⬜");
      }
    } else {
      // Handle incomplete data
      resultMatrix[row].push("⬜");
    }
  }

  return { score, resultMatrix };
}

export async function GET(req: Request) {
  const uuid = req.headers.get("X-Request-UUID");

  if (!uuid) {
    return NextResponse.json(
      { message: "UUID not provided" },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Create a random number generator based on the UUID
  const rng = seedrandom(uuid);

  // Map to store attributes and their associated entities
  const attributeMap: Record<string, Set<string>> = {};
  // Set to store entities that have been used already
  const usedEntities: Set<string> = new Set();

  // Populate attributeMap with entities for each attribute
  entities.forEach((entity) => {
    entity.attributes.forEach((attribute) => {
      if (!attributeMap[attribute]) {
        attributeMap[attribute] = new Set();
      }
      attributeMap[attribute].add(entity.name);
    });
  });

  // Identify attributes who are associated with at least 3 entities
  const eligibleAttributes = Object.keys(attributeMap).filter(
    (attribute) => Array.from(attributeMap[attribute]).length >= 3
  );

  // Check if there are at least 6 eligible attributes
  if (eligibleAttributes.length < 6) {
    return NextResponse.json(
      { message: "Not enough eligible attributes" },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Randomly shuffle the list of eligible attributes
  shuffle(eligibleAttributes, rng);

  // Select 3 attributes for rows and 3 for columns
  const rowAttributes = eligibleAttributes.slice(0, 3);
  const colAttributes = eligibleAttributes.slice(3, 6);

  // Initialize the 3x3 matrix to store entity intersections
  const matrix: string[][][] = [];

  for (let rowAttr of rowAttributes) {
    const row: string[][] = [];
    for (let colAttr of colAttributes) {
      let intersection = Array.from(attributeMap[rowAttr]).filter((entity) =>
        attributeMap[colAttr].has(entity)
      );
      // Remove already used entities
      intersection = intersection.filter((entity) => !usedEntities.has(entity));

      // Ensure at least one entity intersection exists
      if (intersection.length < 1) {
        return NextResponse.json(
          {
            message:
              "Not enough entity/attribute intersections for a 3x3 matrix",
          },
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Randomly shuffle the intersection and pick one entity
      shuffle(intersection, rng);
      const chosenEntity = intersection[0];
      usedEntities.add(chosenEntity);

      // Add the chosen entity to the row
      row.push([chosenEntity]);
    }
    // Add the completed row to the matrix
    matrix.push(row);
  }

  return NextResponse.json(
    {
      attributes: { rows: rowAttributes, cols: colAttributes },
      entities: matrix,
      uuid: uuid,
      message: "success",
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function POST(req: Request) {
  const { inputs, matrix } = await req.json();

  const { score, resultMatrix } = matchScoreAndMatrix(inputs, matrix);
  console.log(resultMatrix);
  return NextResponse.json(
    { score: score, resultMatrix: resultMatrix, message: "success" },
    { status: 200 }
  );
}
