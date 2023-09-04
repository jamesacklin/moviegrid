import { useEffect, useState } from "react";
import { useCombobox } from "downshift";
import cn from "classnames";

interface InputFieldProps {
  items: string[] | undefined;
  id: string;
  name: string;
  cell: string;
  changeEvt: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

function insensitiveMatch(str1: string, str2: string) {
  const cleanedStr1 = str1.replace(/\s+/g, "").toLowerCase();
  const cleanedStr2 = str2.replace(/\s+/g, "").toLowerCase();
  return cleanedStr1 === cleanedStr2;
}

export default function InputField({
  items,
  id,
  name,
  cell,
  changeEvt,
}: InputFieldProps) {
  const [inputItems, setInputItems] = useState(items as string[]);
  const [correct, setCorrect] = useState(false);

  useEffect(() => {
    setInputItems(items as string[]);
  }, [items]);

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        items?.filter((item) =>
          item.toLowerCase().startsWith(inputValue?.toLowerCase() || "")
        ) as string[]
      );
    },
    onSelectedItemChange: ({ selectedItem }) => {
      let answer = false;
      if (insensitiveMatch(selectedItem || "", cell)) {
        answer = true;
      }
      changeEvt({
        target: {
          id: parseInt(id),
          value: selectedItem,
          answer: answer.toString(),
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
      setCorrect(answer);
    },
  });

  return (
    <div className="relative">
      <label {...getLabelProps({ htmlFor: name, className: "sr-only" })}>
        Enter an actor:
      </label>
      <div className="flex">
        <input
          {...getInputProps({
            autoComplete: "off",
            spellCheck: false,
            placeholder: "Enter an actor",
            id: id,
            name: name,
            disabled: correct,
            readOnly: correct,
            className: cn(
              "border border-gray-400 focus:border-gray-900 outline-none focus:outline-none p-2 w-full",
              {
                "rounded-tl-lg": isOpen,
                "rounded-l-lg": !isOpen,
              },
              {
                "border-green-500 bg-green-100 rounded-lg text-green-500":
                  correct,
              }
            ),
          })}
        />
        {!correct && (
          <button
            type="button"
            aria-label="toggle menu"
            {...getToggleButtonProps({
              className: cn("border border-gray-400 border-l-0 px-2", {
                "rounded-tr-lg": isOpen,
                "rounded-r-lg": !isOpen,
              }),
            })}
          >
            {isOpen ? "↑" : "↓"}
          </button>
        )}
      </div>
      <ul
        {...getMenuProps({
          className: cn(
            isOpen &&
              "absolute w-full z-50 border border-gray-900 bg-white mt-[-1px] drop-shadow-lg rounded-b-lg overflow-clip max-h-60 overflow-y-auto"
          ),
        })}
      >
        {isOpen &&
          inputItems &&
          inputItems.map((item: string, index: number) => (
            <li
              className={cn("p-2 text-gray-900 cursor-pointer text-sm", {
                "bg-gray-200": highlightedIndex === index,
              })}
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {item}
            </li>
          ))}
        {isOpen && inputItems.length == 0 && (
          <li className="p-2 text-gray-900 cursor-pointer text-sm">
            No results
          </li>
        )}
      </ul>
    </div>
  );
}
