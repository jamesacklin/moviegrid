"use client";

import { useState, useEffect, FC } from "react";
import _ from "lodash";
import InputField from "./components/InputField";
import { ApiResponse, NumericKeyObject } from "./types";
import crypto from "crypto";

// Generate a UUID based on the current date
function generateDateBasedUUID() {
  // Get the current date in ISO format and hash it
  const today = new Date().toISOString().split("T")[0];
  const hash = crypto.createHash("sha256").update(today).digest("hex");

  // Format the hash as a UUID
  const time_low = hash.substring(0, 8);
  const time_mid = hash.substring(8, 12);
  const time_hi_and_version =
    (parseInt(hash.substring(12, 16), 16) & 0x0fff) | 0x4000; // Version 4
  const clock_seq_hi_and_reserved =
    (parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80; // Variant is 10
  const clock_seq_low = hash.substring(18, 20);
  const node = hash.substring(20, 32); // only taking 12 digits, enough for the node part

  // Convert the UUID parts to strings
  const time_hi_and_version_str = time_hi_and_version
    .toString(16)
    .padStart(4, "0");
  const clock_seq_hi_and_reserved_str = clock_seq_hi_and_reserved
    .toString(16)
    .padStart(2, "0");

  return `${time_low}-${time_mid}-${time_hi_and_version_str}-${clock_seq_hi_and_reserved_str}${clock_seq_low}-${node}`;
}

// Get sorted values from an object with numeric keys
function getSortedValues(obj: NumericKeyObject): string[] {
  const keys = Object.keys(obj)
    .map(Number)
    .sort((a, b) => a - b);
  return keys.map((key) => obj[key]);
}

// Initial values for used options and score values
const initialValues: NumericKeyObject = {
  11: "",
  12: "",
  13: "",
  21: "",
  22: "",
  23: "",
  31: "",
  32: "",
  33: "",
};

// Get a random size between 1 and a given maximum number
const getRandomSize = (max: number) => _.random(1, max);

// Get random elements from an array based on a given size
const getRandomElements = (array: string[], size: number) =>
  _.sampleSize(array, size);

// Merge and flatten arrays
const mergeAndFlattenArrays = (array1: string[][][], array2: string[]) =>
  _.union(_.flattenDeep(array1), array2);

const HomePage: FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [entities, setEntities] = useState<string[][][]>([]);
  const [allEntities, setAllEntities] = useState<string[]>([]);
  const [selectOptions, setSelectOptions] = useState<string[]>([]);
  const [usedOptions, setUsedOptions] =
    useState<NumericKeyObject>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [scoreValues, setScoreValues] =
    useState<NumericKeyObject>(initialValues);
  const [guessesLeft, setGuessesLeft] = useState<number>(9);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Update entities, all entities and select options
  const updateOptionStates = (
    entities: string[][][],
    mergedArray: string[]
  ) => {
    setEntities(entities);
    setAllEntities(mergedArray);
    setSelectOptions(_.orderBy(mergedArray, [(o) => o.toLowerCase()], ["asc"]));
  };

  // Filter out used options from all entities
  const filterUsedOptions = (
    allEntities: string[],
    usedOptions: NumericKeyObject
  ) => {
    return _.difference(allEntities, Object.values(usedOptions));
  };

  // Sort entities alphabetically
  const sortEntities = (entities: string[]) => {
    return _.orderBy(entities, [(o) => o.toLowerCase()], ["asc"]);
  };

  // Event listener function for keydown event
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Shift") {
      setIsShiftPressed(true);
    }
  };

  // Event listener function for keyup event
  const handleKeyUp = (event: { key: string }) => {
    if (event.key === "Shift") {
      setIsShiftPressed(false);
    }
  };

  // Attach and clean up shift listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup the event listeners when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const uuid = generateDateBasedUUID();
        const response = await fetch(`/api`, {
          headers: {
            "X-Request-UUID": uuid,
          },
        });
        if (!response.ok) {
          setError("API fetch failed");
          return;
        }
        const result: ApiResponse = await response.json();
        if (result.message !== "success") {
          setError(result.message);
          return;
        }
        setData(result);
      } catch (e) {
        setError(`An error occurred: ${e}`);
      }
    };
    fetchData();
  }, []);

  // Get all entites in play, plus a random selection of entities
  // to be used as select options
  useEffect(() => {
    if (!data) return;
    const { entities, allEntities } = data;
    const randomSize = getRandomSize(allEntities.length);
    const randomElements = getRandomElements(allEntities, randomSize);
    const mergedArray = mergeAndFlattenArrays(entities, randomElements);
    updateOptionStates(entities, mergedArray);
  }, [data]);

  // Filter out used options from select options and update the state
  useEffect(() => {
    const updateSelectOptions = () => {
      const filteredEntities = filterUsedOptions(allEntities, usedOptions);
      const sortedEntities = sortEntities(filteredEntities);
      setSelectOptions(sortedEntities);
    };

    updateSelectOptions();
  }, [usedOptions, allEntities]);

  // Handle data loading
  if (!data) {
    return <div>Loading...</div>;
  }

  // Handle errors
  if (error) {
    return <div>{error}</div>;
  }

  // Destructure data
  const { attributes } = data;

  // Handle input field change
  function handleChange(e: any) {
    const { answer, id, value } = e.target;
    const updateUsedOptions = (prev: any) => {
      return { ...prev, [id]: value };
    };
    const updateScoreValues = (prev: any) => {
      return { ...prev, [parseInt(id)]: answer };
    };
    if (answer === "true") {
      setUsedOptions(updateUsedOptions);
      setScoreValues(updateScoreValues);
    } else {
      setGuessesLeft((prev) => prev - 1);
    }
  }

  // Render the emoji scoring grid
  const renderRow = (row: number): string => {
    return [1, 2, 3]
      .map((col) => {
        const key = parseInt(`${row}${col}`);
        return scoreValues[key] === "true" ? "✅" : "⬜";
      })
      .join(" ");
  };

  // Calculate score
  const score = () => {
    return _.countBy(scoreValues, (v) => v === "true").true || 0;
  };

  return (
    <div className="relative px-4">
      <div className="text-center m-4">
        {/* Number of guesses left */}
        {guessesLeft !== 0 && score() !== 9 ? (
          <span className="text-gray-900 text-xl">
            You have {guessesLeft} guesses left
          </span>
        ) : null}
        {/* Final score */}
        {guessesLeft === 0 || score() === 9 ? (
          <span className="text-gray-900 text-xl">
            You got {score()}/9 correct
          </span>
        ) : null}
      </div>
      {/* Main immaculate grid table */}
      {guessesLeft !== 0 && score() !== 9 ? (
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-400 p-2"></th>
              {attributes.cols.map((colDir, index) => (
                <th
                  className="text-left border border-gray-400 p-2"
                  key={index}
                >
                  {colDir}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entities.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="font-bold border border-gray-400 p-2">
                  {attributes.rows[rowIndex]}
                </td>
                {row.map((cell, cellIndex) => (
                  <td className="border border-gray-400 p-2" key={cellIndex}>
                    {isShiftPressed && (
                      <p className="text-gray-400 mb-2 text-xs">{cell}</p>
                    )}
                    <InputField
                      name={`${rowIndex + 1}${cellIndex + 1}`}
                      id={`${rowIndex + 1}${cellIndex + 1}`}
                      cell={cell[0]}
                      items={selectOptions}
                      changeEvt={handleChange}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {/* Emoji scoring grid */}
      {guessesLeft === 0 || score() === 9 ? (
        <div className="flex flex-col justify-center items-center mt-4 ">
          <pre className="rounded-lg bg-gray-100 p-4">
            {[1, 2, 3].map((row) => (
              <div key={row}>{renderRow(row)}</div>
            ))}
          </pre>
        </div>
      ) : null}
    </div>
  );
};

export default HomePage;
