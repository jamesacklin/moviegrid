import { NextResponse } from "next/server";
import seedrandom from "seedrandom";
import Airtable from "airtable";

// Define the structure for Entity data
interface Entity {
  name: string;
  attributes: string[];
}

// Shuffle an array in a predictable manner
const shuffle = (array: Array<string>, rng: () => number) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export async function GET(req: Request) {
  // List of entities to be populated from Airtable
  const entities: Entity[] = [];

  // Initialize Airtable base
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_KEY,
  }).base(process.env.AIRTABLE_BASE || "");

  // Fetch all records from the Actors table
  try {
    await base("Actors")
      .select({})
      .eachPage((records, fetchNextPage) => {
        records.forEach((record) => {
          const rawName = record.get("Name");
          const rawAttributes = record.get("Attributes");
          // Ensure the data is in the expected format
          if (
            typeof rawName === "string" &&
            Array.isArray(rawAttributes) &&
            rawAttributes.every((attr) => typeof attr === "string")
          ) {
            const entity: Entity = {
              name: rawName,
              attributes: rawAttributes,
            };
            // Add the entity to the list
            entities.push(entity);
          }
        });
        // Fetch the next page of records
        fetchNextPage();
      });
  } catch (err) {
    console.error(err);
  }

  // Get the UUID from the request headers
  const uuid = req.headers.get("X-Request-UUID");

  // Ensure the UUID is provided
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
      allEntities: entities.map((entity) => entity.name),
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
