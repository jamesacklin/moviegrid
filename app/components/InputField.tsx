import { useState, useEffect } from "react";
import cn from "classnames";
import { Command } from "cmdk";
import _ from "lodash";

export default function InputField(props: any) {
  const { items, id, name } = props;
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const handleBlur = (e: any, value: string) => {
    if (e.relatedTarget && e.relatedTarget.classList.contains("listbox")) {
      setValue(value);
      setTimeout(() => {
        setOpen(false);
      }, 100);
    } else {
      setOpen(false);
    }
  };

  const handleSet = (value: string) => {
    const match = items.findIndex(
      (item: string) => value.toLowerCase() === item[0].toLowerCase()
    );
    console.log(match);
  };

  return (
    <Command label="Select an actor" className="relative">
      <Command.Input
        id={id}
        name={name}
        value={value}
        onValueChange={(v) => setValue(v)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => handleBlur(e, value)}
        placeholder="Type or select an actor"
        className="text-base border-2 border-gray-200 rounded-md w-full py-1.5 px-3 text-gray-900 focus:outline-none focus:bg-white focus:rounded-b-none focus:border-gray-600"
      />
      <Command.List
        tabIndex={-1}
        className={cn(
          "bg-white rounded-b-md border-2 border-gray-600 overflow-clip drop-shadow-lg absolute w-full mt-[-2px] z-50 content listbox",
          !open && "hidden"
        )}
      >
        <Command.Empty className="text-gray-900 text-sm px-3 py-2">
          No one here by that name.
        </Command.Empty>
        {items.map((item: any) => (
          <Command.Item
            value={item}
            className="text-sm px-3 py-2 text-gray-900 hover:bg-gray-200 cursor-pointer"
            onSelect={(v) => {
              handleSet(v);
            }}
            key={item}
          >
            {item}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
}
