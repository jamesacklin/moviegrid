"use client";

import { useState, useEffect, FC } from "react";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import InputField from "./components/InputField";
import { ApiResponse, ResultResponse, NumericKeyObject } from "./types";

function getSortedValues(obj: NumericKeyObject): string[] {
  const keys = Object.keys(obj)
    .map(Number)
    .sort((a, b) => a - b);
  return keys.map((key) => obj[key]);
}

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uuid = uuidv4();
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

  useEffect(() => {
    if (data) {
      const { entities, allEntities } = data;
      const randomSize = _.random(1, allEntities.length);
      const randomElements = _.sampleSize(allEntities, randomSize);
      const mergedArray = _.union(_.flattenDeep(entities), randomElements);
      setEntities(entities);
      setAllEntities(mergedArray);
      setSelectOptions(
        _.orderBy(mergedArray, [(o) => o.toLowerCase()], ["asc"])
      );
    }
  }, [data]);

  useEffect(() => {
    const newSelectOptions = _.difference(
      allEntities,
      Object.values(usedOptions)
    );
    setSelectOptions(
      _.orderBy(newSelectOptions, [(o) => o.toLowerCase()], ["asc"])
    );
  }, [usedOptions, allEntities]);

  if (!data) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const { attributes } = data;

  function handleChange(e: any) {
    if (e.target.answer === "true") {
      setUsedOptions((prev) => {
        const newUsedOptions = { ...prev };
        newUsedOptions[e.target.id] = e.target.value;
        return newUsedOptions;
      });
      setScoreValues((prev) => {
        const id = parseInt(e.target.id);
        const newScoreValues = { ...prev };
        newScoreValues[id] = e.target.answer;
        return newScoreValues;
      });
    } else {
      setGuessesLeft((prev) => prev - 1);
    }
  }

  const renderRow = (row: number): string => {
    return [1, 2, 3]
      .map((col) => {
        const key = parseInt(`${row}${col}`);
        return scoreValues[key] === "true" ? "✅" : "⬜";
      })
      .join(" ");
  };

  return (
    <div className="relative px-4">
      <div className="text-center m-4">
        {guessesLeft !== 0 && (
          <span className="text-gray-900 text-xl">
            You have {guessesLeft} guesses left
          </span>
        )}
        {guessesLeft === 0 ||
        _.countBy(scoreValues, (v) => v === "true").true === 9 ? (
          <span className="text-gray-900 text-xl">
            You got {_.countBy(scoreValues, (v) => v === "true").true || 0}/9
            correct
          </span>
        ) : null}
      </div>
      {guessesLeft !== 0 && (
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
                    <p className="text-gray-400 mb-2 text-xs">{cell}</p>
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
      )}
      {guessesLeft === 0 ||
      _.countBy(scoreValues, (v) => v === "true").true === 9 ? (
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
