"use client";

import { useState, useEffect, FC } from "react";

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

const HomePage: FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api"); // replace with your API endpoint
      const result: ApiResponse = await response.json();
      if (result.message !== "success") {
        setError(result.message);
        return;
      }
      setData(result);
    };

    fetchData();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const { attributes, entities } = data;

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <table className="table-auto w-full border-collapse">
      <thead>
        <tr>
          <th className="border border-gray-400 p-2"></th>
          {attributes.cols.map((colDir, index) => (
            <th className="text-left border border-gray-400 p-2" key={index}>
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
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default HomePage;
