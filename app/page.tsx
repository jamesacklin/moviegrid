"use client";

import { useState, useEffect, FC } from "react";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import InputField from "./components/InputField";

interface AttributeList {
  rows: string[];
  cols: string[];
}

interface ApiResponse {
  attributes: AttributeList;
  entities: string[][][];
  uuid: string;
  message: string;
}

interface ResultResponse {
  score: number;
  resultMatrix: string[][];
  message: string;
}

interface NumericKeyObject {
  [key: number]: string;
}

function getSortedValues(obj: NumericKeyObject): string[] {
  const keys = Object.keys(obj)
    .map(Number)
    .sort((a, b) => a - b);
  return keys.map((key) => obj[key]);
}

const HomePage: FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [resultMatrix, setResultMatrix] = useState<string[][] | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

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

  if (!data) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const { attributes, entities } = data;
  const selectOptions = _.map(_.flatten(entities), (entity) => {
    return { value: entity[0] };
  });

  async function handleSubmit(e: any) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const answers = [];
    for (var pair of formData.entries()) {
      answers.push(pair[1]);
    }

    const submitData = await fetch(`/api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: answers,
        matrix: entities,
      }),
    }).catch((error) => {
      console.error("Error submitting the form:", error);
    });

    if (submitData) {
      const result: ResultResponse = await submitData.json();
      const { score, resultMatrix } = result;
      setScore(score);
      setResultMatrix(resultMatrix);
      setSubmitted(true);
    }
  }

  return (
    <div className="relative">
      <form method="post" onSubmit={handleSubmit}>
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
                      name={`${rowIndex}${cellIndex}`}
                      id={`${rowIndex}${cellIndex}`}
                      items={selectOptions}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {!submitted && (
          <div className="mt-4 text-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit
            </button>
          </div>
        )}
      </form>
      {submitted && resultMatrix && (
        <div className="p-4 text-center">
          <p>Your score is {score}</p>
          <pre>{resultMatrix.map((row) => row.join(" ")).join("\n")}</pre>
        </div>
      )}
    </div>
  );
};

export default HomePage;
