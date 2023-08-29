"use client";

import { useState, useEffect, FC } from "react";
import { v4 as uuidv4 } from "uuid";
import { Formik, Field, Form } from "formik";

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

  return (
    <div className="relative">
      <Formik
        initialValues={{
          0x0: "",
          0x1: "",
          0x2: "",
          10: "",
          11: "",
          12: "",
          20: "",
          21: "",
          22: "",
        }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const submitData = await fetch(`/api`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                inputs: getSortedValues(values as NumericKeyObject),
                matrix: entities,
              }),
            });
            const result: ResultResponse = await submitData.json();
            const { score, resultMatrix } = result;
            setScore(score);
            setResultMatrix(resultMatrix);
          } catch (error) {
            console.error("Error submitting the form:", error);
          } finally {
            setSubmitted(true);
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
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
                      <td
                        className="border border-gray-400 p-2"
                        key={cellIndex}
                      >
                        <div className="text-xs text-gray-400">{cell}</div>
                        <Field
                          className="border-2"
                          type="text"
                          disabled={submitted}
                          id={parseInt(
                            rowIndex.toString() + cellIndex.toString()
                          )}
                          name={parseInt(
                            rowIndex.toString() + cellIndex.toString()
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {!submitted && !isSubmitting && (
              <div className="mt-4 text-center">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Submit
                </button>
              </div>
            )}
          </Form>
        )}
      </Formik>
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
