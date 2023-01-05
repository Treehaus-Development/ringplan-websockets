const makeExtensionsHtml = (data) => {
  return data
    .map((item) => {
      return `
            <div class="flex justify-between items-center">
              <div class="flex gap-2 items-center">
                <input
                  class="peer input-ext"
                  type="radio"
                  id=${item._id}
                  value=${item.data.extension}
                  name="extension"
                />
                <label
                  for=${item._id}
                  class="text-sm relative font-medium pl-10 duration-200 ease-in transition-colors
                  select-none text-[#3C3C3C] cursor-pointer peer-checked:text-[#3B9EF7]
                  "
                >
                  ${item.data.extension}
                </label>
              </div>
              <div
                id="edit-ext-${item._id}" 
                data-caller-id="${item.outbound_callerid?.number}"
                data-name="${item.data.name}"
                data-location_id="${item.location?.id}"
                class="cursor-pointer"
              >
                <img src="/images/edit.svg"/>
              </div>
            </div>     
        `;
    })
    .join(" ");
};
