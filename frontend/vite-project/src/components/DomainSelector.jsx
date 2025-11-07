import React from "react";

const DomainSelector = ({ domains, selected, setSelected }) => {
  return (
    <div className="flex gap-4 items-center">
      <label htmlFor="domain" className="font-semibold">Select Domain:</label>
      <select
        id="domain"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="bg-gray-800 px-3 py-2 rounded-lg text-white"
      >
        <option value="">-- Select --</option>
        {domains.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DomainSelector;
