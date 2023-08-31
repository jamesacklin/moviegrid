import Downshift from "downshift";

export default function InputField(props: any) {
  const { items, id, name } = props;

  return (
    <>
      <Downshift itemToString={(item) => (item ? item.value : "")}>
        {({
          getInputProps,
          getItemProps,
          getLabelProps,
          getMenuProps,
          isOpen,
          inputValue,
          getRootProps,
        }) => (
          <div className="relative">
            <label {...getLabelProps()} className="sr-only">
              Enter an actor
            </label>

            <div
              className="h-10 w-48 flex justify-between items-center"
              {...getRootProps({}, { suppressRefError: true })}
            >
              <input
                className="w-full px-3 py-2 m-0 bg-gray-100 border-2 rounded-md focus:bg-white focus:outline-none focus:border-blue-500"
                {...getInputProps({ id: id, name: name })}
              />
            </div>
            <ul
              className="bg-white z-50 absolute w-full shadow-lg mt-1 rounded-md overflow-clip"
              {...getMenuProps()}
            >
              {isOpen
                ? items
                    .filter(
                      (item: any) =>
                        !inputValue || item.value.includes(inputValue)
                    )
                    .map((item: any, index: number) => (
                      <li
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                        key={item.value}
                        {...getItemProps({
                          index,
                          item,
                        })}
                      >
                        {item.value}
                      </li>
                    ))
                : null}
            </ul>
          </div>
        )}
      </Downshift>
    </>
  );
}
